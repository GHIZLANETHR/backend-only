const express = require('express');
const router = express.Router();
const connection = require('../config/db');

// GET all factures
router.get('/', (req, res) => {
  connection.query('SELECT * FROM factures', (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la récupération des factures', error: err });
    }
    res.json(results);
  });
});

// POST (ajouter) une facture
router.post('/', (req, res) => {
  const { client, montant, dateEmission, statut, emailClient } = req.body;
  const id = `FAC-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 15).toUpperCase()}`; // Générer un ID unique
  
  const query = 'INSERT INTO factures (id, client, montant, dateEmission, statut, emailClient) VALUES (?, ?, ?, ?, ?, ?)';
  connection.query(query, [id, client, montant, dateEmission, statut, emailClient], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de l\'ajout de la facture', error: err });
    }
    res.status(201).json({ message: 'Facture ajoutée avec succès', id });
  });
});

// PUT (mettre à jour) une facture
router.put('/:id', (req, res) => {
  const { id } = req.params;
  const { client, montant, dateEmission, statut, emailClient } = req.body;
  
  const query = 'UPDATE factures SET client = ?, montant = ?, dateEmission = ?, statut = ?, emailClient = ? WHERE id = ?';
  connection.query(query, [client, montant, dateEmission, statut, emailClient, id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la mise à jour de la facture', error: err });
    }
    res.json({ message: 'Facture mise à jour avec succès' });
  });
});

// DELETE (supprimer) une facture
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  
  const query = 'DELETE FROM factures WHERE id = ?';
  connection.query(query, [id], (err, results) => {
    if (err) {
      return res.status(500).json({ message: 'Erreur lors de la suppression de la facture', error: err });
    }
    res.json({ message: 'Facture supprimée avec succès' });
  });
});

module.exports = router;
