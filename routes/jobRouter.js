// routes/users.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const jobController = require('../controllers/jobController');


// Route to handle getting suggested jobs
router.get('/suggestedjobs',authMiddleware, jobController.getSuggestedJobs);


// GET request to fetch user jobs
router.get('/', jobController.getJobs);

// singal user jobs
router.get('/get-job', authMiddleware, jobController.getUserJobs);


router.post('/', authMiddleware,  jobController.createJob);

// Get jobs for a single user with filters
router.get('/filterjobsSingalUser', authMiddleware, jobController.filterJobsForSingleUser);

// Get all jobs with filters
router.get('/allJobsFilter', jobController.getAllJobsWithFilters);



// Update a job
router.patch('/:id', authMiddleware,  jobController.updateJob);


// Delete a job post
router.delete('/:id', authMiddleware, jobController.deleteJob);


module.exports = router;
