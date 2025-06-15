const db = require('../config/db');

class Employee {
  static getAll(callback) {
    db.query('SELECT * FROM employes', callback);
  }

  static getById(id, callback) {
    db.query('SELECT * FROM employes WHERE id = ?', [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]); // Renvoie le premier résultat ou undefined
    });
  }

  static create(employee, callback) {
    const { nom, prenom, telephone, adresse, departement, statut } = employee;
    const date_embauche = new Date().toISOString().slice(0, 10);
    
    db.query(
      'INSERT INTO employes (nom, prenom, telephone, adresse, departement, statut, date_embauche) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nom, prenom, telephone, adresse, departement, statut, date_embauche],
      callback
    );
  }

  static update(id, employee, callback) {
    const { nom, prenom, telephone, adresse, departement, statut } = employee;
    db.query(
      'UPDATE employes SET nom = ?, prenom = ?, telephone = ?, adresse = ?, departement = ?, statut = ? WHERE id = ?',
      [nom, prenom, telephone, adresse, departement, statut, id],
      callback
    );
  }

  static delete(id, callback) {
    db.query('DELETE FROM employes WHERE id = ?', [id], callback);
  }
}

module.exports = Employee;