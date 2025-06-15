const express = require('express');
const router = express.Router();
const db = require('../config/db');

// 1. Statistiques générales du dashboard
router.get('/dashboard/stats', (req, res) => {
  const queries = [
    // Total employés (users avec role 'employee')
    "SELECT COUNT(*) as count FROM employes",
    
    // Total clients
    "SELECT COUNT(*) as count FROM clients",
    
    // Total projets
    "SELECT COUNT(*) as count FROM projects",
    
    // Clients actifs
    "SELECT COUNT(*) as count FROM clients WHERE statut = 'actif'",
    
    // Projets en cours
    "SELECT COUNT(*) as count FROM projects WHERE statut = 'En cours'",
    
    // Projets terminés
    "SELECT COUNT(*) as count FROM projects WHERE statut = 'Terminé'",
    
    // Projets annulés
    "SELECT COUNT(*) as count FROM projects WHERE statut = 'Annulé'",
    
    // Factures payées (montant total)
    "SELECT COALESCE(SUM(montant), 0) as total FROM factures WHERE statut = 'Payée'",
    
    // Factures impayées (montant total)
    "SELECT COALESCE(SUM(montant), 0) as total FROM factures WHERE statut IN ('En attente', 'En retard')",
    
    // Tâches urgentes (échéance dans les 3 prochains jours)
    "SELECT COUNT(*) as count FROM tasks WHERE dueDate <= DATE_ADD(CURDATE(), INTERVAL 3 DAY) AND status != 'TERMINÉ'"
  ];

  // Exécuter toutes les requêtes en parallèle
  Promise.all(queries.map(query => {
    return new Promise((resolve, reject) => {
      db.query(query, (err, results) => {
        if (err) reject(err);
        else resolve(results[0]);
      });
    });
  }))
  .then(results => {
    const stats = {
      totalEmployees: results[0].count,
      totalClients: results[1].count,
      totalProjects: results[2].count,
      activeClients: results[3].count,
      projectsInProgress: results[4].count,
      completedProjects: results[5].count,
      cancelledProjects: results[6].count,
      paidInvoices: results[7].total,
      unpaidInvoices: results[8].total,
      urgentTasks: results[9].count
    };
    res.json(stats);
  })
  .catch(error => {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  });
});

