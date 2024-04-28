const express = require('express');
const router = express.Router();
const authMiddlware=require('../middleware/auth')
const savedJobController = require('../controllers/savejobController');


//getsavejob

router.get('/',authMiddlware, savedJobController.getSavedJobs);


// Route to save a job for later

router.post('/:jobId',authMiddlware, savedJobController.saveJobForLater);

module.exports = router;
