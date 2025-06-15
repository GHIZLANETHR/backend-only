// routes/dailyFeedback.js
const express = require('express');
const router = express.Router();
const dailyFeedbackController = require('../controllers/dailyFeedbackController');
const authMiddleware = require('../middleware/authMiddleware');

// Appliquer le middleware d'authentification à toutes les routes
router.use(authMiddleware);

// Enregistrer le feedback quotidien
router.post('/', dailyFeedbackController.saveDailyFeedback);

// Récupérer le feedback quotidien (pour aujourd'hui ou une date spécifique)
router.get('/', dailyFeedbackController.getDailyFeedback);

// Récupérer l'historique des feedbacks quotidiens
router.get('/history', dailyFeedbackController.getDailyFeedbackHistory);

module.exports = router;