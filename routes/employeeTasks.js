const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/authMiddleware');


// Récupérer les tâches d'un employé
router.get('/employee-tasks/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      t.id,
      t.name as title,
      t.dueDate as deadline,
      t.status,
      t.description,
      t.estimatedHours,
      t.loggedHours,
      t.labels,
      p.nom as projectName,
      c.nom as clientName,
      eq.name as teamName
    FROM tasks t
    JOIN projects p ON t.project = p.id
    JOIN clients c ON p.clientId = c.id
    JOIN equipes eq ON t.assignedTo = eq.id
    JOIN employe_equipe ee ON eq.id = ee.equipe_id
    JOIN employes emp ON ee.employe_id = emp.id
    WHERE emp.user_id = ?
    ORDER BY t.dueDate ASC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });

    const formattedTasks = results.map(task => ({
      id: task.id,
      title: task.title,
      deadline: new Date(task.deadline).toLocaleDateString('fr-FR'),
      status: task.status,
      description: task.description,
      estimatedHours: task.estimatedHours,
      loggedHours: task.loggedHours,
      projectName: task.projectName,
      clientName: task.clientName,
      teamName: task.teamName,
      labels: task.labels ? JSON.parse(task.labels) : []
    }));

    res.json(formattedTasks);
  });
});

// Sauvegarder un feedback
router.post('/feedback', (req, res) => {
  const { taskId, userId, mood, comment } = req.body;

  const checkQuery = 'SELECT id FROM feedbacks WHERE task_id = ? AND user_id = ?';

  db.query(checkQuery, [taskId, userId], (err, existing) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });

    if (existing.length > 0) {
      const updateQuery = `
        UPDATE feedbacks 
        SET mood = ?, comment = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE task_id = ? AND user_id = ?
      `;

      db.query(updateQuery, [mood, comment, taskId, userId], (err) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json({ message: 'Feedback mis à jour avec succès' });
      });
    } else {
      const insertQuery = 'INSERT INTO feedbacks (task_id, user_id, mood, comment) VALUES (?, ?, ?, ?)';

      db.query(insertQuery, [taskId, userId, mood, comment], (err, result) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json({ message: 'Feedback créé avec succès', id: result.insertId });
      });
    }
  });
});

// Récupérer les feedbacks d’un utilisateur
router.get('/feedbacks/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      f.id,
      f.task_id as taskId,
      f.mood,
      f.comment,
      f.created_at as createdAt,
      f.updated_at as updatedAt,
      t.name as taskName
    FROM feedbacks f
    JOIN tasks t ON f.task_id = t.id
    WHERE f.user_id = ?
    ORDER BY f.updated_at DESC
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(results);
  });
});

// Récupérer les infos de l'employé
router.get('/employee-info/:userId', (req, res) => {
  const userId = req.params.userId;

  const query = `
    SELECT 
      emp.id,
      emp.nom,
      emp.prenom,
      emp.departement,
      eq.name as teamName
    FROM employes emp
    LEFT JOIN employe_equipe ee ON emp.id = ee.employe_id
    LEFT JOIN equipes eq ON ee.equipe_id = eq.id
    WHERE emp.user_id = ?
  `;

  db.query(query, [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });

    if (results.length === 0) {
      return res.status(404).json({ error: 'Employé non trouvé' });
    }

    res.json(results[0]);
  });
});

module.exports = router;