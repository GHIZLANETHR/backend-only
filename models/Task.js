const db = require('../config/db');

class Task {
  static getAll(callback) {
    db.query('SELECT * FROM tasks', callback);
  }

  static getById(id, callback) {
    db.query('SELECT * FROM tasks WHERE id = ?', [id], callback);
  }

  static create(task, callback) {
    const { name, assignedTo, project, dueDate, status, description, estimatedHours, loggedHours } = task;
    const labels = JSON.stringify(task.labels || []);
    
    db.query(
      'INSERT INTO tasks (name, assignedTo, project, dueDate, status, description, estimatedHours, loggedHours, labels) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [name, assignedTo, project, dueDate, status, description, estimatedHours, loggedHours, labels],
      callback
    );
  }

  static update(id, task, callback) {
    const { name, assignedTo, project, dueDate, status, description, estimatedHours, loggedHours } = task;
    const labels = JSON.stringify(task.labels || []);
    
    db.query(
      'UPDATE tasks SET name = ?, assignedTo = ?, project = ?, dueDate = ?, status = ?, description = ?, estimatedHours = ?, loggedHours = ?, labels = ? WHERE id = ?',
      [name, assignedTo, project, dueDate, status, description, estimatedHours, loggedHours, labels, id],
      callback
    );
  }

  static delete(id, callback) {
    db.query('DELETE FROM tasks WHERE id = ?', [id], callback);
  }
}

module.exports = Task;