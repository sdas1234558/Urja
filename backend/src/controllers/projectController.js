const Project = require('../models/Project');

const parseListQuery = (query) => {
  const parsedLimit = Number.parseInt(query.limit, 10);
  const parsedOffset = Number.parseInt(query.offset, 10);

  return {
    search: typeof query.search === 'string' ? query.search : '',
    sortBy: typeof query.sortBy === 'string' ? query.sortBy : 'updated_at',
    sortOrder: typeof query.sortOrder === 'string' ? query.sortOrder : 'desc',
    limit: Number.isNaN(parsedLimit) ? 100 : parsedLimit,
    offset: Number.isNaN(parsedOffset) ? 0 : parsedOffset,
  };
};

const projectNotFound = (res) => {
  return res.status(404).json({ error: 'Project not found' });
};

const createProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectData = req.body;

    if (!projectData.name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = await Project.create(userId, projectData);
    res.status(201).json({
      message: 'Project created successfully',
      project,
    });
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Server error while creating project' });
  }
};

const getProjects = async (req, res) => {
  try {
    const userId = req.user.id;
    const queryOptions = parseListQuery(req.query);
    const hasAdvancedQuery =
      Boolean(req.query.search) ||
      Boolean(req.query.sortBy) ||
      Boolean(req.query.sortOrder) ||
      Boolean(req.query.limit) ||
      Boolean(req.query.offset);

    const projects = hasAdvancedQuery
      ? await Project.findAllByUserIdWithOptions(userId, queryOptions)
      : await Project.findAllByUserId(userId);

    res.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Server error while fetching projects' });
  }
};

const getProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    const project = await Project.findByUserIdAndProjectId(userId, projectId);
    if (!project) {
      return projectNotFound(res);
    }

    res.json({ project });
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Server error while fetching project' });
  }
};

const updateProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;
    const projectData = req.body;

    // Verify project belongs to user
    const existingProject = await Project.findByUserIdAndProjectId(userId, projectId);
    if (!existingProject) {
      return projectNotFound(res);
    }

    const updatedProject = await Project.updateById(userId, projectId, projectData);
    res.json({
      message: 'Project updated successfully',
      project: updatedProject,
    });
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Server error while updating project' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const userId = req.user.id;
    const projectId = req.params.id;

    // Verify project belongs to user
    const existingProject = await Project.findByUserIdAndProjectId(userId, projectId);
    if (!existingProject) {
      return projectNotFound(res);
    }

    await Project.deleteById(userId, projectId);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Server error while deleting project' });
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
};
