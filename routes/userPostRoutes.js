const express = require('express');
const multer = require('multer');
const router = express.Router();
const postController = require('../controllers/userPostControler');
const authMiddleware=require('../middleware/auth')

// Multer setup for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/userPost');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

// Set up multer with the defined storage configuration
const upload = multer({ storage: storage });

// Route to create a new post with file upload

router.post('/', upload.single('post'),authMiddleware, postController.createPost);
router.get('/:id',authMiddleware, postController.getPostById);

router.get('/user/:userId', postController.getAllPostsByUserId);

// Route to delete a post by ID
router.delete('/:id', authMiddleware, postController.deletePost);

module.exports = router;
