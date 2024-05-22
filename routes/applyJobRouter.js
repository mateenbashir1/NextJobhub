const express = require('express');
const router = express.Router();
const applyJobController = require('../controllers/applyJobContoller');
const authMiddleware = require('../middleware/auth');

const multer=require('multer')
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/resume'); // Destination directory for storing files
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now();
        cb(null, uniqueSuffix + file.originalname); // Appending unique timestamp to filename
    }
});

// Multer upload configuration
const upload = multer({ storage: storage });
router.post('/:jobId', upload.fields([{ name: 'cv', maxCount: 1 }, { name: 'resumeVideo', maxCount: 1 }]), authMiddleware, applyJobController.applyForJob);




// Get job applications for a user
router.get('/', authMiddleware, applyJobController.getJobApplications);

router.get('/getUserAppyJob', authMiddleware, applyJobController.getUserAppyJob);


router.get('/getUserJobApplications', authMiddleware, applyJobController.getUserJobApplications);

// owner get routes
router.get('/getApplicationsByJobOwner/:applyJobId', authMiddleware, applyJobController.getApplicationsByJobOwner);
router.get('/jobOwner', authMiddleware, applyJobController.getJobApplicationsByOwner);
router.get('/selctedUser', authMiddleware, applyJobController.getSelectedUsersByJobOwner);


// Apply for a job
router.get('/total-applicants', authMiddleware, applyJobController.getTotalApplicants);
// Change application status
router.put('/:selectedApplication/status', authMiddleware, applyJobController.changeApplicationStatus);

module.exports = router;
