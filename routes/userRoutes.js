// Dans votre fichier de routes (ex: userRoutes.js)
app.get('/api/users/employees', async (req, res) => {
  try {
    const employees = await db.query(
      'SELECT id, name, email, role FROM users WHERE role = ?', 
      ['employee']
    );
    res.json(employees);
  } catch (error) {
    console.error('Error fetching employees:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des employés' });
  }
});