const express = require('express');
const router = express.Router();
const applyJobController = require('../controllers/applyJobContoller');
const authMiddleware = require('../middleware/auth');

// Get job applications for a user
router.get('/', authMiddleware, applyJobController.getJobApplications);

// Apply for a job
router.post('/:jobId', authMiddleware, applyJobController.applyForJob);

// Change application status
router.put('/:applyId/status', authMiddleware, applyJobController.changeApplicationStatus);

module.exports = router;
