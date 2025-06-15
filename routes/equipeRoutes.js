const express = require('express');
const router = express.Router();
const db = require('../config/db');


router.get('/', (req, res) => {
  db.query('SELECT id, name FROM equipes WHERE manager IS NOT NULL', (err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;