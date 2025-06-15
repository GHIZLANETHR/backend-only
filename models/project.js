const db = require('../config/db');

class Project {
  static getAll(callback) {
    db.query('SELECT * FROM projects', callback);
  }

  static getById(id, callback) {
    db.query('SELECT * FROM projects WHERE id = ?', [id], callback);
  }

  static create(project, callback) {
    const { nom, clientId, managerId, echeance, statut } = project;
    db.query(
      'INSERT INTO projects (nom, clientId, managerId, echeance, statut) VALUES (?, ?, ?, ?, ?)',
      [nom, clientId, managerId, echeance, statut],
      callback
    );
  }

  static update(id, project, callback) {
    const { nom, clientId, managerId, echeance, statut } = project;
    db.query(
      'UPDATE projects SET nom = ?, clientId = ?, managerId = ?, echeance = ?, statut = ? WHERE id = ?',
      [nom, clientId, managerId, echeance, statut, id],
      callback
    );
  }

  static delete(id, callback) {
    db.query('DELETE FROM projects WHERE id = ?', [id], callback);
  }
}

module.exports = Project;