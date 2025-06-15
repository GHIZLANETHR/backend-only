const employeeTasksModel = require('../models/employeeTasksModel');

/**
 * Get all tasks assigned to the logged-in employee
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with tasks
 */
exports.getEmployeeTasks = async (req, res) => {
  try {
    // Get the user ID from the authentication middleware
    const userId = req.user.id;
    
    // Check if the user has the employee role
    if (req.user.role !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Employee role required.'
      });
    }
    
    const tasks = await employeeTasksModel.getEmployeeTasks(userId);
    
    return res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (error) {
    console.error('Error fetching employee tasks:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération des tâches',
      error: error.message
    });
  }
};

/**
 * Update the status of a task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with update status
 */
exports.updateTaskStatus = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { status } = req.body;
    
    // Validate input
    if (!taskId || !status) {
      return res.status(400).json({
        success: false,
        message: 'Task ID and status are required'
      });
    }
    
    // Validate status value
    const validStatuses = ['OUVERT', 'EN COURS', 'RÉVISION', 'TERMINÉ'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be one of: OUVERT, EN COURS, RÉVISION, TERMINÉ'
      });
    }
    
    await employeeTasksModel.updateTaskStatus(taskId, status);
    
    return res.status(200).json({
      success: true,
      message: 'Status de la tâche mis à jour avec succès'
    });
  } catch (error) {
    console.error('Error updating task status:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la mise à jour du statut',
      error: error.message
    });
  }
};

/**
 * Save feedback for a completed task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with feedback status
 */
exports.saveFeedback = async (req, res) => {
  try {
    const { taskId } = req.params;
    const { mood, comment } = req.body;
    const userId = req.user.id;
    
    // Validate input
    if (!taskId || !mood) {
      return res.status(400).json({
        success: false,
        message: 'Task ID and mood are required'
      });
    }
    
    // Validate mood value
    const validMoods = ['excellent', 'bon', 'neutre', 'stresse', 'epuise'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: 'Mood must be one of: excellent, bon, neutre, stresse, epuise'
      });
    }
    
    await employeeTasksModel.saveFeedback(taskId, userId, mood, comment || null);
    
    return res.status(200).json({
      success: true,
      message: 'Feedback enregistré avec succès'
    });
  } catch (error) {
    console.error('Error saving feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'enregistrement du feedback',
      error: error.message
    });
  }
};

/**
 * Get feedback for a specific task
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with feedback data
 */
exports.getFeedback = async (req, res) => {
  try {
    const { taskId } = req.params;
    const userId = req.user.id;
    
    const feedback = await employeeTasksModel.getFeedback(taskId, userId);
    
    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du feedback',
      error: error.message
    });
  }
};
