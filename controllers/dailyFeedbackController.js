// controllers/dailyFeedbackController.js
const dailyFeedbackModel = require('../models/dailyFeedbackModel');

/**
 * Enregistrer le feedback quotidien de l'utilisateur connecté
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response avec le statut d'enregistrement
 */
exports.saveDailyFeedback = async (req, res) => {
  try {
    const { mood, comment } = req.body;
    const userId = req.user.id;
    
    // Validation des entrées
    if (!mood) {
      return res.status(400).json({
        success: false,
        message: 'L\'humeur est requise'
      });
    }
    
    // Validation de la valeur d'humeur
    const validMoods = ['excellent', 'bon', 'neutre', 'stresse', 'epuise'];
    if (!validMoods.includes(mood)) {
      return res.status(400).json({
        success: false,
        message: 'L\'humeur doit être: excellent, bon, neutre, stresse, ou epuise'
      });
    }
    
    await dailyFeedbackModel.saveDailyFeedback(userId, mood, comment || null);
    
    return res.status(200).json({
      success: true,
      message: 'Feedback quotidien enregistré avec succès'
    });
  } catch (error) {
    console.error('Error saving daily feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de l\'enregistrement du feedback',
      error: error.message
    });
  }
};

/**
 * Récupérer le feedback quotidien de l'utilisateur connecté
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response avec les données de feedback
 */
exports.getDailyFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const { date } = req.query; // Format: YYYY-MM-DD
    
    const feedback = await dailyFeedbackModel.getDailyFeedback(userId, date);
    
    return res.status(200).json({
      success: true,
      data: feedback
    });
  } catch (error) {
    console.error('Error fetching daily feedback:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération du feedback',
      error: error.message
    });
  }
};

/**
 * Récupérer l'historique des feedbacks quotidiens
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object} JSON response avec l'historique des feedbacks
 */
exports.getDailyFeedbackHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const { limit } = req.query;
    
    const history = await dailyFeedbackModel.getDailyFeedbackHistory(
      userId, 
      limit ? parseInt(limit) : 30
    );
    
    return res.status(200).json({
      success: true,
      count: history.length,
      data: history
    });
  } catch (error) {
    console.error('Error fetching daily feedback history:', error);
    return res.status(500).json({
      success: false,
      message: 'Une erreur est survenue lors de la récupération de l\'historique',
      error: error.message
    });
  }
};