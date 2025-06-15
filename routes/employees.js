const express = require('express');
const router = express.Router();
const employeeController = require('../controllers/employeeController');

// Récupérer tous les employés
router.get('/', employeeController.getAllEmployees);

// Récupérer un employé par ID
router.get('/:id', employeeController.getEmployeeById);

// Créer un employé
router.post('/', employeeController.createEmployee);

// Mettre à jour un employé
router.put('/:id', employeeController.updateEmployee);

// Supprimer un employé
router.delete('/:id', employeeController.deleteEmployee);

module.exports = router;