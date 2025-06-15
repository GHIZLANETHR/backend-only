const express = require('express');
const router = express.Router();
const employeeTasksController = require('../controllers/employeeTasksController');
const authMiddleware = require('../middleware/authMiddleware');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Get tasks for the logged-in employee
router.get('/', employeeTasksController.getEmployeeTasks);

// Update task status
router.put('/:taskId/status', employeeTasksController.updateTaskStatus);

// Save feedback for a task
router.post('/:taskId/feedback', employeeTasksController.saveFeedback);

// Get feedback for a task
router.get('/:taskId/feedback', employeeTasksController.getFeedback);



module.exports = router;