const Project = require('../models/project');

exports.getAllProjects = (req, res) => {
  Project.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

exports.getProjectById = (req, res) => {
  Project.getById(req.params.id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!result) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(result);
  });
};

exports.createProject = (req, res) => {
  const project = req.body;
  Project.create(project, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ id: result.insertId, ...project });
  });
};

exports.updateProject = (req, res) => {
  const project = req.body;
  Project.update(req.params.id, project, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ id: req.params.id, ...project });
  });
};

exports.deleteProject = (req, res) => {
  Project.delete(req.params.id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.status(204).send();
  });
};