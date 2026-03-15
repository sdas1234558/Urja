// API client for communicating with Urja backend
// Handles authentication, requests, and error handling

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

class APIClient {
  constructor() {
    this.token = localStorage.getItem('token') || null;
  }

  // Set token after login
  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  // Remove token on logout
  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  // Helper to add auth header to requests
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const { suppressUnauthorizedEvent = false, ...fetchOptions } = options;
    const url = `${API_BASE}${endpoint}`;

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        headers: {
          ...this.getHeaders(),
          ...fetchOptions.headers,
        },
      });

      // Handle 401 - token expired or invalid
      if (response.status === 401) {
        this.clearToken();
        if (!suppressUnauthorizedEvent) {
          window.dispatchEvent(new Event('unauthorized'));
        }
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      return response.json();
    } catch (error) {
      console.error('API Error:', error);
      if (error instanceof TypeError && /fetch/i.test(error.message)) {
        throw new Error('Unable to connect to server. Please start backend on http://localhost:3000 and try again.');
      }
      throw error;
    }
  }

  // ==================== Authentication ====================

  async register(email, password, name = '') {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      suppressUnauthorizedEvent: true,
    });
  }

  async login(email, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      suppressUnauthorizedEvent: true,
    });
    if (response.token) {
      this.setToken(response.token);
    }
    return response;
  }

  async getCurrentUser() {
    return this.request('/auth/me', {
      method: 'GET',
      suppressUnauthorizedEvent: true,
    });
  }

  async logout() {
    this.clearToken();
    // Note: logout endpoint could be added to backend if needed for server-side tracking
  }

  // ==================== Projects ====================

  async createProject(projectData) {
    return this.request('/projects', {
      method: 'POST',
      body: JSON.stringify(projectData),
    });
  }

  async getProjects(options = {}) {
    const query = new URLSearchParams();

    if (options.search) query.set('search', options.search);
    if (options.sortBy) query.set('sortBy', options.sortBy);
    if (options.sortOrder) query.set('sortOrder', options.sortOrder);
    if (Number.isFinite(options.limit)) query.set('limit', options.limit);
    if (Number.isFinite(options.offset)) query.set('offset', options.offset);

    const queryString = query.toString();
    const endpoint = queryString ? `/projects?${queryString}` : '/projects';

    return this.request(endpoint, { method: 'GET' });
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}`, { method: 'GET' });
  }

  async updateProject(projectId, projectData) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(projectData),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, { method: 'DELETE' });
  }

  // Helper to save current calculation as a project
  async saveProject(name, calculation, description = '') {
    const projectData = {
      name,
      description,
      facilityType: calculation.facilityType,
      infrastructureStatus: calculation.infrastructureStatus,
      roofSpace: calculation.roofSpace,
      solarAllocation: calculation.solarAllocation,
      windTurbines: calculation.windTurbines,
      policyPackId: calculation.policyPackId,
      totalCapex: calculation.metrics.totalCapex,
      annualSavings: calculation.metrics.annualSavings,
      paybackYears: calculation.metrics.paybackYears,
      co2Offset: calculation.metrics.co2Offset,
      chartData: calculation.chartData,
      confidenceSummary: calculation.confidenceSummary,
      decisionDrivers: calculation.decisionDrivers,
    };

    return this.createProject(projectData);
  }

  // Helper to load a project and restore calculation state
  async loadProject(projectId) {
    const data = await this.getProject(projectId);

    const loadedChartData = data.project.chart_data;
    const inferredAnalysisYears = Array.isArray(loadedChartData)
      ? Math.max(2, Math.min(25, loadedChartData.length - 1))
      : 15;

    return {
      facilityType: data.project.facility_type,
      infrastructureStatus: data.project.infrastructure_status,
      roofSpace: data.project.roof_space,
      solarAllocation: data.project.solar_allocation,
      windTurbines: data.project.wind_turbines,
      policyPackId: data.project.policy_pack_id,
      analysisYears: inferredAnalysisYears,
      metrics: {
        totalCapex: data.project.total_capex,
        annualSavings: data.project.annual_savings,
        paybackYears: data.project.payback_years,
        co2Offset: data.project.co2_offset,
      },
      chartData: loadedChartData,
    };
  }
}

// Export singleton instance
export default new APIClient();
