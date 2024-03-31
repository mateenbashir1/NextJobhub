const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const interviewController = require('../controllers/interviewController');

// get  interview
router.get('/:interviewId', authMiddleware, interviewController.getInterview);

// Schedule an interview
router.post('/:applyJobId', authMiddleware, interviewController.scheduleInterview);

// Update interview status
router.patch('/:interviewId', authMiddleware, interviewController.updateInterviewStatus);

module.exports = router;
