// controllers/clientController.js
const Client = require('../models/Client');

// Récupérer tous les clients
exports.getAllClients = (req, res) => {
  Client.getAll((err, results) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Récupérer un client par ID
exports.getClientById = (req, res) => {
  const { id } = req.params;
  
  Client.getById(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (!result) {
      return res.status(404).json({ error: "Client non trouvé" });
    }
    res.json(result);
  });
};

// Créer un client
exports.createClient = (req, res) => {
  const { nom, email, telephone, entreprise, adresse, ville, code_postal, pays, statut, type_client, notes } = req.body;

  // Validation des champs obligatoires
  if (!nom || !email) {
    return res.status(400).json({ error: "Le nom et l'email sont requis" });
  }

  Client.create({ 
    nom, 
    email, 
    telephone, 
    entreprise, 
    adresse, 
    ville, 
    code_postal, 
    pays, 
    statut: statut || 'Actif', 
    type_client: type_client || 'Standard', 
    notes 
  }, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({ 
      id: result.insertId, 
      nom, 
      email, 
      telephone, 
      entreprise, 
      adresse, 
      ville, 
      code_postal, 
      pays, 
      statut: statut || 'Actif', 
      type_client: type_client || 'Standard', 
      notes,
      date_inscription: new Date()
    });
  });
};

// Mettre à jour un client
exports.updateClient = (req, res) => {
  const { id } = req.params;
  const clientData = req.body;

  Client.update(id, clientData, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Client non trouvé" });
    }
    res.json({ message: 'Client mis à jour' });
  });
};

// Supprimer un client
exports.deleteClient = (req, res) => {
  const { id } = req.params;

  Client.delete(id, (err, result) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Client non trouvé" });
    }
    res.json({ message: 'Client supprimé' });
  });
};