const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Version ultra-robuste avec gestion parfaite des promesses
function sqlQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.query(sql, params, (error, results, fields) => {
      if (error) {
        console.error('SQL Error:', { sql, params, error });
        return reject(new Error('Database operation failed'));
      }
      resolve(results);
    });
  });
}

// Récupérer toutes les équipes
router.get('/', async (req, res, next) => {
  try {
    const results = await sqlQuery('SELECT * FROM equipes');
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

// Récupérer les équipes d'un employé
router.get('/employee/:employeeId', async (req, res, next) => {
  try {
    const { employeeId } = req.params;
    const results = await sqlQuery(
      `SELECT e.* FROM equipes e
       JOIN employe_equipe ee ON e.id = ee.equipe_id
       WHERE ee.employe_id = ?`,
      [employeeId]
    );
    res.status(200).json(results);
  } catch (error) {
    next(error);
  }
});

// Ajouter un employé à une équipe
router.post('/add-employee', async (req, res, next) => {
  try {
    const { employeeId, teamId } = req.body;
    
    if (!employeeId || !teamId) {
      return res.status(400).json({ 
        error: 'Bad Request',
        message: 'employeeId and teamId are required'
      });
    }

    await sqlQuery(
      'INSERT INTO employe_equipe (employe_id, equipe_id) VALUES (?, ?)',
      [employeeId, teamId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Employee added to team successfully'
    });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({
        error: 'Conflict',
        message: 'Employee already exists in this team'
      });
    }
    next(error);
  }
});

// Retirer un employé d'une équipe
router.delete('/remove-employee', async (req, res, next) => {
  try {
    const { employeeId, teamId } = req.body;
    
    if (!employeeId || !teamId) {
      return res.status(400).json({
        error: 'Bad Request',
        message: 'employeeId and teamId are required'
      });
    }

    const { affectedRows } = await sqlQuery(
      'DELETE FROM employe_equipe WHERE employe_id = ? AND equipe_id = ?',
      [employeeId, teamId]
    );
    
    if (affectedRows === 0) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'No matching employee-team association found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'Employee removed from team successfully'
    });
  } catch (error) {
    next(error);
  }
});

// Middleware de gestion d'erreurs centralisé
router.use((error, req, res, next) => {
  console.error('Global Error Handler:', error);
  res.status(500).json({
    error: 'Internal Server Error',
    message: 'An unexpected error occurred'
  });
});

module.exports = router;