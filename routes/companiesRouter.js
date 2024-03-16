const express = require('express');
const router = express.Router();
const companieController = require('../controllers/companieController');
const authMiddleware = require('../middleware/auth');

// GET all Companies
router.get('/', companieController.getAllCompanies);

// GET all Companies with users info
router.get('/user', companieController.getCompaniesWithUsers);

// Create a company
router.post('/', authMiddleware, companieController.createCompany);

// Update a company
router.patch('/:id', authMiddleware, companieController.updateCompany);

module.exports = router;
