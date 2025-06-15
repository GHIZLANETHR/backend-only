// models/Client.js
const db = require('../config/db');

class Client {
  static getAll(callback) {
    db.query('SELECT * FROM clients', callback);
  }

  static getById(id, callback) {
    db.query('SELECT * FROM clients WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]); // Renvoie le premier résultat ou undefined
    });
  }

  static create(client, callback) {
    const { nom, email, telephone, entreprise, adresse, ville, code_postal, pays, statut, type_client, notes } = client;
    db.query(
      'INSERT INTO clients (nom, email, telephone, entreprise, adresse, ville, code_postal, pays, statut, type_client, notes) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [nom, email, telephone, entreprise, adresse, ville, code_postal, pays, statut, type_client, notes],
      callback
    );
  }

  static update(id, client, callback) {
    const { nom, email, telephone, entreprise, adresse, ville, code_postal, pays, statut, type_client, notes } = client;
    db.query(
      'UPDATE clients SET nom = ?, email = ?, telephone = ?, entreprise = ?, adresse = ?, ville = ?, code_postal = ?, pays = ?, statut = ?, type_client = ?, notes = ? WHERE id = ?',
      [nom, email, telephone, entreprise, adresse, ville, code_postal, pays, statut, type_client, notes, id],
      callback
    );
  }

  static delete(id, callback) {
    db.query('DELETE FROM clients WHERE id = ?', [id], callback);
  }
}

module.exports = Client;