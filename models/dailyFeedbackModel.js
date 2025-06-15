// models/dailyFeedbackModel.js
const db = require('../config/db');

/**
 * Enregistrer ou mettre à jour le feedback quotidien d'un utilisateur
 * @param {number} userId - L'ID de l'utilisateur
 * @param {string} mood - L'humeur ('excellent', 'bon', 'neutre', 'stresse', 'epuise')
 * @param {string} comment - Commentaire optionnel
 * @returns {Promise<Object>} - Promise résolvant vers le résultat de l'insertion/mise à jour
 */
exports.saveDailyFeedback = (userId, mood, comment) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO feedbackjour (user_id, mood, comment, date)
      VALUES (?, ?, ?, CURDATE())
      ON DUPLICATE KEY UPDATE 
        mood = ?, 
        comment = ?, 
        created_at = CURRENT_TIMESTAMP
    `;
    
    db.query(query, [userId, mood, comment, mood, comment], (err, result) => {
      if (err) {
        return reject(err);
      }
      resolve(result);
    });
  });
};

/**
 * Récupérer le feedback quotidien d'un utilisateur pour une date donnée
 * @param {number} userId - L'ID de l'utilisateur
 * @param {string} date - Date au format YYYY-MM-DD (optionnel, par défaut aujourd'hui)
 * @returns {Promise<Object>} - Promise résolvant vers les données de feedback
 */
exports.getDailyFeedback = (userId, date = null) => {
  return new Promise((resolve, reject) => {
    const dateClause = date ? 'DATE(date) = ?' : 'DATE(date) = CURDATE()';
    const query = `SELECT * FROM feedbackjour WHERE user_id = ? AND ${dateClause}`;
    const params = date ? [userId, date] : [userId];
    
    db.query(query, params, (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results[0] || null);
    });
  });
};

/**
 * Récupérer l'historique des feedbacks quotidiens d'un utilisateur
 * @param {number} userId - L'ID de l'utilisateur
 * @param {number} limit - Nombre de jours à récupérer (par défaut 30)
 * @returns {Promise<Array>} - Promise résolvant vers un tableau de feedbacks
 */
exports.getDailyFeedbackHistory = (userId, limit = 30) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT * FROM feedbackjour 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT ?
    `;
    
    db.query(query, [userId, limit], (err, results) => {
      if (err) {
        return reject(err);
      }
      resolve(results);
    });
  });
};