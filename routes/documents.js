const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');

router.get('/', documentController.getAllDocuments);
router.get('/search', documentController.searchDocuments);
router.post('/', documentController.createDocument);

module.exports = router;