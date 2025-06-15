const Team = require('../models/teamModel');

exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.getAll();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.getById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Équipe non trouvée' });
    }
    
    const members = await Team.getEmployeesByTeam(req.params.id);
    res.status(200).json({ ...team, members });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createTeam = async (req, res) => {
  try {
    const teamId = await Team.create(req.body);
    const team = await Team.getById(teamId);
    res.status(201).json(team);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.updateTeam = async (req, res) => {
  try {
    const affectedRows = await Team.update(req.params.id, req.body);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Équipe non trouvée' });
    }
    
    if (req.body.members) {
      await Team.updateTeamMembers(req.params.id, req.body.members);
    }
    
    const team = await Team.getById(req.params.id);
    const members = await Team.getEmployeesByTeam(req.params.id);
    res.status(200).json({ ...team, members });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.deleteTeam = async (req, res) => {
  try {
    const affectedRows = await Team.delete(req.params.id);
    if (affectedRows === 0) {
      return res.status(404).json({ error: 'Équipe non trouvée' });
    }
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};