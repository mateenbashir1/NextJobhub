const express = require('express');
const router = express.Router();
const companieController = require('../controllers/companieController');
const authMiddleware = require('../middleware/auth');
const multerConfig = require('../middleware/jobsmulter');

// gettotallNoCompany for website
router.get('/gettotallNoCompany', companieController.gettotallNoCompany);

// GET all Companies
router.get('/', companieController.getAllCompanies);

// GET all Companies with users info
router.get('/user', companieController.getCompaniesWithUsers);


// Create a company
router.post('/', authMiddleware,multerConfig.single('logo'), companieController.createCompany);

// Update a company
router.patch('/:id', authMiddleware,multerConfig.single('logo'), companieController.updateCompany);

module.exports = router;
