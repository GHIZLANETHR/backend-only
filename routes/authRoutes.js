// routes/authRoutes.js
const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');

const router = express.Router();

// Route d'inscription
router.post('/signup', [
  body('email').isEmail().withMessage('Email invalide'),
  body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
], authController.signup);

// Route de connexion
router.post('/login', authController.login);
// Route de déconnexion
router.post('/logout', (req, res) => {
  try {
    // Si vous utilisez des sessions
    if (req.session) {
      req.session.destroy((err) => {
        if (err) {
          return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la déconnexion' 
          });
        }
        
        // Supprimer le cookie de session
        res.clearCookie('connect.sid'); // Nom par défaut du cookie de session
        
        return res.status(200).json({ 
          success: true, 
          message: 'Déconnexion réussie' 
        });
      });
    } else {
      // Si vous utilisez JWT sans sessions
      res.status(200).json({ 
        success: true, 
        message: 'Déconnexion réussie' 
      });
    }
  } catch (error) {
    console.error('Erreur de déconnexion:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
});

module.exports = router;
