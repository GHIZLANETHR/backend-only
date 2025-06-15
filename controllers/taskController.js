const Task = require('../models/Task');

exports.getAllTasks = (req, res) => {
  Task.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Convertir les labels de JSON string à array
    const tasks = results.map(task => ({
      ...task,
      labels: task.labels ? JSON.parse(task.labels) : []
    }));
    
    res.json(tasks);
  });
};

exports.getTaskById = (req, res) => {
  Task.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Tâche non trouvée' });
    
    const task = {
      ...results[0],
      labels: results[0].labels ? JSON.parse(results[0].labels) : []
    };
    
    res.json(task);
  });
};

exports.createTask = (req, res) => {
  // Validation simple
  if (!req.body.name || !req.body.assignedTo || !req.body.project || !req.body.dueDate || !req.body.status) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }

  Task.create(req.body, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    
    Task.getById(result.insertId, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const task = {
        ...results[0],
        labels: results[0].labels ? JSON.parse(results[0].labels) : []
      };
      
      res.status(201).json(task);
    });
  });
};

exports.updateTask = (req, res) => {
  const { id } = req.params;
  
  Task.update(id, req.body, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    
    Task.getById(id, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const task = {
        ...results[0],
        labels: results[0].labels ? JSON.parse(results[0].labels) : []
      };
      
      res.json(task);
    });
  });
};

exports.deleteTask = (req, res) => {
  Task.delete(req.params.id, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Tâche supprimée avec succès' });
  });
};