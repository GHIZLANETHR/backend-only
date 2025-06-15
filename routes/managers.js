const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Get all managers (selecting name field from equipes table)
router.get('/', (req, res) => {
  // Cette requête retourne les membres de l'équipe avec leur nom
  db.query('SELECT id, name FROM equipes', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;