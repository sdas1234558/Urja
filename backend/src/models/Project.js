const pool = require('../config');

class Project {
  static SORT_COLUMNS = {
    updated_at: 'updated_at',
    created_at: 'created_at',
    name: 'name',
    payback_years: 'payback_years',
    annual_savings: 'annual_savings',
    total_capex: 'total_capex',
  };

  static async create(userId, projectData) {
    const {
      name,
      description,
      facilityType,
      infrastructureStatus,
      roofSpace,
      solarAllocation,
      windTurbines,
      totalCapex,
      annualSavings,
      paybackYears,
      co2Offset,
      chartData,
    } = projectData;

    const result = await pool.query(
      `INSERT INTO projects (
        user_id, name, description, facility_type, infrastructure_status,
        roof_space, solar_allocation, wind_turbines, total_capex,
        annual_savings, payback_years, co2_offset, chart_data, created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING *`,
      [
        userId,
        name,
        description,
        facilityType,
        infrastructureStatus,
        roofSpace,
        solarAllocation,
        windTurbines,
        totalCapex,
        annualSavings,
        paybackYears,
        co2Offset,
        JSON.stringify(chartData),
      ]
    );
    return result.rows[0];
  }

  static async findByUserIdAndProjectId(userId, projectId) {
    const result = await pool.query(
      'SELECT * FROM projects WHERE id = $1 AND user_id = $2',
      [projectId, userId]
    );
    return result.rows[0];
  }

  static async findAllByUserId(userId) {
    const result = await pool.query(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC',
      [userId]
    );
    return result.rows;
  }

  static async findAllByUserIdWithOptions(userId, options = {}) {
    const {
      search = '',
      sortBy = 'updated_at',
      sortOrder = 'desc',
      limit = 100,
      offset = 0,
    } = options;

    const normalizedSortBy = Project.SORT_COLUMNS[sortBy] || Project.SORT_COLUMNS.updated_at;
    const normalizedSortOrder = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    const normalizedLimit = Number.isFinite(limit) ? Math.min(Math.max(limit, 1), 200) : 100;
    const normalizedOffset = Number.isFinite(offset) ? Math.max(offset, 0) : 0;

    const values = [userId];
    let whereClause = 'WHERE user_id = $1';

    if (search.trim()) {
      values.push(`%${search.trim()}%`);
      whereClause += ` AND (name ILIKE $${values.length} OR COALESCE(description, '') ILIKE $${values.length})`;
    }

    values.push(normalizedLimit);
    values.push(normalizedOffset);

    const query = `
      SELECT *
      FROM projects
      ${whereClause}
      ORDER BY ${normalizedSortBy} ${normalizedSortOrder}
      LIMIT $${values.length - 1}
      OFFSET $${values.length}
    `;

    const result = await pool.query(query, values);
    return result.rows;
  }

  static async updateById(userId, projectId, projectData) {
    const {
      name,
      description,
      facilityType,
      infrastructureStatus,
      roofSpace,
      solarAllocation,
      windTurbines,
      totalCapex,
      annualSavings,
      paybackYears,
      co2Offset,
      chartData,
    } = projectData;

    const result = await pool.query(
      `UPDATE projects SET
        name = $1, description = $2, facility_type = $3, infrastructure_status = $4,
        roof_space = $5, solar_allocation = $6, wind_turbines = $7, total_capex = $8,
        annual_savings = $9, payback_years = $10, co2_offset = $11, chart_data = $12,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $13 AND user_id = $14
      RETURNING *`,
      [
        name,
        description,
        facilityType,
        infrastructureStatus,
        roofSpace,
        solarAllocation,
        windTurbines,
        totalCapex,
        annualSavings,
        paybackYears,
        co2Offset,
        JSON.stringify(chartData),
        projectId,
        userId,
      ]
    );
    return result.rows[0];
  }

  static async deleteById(userId, projectId) {
    const result = await pool.query(
      'DELETE FROM projects WHERE id = $1 AND user_id = $2 RETURNING id',
      [projectId, userId]
    );
    return result.rows[0];
  }
}

module.exports = Project;
