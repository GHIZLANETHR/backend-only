// backend/controllers/teams.js
const pool = require('../config/db');

// Helpers
const generateTeamId = async () => {
  const [rows] = await pool.query('SELECT COUNT(*) as count FROM equipes');
  const count = rows[0].count;
  return `TEAM-${String(count + 1).padStart(3, '0')}`;
};

// Get all teams with member count
exports.getAllTeams = async (req, res) => {
  try {
    const query = `
      SELECT e.*, 
        (SELECT COUNT(*) FROM equipe_membres WHERE equipe_id = e.id) as memberCount
      FROM equipes e
    `;
    
    const [teams] = await pool.query(query);
    
    // Get additional information for each team
    for (let team of teams) {
      // Get manager information
      if (team.manager) {
        const [managerResults] = await pool.query(
          'SELECT nom FROM employes WHERE id = ?', 
          [team.manager]
        );
        if (managerResults.length > 0) {
          team.managerName = managerResults[0].nom;
        }
      }
      
      // Get members information
      const [membersResult] = await pool.query(`
        SELECT e.id, e.nom 
        FROM employes e
        JOIN equipe_membres em ON e.id = em.employe_id
        WHERE em.equipe_id = ?
      `, [team.id]);
      
      team.members = membersResult.map(m => m.id);
      team.memberNames = membersResult.map(m => m.nom);
    }
    
    res.json(teams);
  } catch (error) {
    console.error('Error fetching teams:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get team by ID
exports.getTeamById = async (req, res) => {
  try {
    const [teamResults] = await pool.query(
      'SELECT * FROM equipes WHERE id = ?', 
      [req.params.id]
    );
    
    if (teamResults.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const team = teamResults[0];
    
    // Get manager information
    if (team.manager) {
      const [managerResults] = await pool.query(
        'SELECT nom FROM employes WHERE id = ?', 
        [team.manager]
      );
      if (managerResults.length > 0) {
        team.managerName = managerResults[0].nom;
      }
    }
    
    // Get team members
    const [membersResult] = await pool.query(`
      SELECT e.* 
      FROM employes e
      JOIN equipe_membres em ON e.id = em.employe_id
      WHERE em.equipe_id = ?
    `, [req.params.id]);
    
    team.members = membersResult.map(m => m.id);
    team.memberDetails = membersResult;
    
    res.json(team);
  } catch (error) {
    console.error('Error fetching team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create new team
exports.createTeam = async (req, res) => {
  try {
    const { name, manager, members } = req.body;
    
    // Generate team ID
    const teamId = await generateTeamId();
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Insert into teams table
      await connection.query(
        'INSERT INTO equipes (id, name, manager) VALUES (?, ?, ?)',
        [teamId, name, manager || null]
      );
      
      // Add members to the team
      if (members && members.length > 0) {
        // Prepare batch insert values
        const memberValues = members.map(memberId => [teamId, memberId]);
        
        await connection.query(
          'INSERT INTO equipe_membres (equipe_id, employe_id) VALUES ?',
          [memberValues]
        );
        
        // Update employees table to set the team name
        await connection.query(
          'UPDATE employes SET equipe = ? WHERE id IN (?)',
          [name, members]
        );
      }
      
      await connection.commit();
      
      res.status(201).json({
        message: 'Team created successfully',
        teamId
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error creating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update team
exports.updateTeam = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, manager, members } = req.body;
    
    // Get current team info to track changes
    const [teamResults] = await pool.query(
      'SELECT name FROM equipes WHERE id = ?', 
      [id]
    );
    
    if (teamResults.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const oldTeamName = teamResults[0].name;
    
    // Start a transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update team basic info
      await connection.query(
        'UPDATE equipes SET name = ?, manager = ? WHERE id = ?',
        [name, manager || null, id]
      );
      
      // Handle team members if provided
      if (members) {
        // Get current team members
        const [currentMembersResult] = await connection.query(
          'SELECT employe_id FROM equipe_membres WHERE equipe_id = ?',
          [id]
        );
        const currentMembers = currentMembersResult.map(m => m.employe_id);
        
        // Identify members to add and remove
        const membersToAdd = members.filter(m => !currentMembers.includes(m));
        const membersToRemove = currentMembers.filter(m => !members.includes(m));
        
        // Remove members no longer in the team
        if (membersToRemove.length > 0) {
          await connection.query(
            'DELETE FROM equipe_membres WHERE equipe_id = ? AND employe_id IN (?)',
            [id, membersToRemove]
          );
          
          // Update those employees to remove team name
          await connection.query(
            'UPDATE employes SET equipe = NULL WHERE id IN (?) AND equipe = ?',
            [membersToRemove, oldTeamName]
          );
        }
        
        // Add new members to the team
        if (membersToAdd.length > 0) {
          const valuesToInsert = membersToAdd.map(memberId => [id, memberId]);
          
          await connection.query(
            'INSERT INTO equipe_membres (equipe_id, employe_id) VALUES ?',
            [valuesToInsert]
          );
        }
        
        // Update team name for all current members if name changed
        if (name !== oldTeamName) {
          await connection.query(
            'UPDATE employes SET equipe = ? WHERE id IN (?)',
            [name, members]
          );
        } else {
          // Just update new members with team name
          if (membersToAdd.length > 0) {
            await connection.query(
              'UPDATE employes SET equipe = ? WHERE id IN (?)',
              [name, membersToAdd]
            );
          }
        }
      }
      
      await connection.commit();
      
      res.json({ message: 'Team updated successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error updating team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete team
exports.deleteTeam = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get team name before deletion
    const [teamResults] = await pool.query(
      'SELECT name FROM equipes WHERE id = ?', 
      [id]
    );
    
    if (teamResults.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    const teamName = teamResults[0].name;
    
    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();
    
    try {
      // Update employees to remove team association
      await connection.query(
        'UPDATE employes SET equipe = NULL WHERE equipe = ?',
        [teamName]
      );
      
      // Delete team members relationships
      await connection.query(
        'DELETE FROM equipe_membres WHERE equipe_id = ?',
        [id]
      );
      
      // Delete the team
      await connection.query(
        'DELETE FROM equipes WHERE id = ?',
        [id]
      );
      
      await connection.commit();
      
      res.json({ message: 'Team deleted successfully' });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Error deleting team:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get team members
exports.getTeamMembers = async (req, res) => {
  try {
    const { id } = req.params;
    
    const [members] = await pool.query(`
      SELECT e.* 
      FROM employes e
      JOIN equipe_membres em ON e.id = em.employe_id
      WHERE em.equipe_id = ?
    `, [id]);
    
    res.json(members);
  } catch (error) {
    console.error('Error fetching team members:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Add team member
exports.addTeamMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { employeeId } = req.body;
    
    // Check if team exists
    const [teamResults] = await pool.query(
      'SELECT name FROM equipes WHERE id = ?', 
      [id]
    );
    
    if (teamResults.length === 0) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    // Check if employee exists
    const [employeeResults] = await pool.query(
      'SELECT id FROM employes WHERE id = ?', 
      [employeeId]
    );
    
    if (employeeResults.length === 0) {
      return res.status(404).json({ message: 'Employee not found' });
    }
    
    // Check if the relationship already exists
    const [existingRelation] = await pool.query(
      'SELECT * FROM equipe_membres WHERE equipe_id = ? AND employe_id = ?',
      [id, employeeId]
    );
    
    if (existingRelation.length > 0) {
      return res.status(400).json({ message: 'Employee is already a member of this team' });
    }
    
    // Add team member relationship
    await pool.query(
      'INSERT INTO equipe_membres (equipe_id, employe_id) VALUES (?, ?)',
      [id, employeeId]
    );
    
    // Update employee's team field
    await pool.query(
      'UPDATE employes SET equipe = ? WHERE id = ?',
      [teamResults[0].name, employeeId]
    );
    
    res.status(201).json({ message: 'Member added to team successfully' });
  } catch (error) {
    console.error('Error adding team member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Remove team member
exports.removeTeamMember = async (req, res) => {
  try {
    const { id, employeeId } = req.params;
    
    // Check if relationship exists
    const [relationshipResults] = await pool.query(
      'SELECT * FROM equipe_membres WHERE equipe_id = ? AND employe_id = ?',
      [id, employeeId]
    );
    
    if (relationshipResults.length === 0) {
      return res.status(404).json({ message: 'Employee is not a member of this team' });
    }
    
    // Get team name
    const [teamResults] = await pool.query(
      'SELECT name FROM equipes WHERE id = ?', 
      [id]
    );
    
    // Delete relationship
    await pool.query(
      'DELETE FROM equipe_membres WHERE equipe_id = ? AND employe_id = ?',
      [id, employeeId]
    );
    
    // Update employee to remove team
    if (teamResults.length > 0) {
      await pool.query(
        'UPDATE employes SET equipe = NULL WHERE id = ? AND equipe = ?',
        [employeeId, teamResults[0].name]
      );
    }
    
    res.json({ message: 'Member removed from team successfully' });
  } catch (error) {
    console.error('Error removing team member:', error);
    res.status(500).json({ message: 'Server error' });
  }
};