// routes/protectedRoutes.js
const express = require('express');
const { verifyToken, checkRole } = require('../middlewares/authMiddleware');
const router = express.Router();

// Route Admindash exact
router.get('/Admindash', verifyToken, checkRole('admin'), (req, res) => {
  res.send('Bienvenue sur Admindash');
});

// Route Taskse exact
router.get('/Taskse', verifyToken, checkRole('employee'), (req, res) => {
  res.send('Bienvenue sur Taskse');
});

module.exports = router;