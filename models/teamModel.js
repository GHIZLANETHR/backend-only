const pool = require('../config/db');

const Team = {
  
  async getAll() {
    const [rows] = await pool.query(`
      SELECT 
        t.*,
        CONCAT('TEAM-', LPAD(t.id, 3, '0')) as team_id,
        CONCAT('EMP-', LPAD(t.manager, 3, '0')) as manager_id,
        (SELECT COUNT(*) FROM employees WHERE team_id = t.id) as member_count
      FROM teams t
    `);
    return rows;
  },

  async getById(id) {
    const numericId = id.replace('TEAM-', '');
    const [rows] = await pool.query('SELECT * FROM teams WHERE id = ?', [numericId]);
    return rows[0];
  },

  async create(teamData) {
    const { name, manager } = teamData;
    const numericManager = manager ? manager.replace('EMP-', '') : null;
    
    const [result] = await pool.query(
      'INSERT INTO teams (name, manager) VALUES (?, ?)',
      [name, numericManager]
    );
    
    return `TEAM-${String(result.insertId).padStart(3, '0')}`;
  },

  async update(id, teamData) {
    const numericId = id.replace('TEAM-', '');
    const { name, manager } = teamData;
    const numericManager = manager ? manager.replace('EMP-', '') : null;
    
    const [result] = await pool.query(
      'UPDATE teams SET name = ?, manager = ? WHERE id = ?',
      [name, numericManager, numericId]
    );
    
    return result.affectedRows;
  },

  async delete(id) {
    const numericId = id.replace('TEAM-', '');
    const [result] = await pool.query('DELETE FROM teams WHERE id = ?', [numericId]);
    return result.affectedRows;
  },

  async getEmployeesByTeam(teamId) {
    const numericId = teamId.replace('TEAM-', '');
    const [rows] = await pool.query(
      `SELECT 
        e.*,
        CONCAT('EMP-', LPAD(e.id, 3, '0')) as employee_id
       FROM employees e 
       WHERE team_id = ?`,
      [numericId]
    );
    return rows;
  },

  async updateTeamMembers(teamId, memberIds) {
    const numericTeamId = teamId.replace('TEAM-', '');
    const numericMemberIds = memberIds.map(id => id.replace('EMP-', ''));
    
    // D'abord, retirer tous les employés de cette équipe
    await pool.query('UPDATE employees SET team_id = NULL WHERE team_id = ?', [numericTeamId]);
    
    // Ensuite, ajouter les nouveaux membres
    if (numericMemberIds.length > 0) {
      await pool.query(
        `UPDATE employees SET team_id = ? WHERE id IN (?)`,
        [numericTeamId, numericMemberIds]
      );
    }
    
    return true;
  }
};

module.exports = Team;