// routes/users.js
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const jobController = require('../controllers/jobController');


// getRemoteJobs get
router.get('/getRemoteJobs', jobController.getRemoteJobs);

// Route to handle getting suggested jobs
router.get('/suggestedjobs',authMiddleware, jobController.getSuggestedJobs);

router.get('/getJobsWithExpiredDeadline',authMiddleware, jobController.getJobsWithExpiredDeadline);

// getTrendingJobs get
router.get('/getTrendingJobs', jobController.getTrendingJobs);

// Get all jobs with filters
router.get('/allJobsFilter', jobController.getAllJobsWithFilters);

// GET request to fetch user jobs
router.get('/', jobController.getJobs);

router.get('/gettotallNoJobs', jobController.gettotallNoJobs);

// singal user jobs
router.get('/get-job', authMiddleware, jobController.getUserJobs);

// Define route for getting all categories
router.get("/categories", jobController.getAllCategories);

// GET a job by ID
router.get('/:id', jobController.getJobById);

// Route to get jobs by category
router.get('/:category', jobController.getJobsByCategory);

router.post('/', authMiddleware,  jobController.createJob);

// Get jobs for a single user with filters
router.get('/filterjobsSingalUser', authMiddleware, jobController.filterJobsForSingleUser);

// Update a job
router.patch('/:id', authMiddleware,  jobController.updateJob);

// Delete a job post
router.delete('/:id', authMiddleware, jobController.deleteJob);


module.exports = router;
