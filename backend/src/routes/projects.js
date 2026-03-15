const express = require('express');
const projectController = require('../controllers/projectController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All project routes require authentication
router.use(authenticateToken);

router.post('/', projectController.createProject);
router.get('/', projectController.getProjects);
router.get('/:id', projectController.getProject);
router.put('/:id', projectController.updateProject);
router.delete('/:id', projectController.deleteProject);

module.exports = router;
