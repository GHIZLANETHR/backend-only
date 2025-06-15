const db = require('../config/db');

/**
 * Get tasks assigned to teams that the employee belongs to
 * @param {number} userId - The user ID of the logged-in employee
 * @returns {Promise<Array>} - Promise resolving to array of tasks
 */
exports.getEmployeeTasks = (userId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT t.*, p.nom as projectName, e.name as teamName 
      FROM tasks t 
      JOIN employe_equipe ee ON t.assignedTo = ee.equipe_id 
      JOIN employes emp ON ee.employe_id = emp.id 
      JOIN users u ON emp.user_id = u.id 
      JOIN projects p ON t.project = p.id
      JOIN equipes e ON t.assignedTo = e.id
      WHERE u.id = ?
    `;
    
    db.query(query, [userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};

/**
 * Update task status
 * @param {number} taskId - The task ID to update
 * @param {string} status - The new status value
 * @returns {Promise<Object>} - Promise resolving to update result
 */
exports.updateTaskStatus = (taskId, status) => {
  return new Promise((resolve, reject) => {
    const query = 'UPDATE tasks SET status = ? WHERE id = ?';
    
    db.query(query, [status, taskId], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

/**
 * Save feedback for a task
 * @param {number} taskId - The task ID
 * @param {number} userId - The user ID providing feedback
 * @param {string} mood - The mood value
 * @param {string} comment - Optional comment
 * @returns {Promise<Object>} - Promise resolving to insert result
 */
exports.saveFeedback = (taskId, userId, mood, comment) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO feedbacks (task_id, user_id, mood, comment)
      VALUES (?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE mood = ?, comment = ?, updated_at = CURRENT_TIMESTAMP
    `;
    
    db.query(query, [taskId, userId, mood, comment, mood, comment], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

/**
 * Get feedback for a task
 * @param {number} taskId - The task ID
 * @param {number} userId - The user ID
 * @returns {Promise<Object>} - Promise resolving to feedback data
 */
exports.getFeedback = (taskId, userId) => {
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM feedbacks WHERE task_id = ? AND user_id = ?';
    
    db.query(query, [taskId, userId], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0] || null);
    });
  });
};
