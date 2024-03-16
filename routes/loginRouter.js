const express = require('express');
const router = express.Router();
const userController = require('../controllers/loginController');

// Login user
router.post('/', userController.loginUser);

module.exports = router;
