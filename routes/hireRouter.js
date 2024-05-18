const express = require('express');
const router = express.Router();
const hiringController = require('../controllers/hireController');
const authMiddleware = require('../middleware/auth');



router.get('/:hiringId', hiringController.getHiringDetails);

// Route to hire a user for a specific job
router.post('/:hireUserId',authMiddleware, hiringController.hireUserForJob);

module.exports = router;
