const Employee = require('../models/Employee');

// Récupérer tous les employés
exports.getAllEmployees = (req, res) => {
  Employee.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Récupérer un employé par ID
exports.getEmployeeById = (req, res) => {
  const { id } = req.params;
  
  Employee.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!result) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }
    res.json(result);
  });
};

// Créer un employé
exports.createEmployee = (req, res) => {
  const { nom, prenom, telephone, adresse, departement, statut } = req.body;

  // Validation des champs obligatoires
  if (!nom || !prenom || !departement) {
    return res.status(400).json({ error: "Le nom, prénom et département sont requis" });
  }

  Employee.create({ 
    nom, 
    prenom, 
    telephone, 
    adresse, 
    departement,
    statut: statut || 'actif'
  }, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      id: result.insertId, 
      nom, 
      prenom, 
      telephone, 
      adresse, 
      departement,
      statut: statut || 'actif',
      date_embauche: new Date()
    });
  });
};

// Mettre à jour un employé
exports.updateEmployee = (req, res) => {
  const { id } = req.params;
  const employeeData = req.body;

  Employee.update(id, employeeData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }
    res.json({ message: 'Employé mis à jour' });
  });
};

// Supprimer un employé
exports.deleteEmployee = (req, res) => {
  const { id } = req.params;

  Employee.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Employé non trouvé" });
    }
    res.json({ message: 'Employé supprimé' });
  });
};