const express = require('express');
const router = express.Router();
const companieController = require('../controllers/companieController');
const authMiddleware = require('../middleware/auth');
// const multerConfig = require('../middleware/jobsmulter');
const multer=require('multer')

// gettotallNoCompany for website
router.get('/gettotallNoCompany', companieController.gettotallNoCompany);

// GET all Companies
router.get('/', companieController.getAllCompanies);

// GET all Companies with users info
router.get('/user', companieController.getCompaniesWithUsers);


router.get('/companyDetails',authMiddleware, companieController.companyDetails);


router.get('/:id', companieController.getCompanyById);


// Multer setup for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      // Define the destination folder for uploaded files
      cb(null, './public/company');
    },
    filename: function (req, file, cb) {
      // Define the filename for uploaded files
      cb(null, file.originalname);
    }
  });

  // Set up multer with the defined storage configuration
  const upload = multer({ storage: storage });
// Create a company
router.post('/', authMiddleware,upload.single('logo'), companieController.createCompany);

// Update a company
router.patch('/:id', authMiddleware,upload.single('logo'), companieController.updateCompany);

// DELETE request to delete a company by ID
router.delete('/:id',authMiddleware, companieController.deleteCompany);

module.exports = router;