// 2. Feedbacks par tâche avec informations complètes
router.get('/dashboard/task-moods', (req, res) => {
  const { employee_id, period } = req.query;
  
  let query = `
    SELECT 
      f.id,
      f.task_id,
      f.user_id,
      f.mood,
      f.comment,
      f.created_at,
      u.name as employee_name,
      t.name as task_name,
      p.nom as project_name
    FROM feedbacks f
    JOIN users u ON f.user_id = u.id
    JOIN tasks t ON f.task_id = t.id
    JOIN projects p ON t.project = p.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (employee_id && employee_id !== 'all') {
    query += ' AND f.user_id = ?';
    params.push(employee_id);
  }
  
  if (period) {
    switch (period) {
      case 'today':
        query += ' AND DATE(f.created_at) = CURDATE()';
        break;
      case 'week':
        query += ' AND f.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        break;
      case 'month':
        query += ' AND f.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        break;
    }
  }
  
  query += ' ORDER BY f.created_at DESC';
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des humeurs par tâche:', err);
      res.status(500).json({ error: 'Erreur interne du serveur', details: err.message });
    } else {
      res.json(results);
    }
  });
});

// 3. Feedbacks journaliers
router.get('/dashboard/daily-moods', (req, res) => {
  const { employee_id, period } = req.query;
  
  let query = `
    SELECT 
      f.id,
      f.user_id,
      f.mood,
      f.comment,
      f.date,
      u.name as employee_name
    FROM feedbackjour f
    JOIN users u ON f.user_id = u.id
    WHERE 1=1
  `;
  
  const params = [];
  
  if (employee_id && employee_id !== 'all') {
    query += ' AND f.user_id = ?';
    params.push(employee_id);
  }
  
  if (period) {
    switch (period) {
      case 'today':
        query += ' AND f.date = CURDATE()';
        break;
      case 'week':
        query += ' AND f.date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
        break;
      case 'month':
        query += ' AND f.date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
        break;
    }
  }
  
  query += ' ORDER BY f.date DESC';
  
  db.query(query, params, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des humeurs journalières:', err);
      res.status(500).json({ error: 'Erreur interne du serveur', details: err.message });
    } else {
      res.json(results);
    }
  });
});

// 4. Statistiques des humeurs
router.get('/dashboard/mood-stats', (req, res) => {
  const { employee_id, period } = req.query;
  
  // Récupérer les stats des feedbacks par tâche
  let taskQuery = `
    SELECT mood, COUNT(*) as count 
    FROM feedbacks f
    WHERE 1=1
  `;
  
  // Récupérer les stats des feedbacks journaliers
  let dailyQuery = `
    SELECT mood, COUNT(*) as count 
    FROM feedbackjour f
    WHERE 1=1
  `;
  
  const params = [];
  
  if (employee_id && employee_id !== 'all') {
    taskQuery += ' AND f.user_id = ?';
    dailyQuery += ' AND f.user_id = ?';
    params.push(employee_id);
  }
  
  if (period) {
    switch (period) {
      case 'today':
        taskQuery += ' AND DATE(f.created_at) = CURDATE()';
        dailyQuery += ' AND f.date = CURDATE()';
        break;
      case 'week':
        taskQuery += ' AND f.created_at >= DATE_SUB(NOW(), INTERVAL 1 WEEK)';
        dailyQuery += ' AND f.date >= DATE_SUB(CURDATE(), INTERVAL 1 WEEK)';
        break;
      case 'month':
        taskQuery += ' AND f.created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)';
        dailyQuery += ' AND f.date >= DATE_SUB(CURDATE(), INTERVAL 1 MONTH)';
        break;
    }
  }
  
  taskQuery += ' GROUP BY mood';
  dailyQuery += ' GROUP BY mood';
  
  // Exécuter les deux requêtes
  Promise.all([
    new Promise((resolve, reject) => {
      db.query(taskQuery, params, (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    }),
    new Promise((resolve, reject) => {
      db.query(dailyQuery, employee_id && employee_id !== 'all' ? [employee_id] : [], (err, results) => {
        if (err) reject(err);
        else resolve(results);
      });
    })
  ])
  .then(([taskResults, dailyResults]) => {
    // Combiner les statistiques
    const moodCounts = {
      excellent: 0,
      bon: 0,
      neutre: 0,
      stresse: 0,
      epuise: 0
    };
    
    // Ajouter les counts des tâches
    taskResults.forEach(row => {
      if (moodCounts.hasOwnProperty(row.mood)) {
        moodCounts[row.mood] += row.count;
      }
    });
    
    // Ajouter les counts journaliers
    dailyResults.forEach(row => {
      if (moodCounts.hasOwnProperty(row.mood)) {
        moodCounts[row.mood] += row.count;
      }
    });
    
    res.json(moodCounts);
  })
  .catch(error => {
    console.error('Erreur lors de la récupération des statistiques d\'humeur:', error);
    res.status(500).json({ error: 'Erreur interne du serveur', details: error.message });
  });
});

// 5. Liste des employés
router.get('/dashboard/employees', (req, res) => {
  const query = "SELECT id, name FROM users WHERE role = 'employee' ORDER BY name";
  
  db.query(query, (err, results) => {
    if (err) {
      console.error('Erreur lors de la récupération des employés:', err);
      res.status(500).json({ error: 'Erreur interne du serveur', details: err.message });
    } else {
      res.json(results);
    }
  });
});

// 6. Créer un feedback pour une tâche
router.post('/dashboard/task-feedback', (req, res) => {
  const { task_id, user_id, mood, comment } = req.body;
  
  const query = 'INSERT INTO feedbacks (task_id, user_id, mood, comment) VALUES (?, ?, ?, ?)';
  const params = [task_id, user_id, mood, comment || null];
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Erreur lors de la création du feedback:', err);
      res.status(500).json({ error: 'Erreur interne du serveur', details: err.message });
    } else {
      res.json({ 
        success: true, 
        id: result.insertId,
        message: 'Feedback créé avec succès' 
      });
    }
  });
});

// 7. Créer un feedback journalier
router.post('/dashboard/daily-feedback', (req, res) => {
  const { user_id, mood, comment, date } = req.body;
  
  const query = 'INSERT INTO feedbackjour (user_id, mood, comment, date) VALUES (?, ?, ?, ?)';
  const params = [user_id, mood, comment || null, date || new Date().toISOString().split('T')[0]];
  
  db.query(query, params, (err, result) => {
    if (err) {
      console.error('Erreur lors de la création du feedback journalier:', err);
      res.status(500).json({ error: 'Erreur interne du serveur', details: err.message });
    } else {
      res.json({ 
        success: true, 
        id: result.insertId,
        message: 'Feedback journalier créé avec succès' 
      });
    }
  });
});

// 8. Route de test de l'API
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'API Dashboard fonctionnelle',
    timestamp: new Date().toISOString(),
    database: 'Connecté à MySQL'
  });
});

module.exports = router;