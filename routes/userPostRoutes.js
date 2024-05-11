const express = require('express');
const multer = require('multer');
const router = express.Router();
const postController = require('../controllers/userPostControler');
const authMiddleware=require('../middleware/auth')

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Define the destination folder for uploaded files
    cb(null, './public');
  },
  filename: function (req, file, cb) {
    // Define the filename for uploaded files
    cb(null, file.originalname);
  }
});

// Set up multer with the defined storage configuration
const upload = multer({ storage: storage });

// Route to create a new post with file upload

router.post('/', upload.single('post'),authMiddleware, postController.createPost);
router.get('/:id',authMiddleware, postController.getPostById);


module.exports = router;
