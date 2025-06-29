// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

// Fonction d'inscription
const signup = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Vérifier si l'utilisateur existe déjà
    userModel.getUserByEmail(email, async (err, results) => {
      if (err) return res.status(500).json({ success: false, message: 'Erreur serveur' });
      if (results.length > 0) return res.status(400).json({ success: false, message: 'Email déjà utilisé' });

      // Hachage du mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Insertion de l'utilisateur dans la base de données
      userModel.insertUser(name, email, hashedPassword, 'user', (err, result) => {
        if (err) return res.status(500).json({ success: false, message: 'Erreur lors de l’insertion' });
        res.status(200).json({ success: true, message: 'Utilisateur inscrit avec succès' });
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur lors du hachage du mot de passe' });
  }
};

// Fonction de connexion
const login = (req, res) => {
  const { email, password } = req.body;

  userModel.getUserByEmail(email, async (err, results) => {
    if (err) {
      console.error('Erreur:', err);
      return res.status(500).json({ success: false, message: 'Erreur serveur' });
    }

    if (results.length === 0) {
      return res.status(400).json({ success: false, message: 'Email introuvable' });
    }

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(400).json({ success: false, message: 'Mot de passe incorrect' });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  });
}; 

module.exports = {
  signup,
  login
};
