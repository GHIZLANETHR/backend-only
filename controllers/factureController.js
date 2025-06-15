const Facture = require('../models/Facture');

exports.getAllFactures = (req, res) => {
  Facture.getAll((err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    // Formater les dates si nécessaire
    const factures = results.map(facture => ({
      ...facture,
      dateEmission: formatDate(facture.date_emission) // Conversion de date
    }));
    
    res.json(factures);
  });
};

exports.getFactureById = (req, res) => {
  Facture.getById(req.params.id, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    if (results.length === 0) return res.status(404).json({ error: 'Facture non trouvée' });
    
    const facture = {
      ...results[0],
      dateEmission: formatDate(results[0].date_emission)
    };
    
    res.json(facture);
  });
};

exports.createFacture = (req, res) => {
  // Validation basique
  if (!req.body.client || !req.body.montant || !req.body.dateEmission || !req.body.statut) {
    return res.status(400).json({ error: 'Tous les champs obligatoires doivent être remplis' });
  }

  Facture.create(req.body, (err, result) => {
    if (err) return res.status(400).json({ error: err.message });
    
    Facture.getById(result.insertId, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const facture = {
        ...results[0],
        dateEmission: formatDate(results[0].date_emission)
      };
      
      res.status(201).json(facture);
    });
  });
};

exports.updateFacture = (req, res) => {
  const { id } = req.params;
  
  Facture.update(id, req.body, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    
    Facture.getById(id, (err, results) => {
      if (err) return res.status(500).json({ error: err.message });
      
      const facture = {
        ...results[0],
        dateEmission: formatDate(results[0].date_emission)
      };
      
      res.json(facture);
    });
  });
};

exports.deleteFacture = (req, res) => {
  Facture.delete(req.params.id, (err) => {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ message: 'Facture supprimée avec succès' });
  });
};

// Helper pour formater la date
function formatDate(dateString) {
  if (!dateString) return null;
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR'); // Format JJ/MM/AAAA
}