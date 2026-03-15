import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/projects-modal.css';

export function ProjectsModal({ isOpen, onClose, onLoadProject, currentCalculation }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [saveMode, setSaveMode] = useState(false);
  const [search, setSearch] = useState('');
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');

  // Load projects when modal opens
  useEffect(() => {
    if (isOpen && !saveMode) {
      loadProjects();
    }
  }, [isOpen, saveMode, search]);

  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.getProjects({
        search,
        limit: 200,
      });
      setProjects(response.projects || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProject = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const projectData = await api.loadProject(projectId);
      onLoadProject(projectData);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) {
      setError('Project name is required');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await api.saveProject(newProjectName, currentCalculation, newProjectDesc);
      setNewProjectName('');
      setNewProjectDesc('');
      setSaveMode(false);
      // Reload projects list
      await loadProjects();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project?')) {
      return;
    }

    try {
      await api.deleteProject(projectId);
      await loadProjects();
    } catch (err) {
      setError(err.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{saveMode ? 'Save Project' : 'My Projects'}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        {error && <div className="modal-error">{error}</div>}

        {saveMode ? (
          // Save Mode
          <form onSubmit={handleSaveProject} className="save-form">
            <div className="form-group">
              <label htmlFor="projectName">Project Name *</label>
              <input
                id="projectName"
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="e.g., Solar Retrofit 2024"
                disabled={loading}
                autoFocus
              />
            </div>

            <div className="form-group">
              <label htmlFor="projectDesc">Description</label>
              <textarea
                id="projectDesc"
                value={newProjectDesc}
                onChange={(e) => setNewProjectDesc(e.target.value)}
                placeholder="Optional notes about this project..."
                disabled={loading}
                rows="3"
              />
            </div>

            <div className="modal-actions">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSaveMode(false)}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Project'}
              </button>
            </div>
          </form>
        ) : (
          // Load Mode
          <>
            <div className="projects-toolbar">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or description"
                className="toolbar-input"
              />
            </div>

            <div className="projects-list">
              {loading && <div className="loading">Loading projects...</div>}
              {!loading && projects.length === 0 && (
                <div className="empty-state">
                  <p>No projects yet.</p>
                  <p style={{ fontSize: '12px', color: '#999' }}>
                    Save your first project to see it here.
                  </p>
                </div>
              )}
              {projects.map(project => (
                <div key={project.id} className="project-card">
                  <div className="project-info">
                    <h3>{project.name}</h3>
                    {project.description && (
                      <p className="description">{project.description}</p>
                    )}
                    <div className="project-meta">
                      <span className="meta-item">
                        <strong>₹{(project.total_capex / 100000).toFixed(1)}L</strong> CapEx
                      </span>
                      <span className="meta-item">
                        <strong>{project.payback_years?.toFixed(1)}</strong> year payback
                      </span>
                      <span className="meta-item">
                        Saved {new Date(project.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="project-actions">
                    <button
                      className="btn-load"
                      onClick={() => handleLoadProject(project.id)}
                      disabled={loading}
                    >
                      Load
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteProject(project.id)}
                      disabled={loading}
                      title="Delete project"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="modal-actions">
              <button
                className="btn-secondary"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="btn-primary"
                onClick={() => setSaveMode(true)}
              >
                Save Current Project
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
