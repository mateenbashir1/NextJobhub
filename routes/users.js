const express = require('express');
const router = express.Router();
const User = require('../models/User');
const userController = require('../controllers/usersController');
const authMiddleware = require('../middleware/auth');
const multerConfig = require('../middleware/usermulter');


// Create a user
router.post('/', userController.createUser);

// get users
router.get('/',userController.getAllUsers);

// Update a user
router.patch('/:id', authMiddleware, multerConfig.single('profileImg'), userController.updateUser);

// Delete a user
router.delete('/:userId', authMiddleware, userController.deleteUser);

// Middleware function to get a user by ID
router.param('id', userController.getUser);


router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);

module.exports = router;
