const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all team members (this is a mock, you'll need to adjust based on your actual user/team structure)
router.get('/', (req, res) => {
  db.query(`
    SELECT email, name, role 
    FROM membres_equipe 
    WHERE role IN ('Chef de projet', 'Développeur', 'Designer')
  `, (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;