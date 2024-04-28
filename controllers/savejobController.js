const SavedJob = require('../models/saveJobModel');

const saveJobForLater = async (req, res) => {
  const { jobId } = req.params;
  const { userId } = req.user;

  try {
    // Check if the job is already saved by the user
    const existingSavedJob = await SavedJob.findOne({ jobId, userId });
    if (existingSavedJob) {
      return res.status(400).json({ message: 'Job already saved' });
    }

    // Create a new saved job instance
    const savedJob = new SavedJob({
      jobId,
      userId
    });
    await savedJob.save();

    res.status(201).json({ message: 'Job saved for later' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to save job', error: error.message });
  }
};

// getsave job
const getSavedJobs = async (req, res) => {
    const { userId } = req.user;

    try {
        // Find all saved jobs for the current user
        const savedJobs = await SavedJob.find({ userId }).populate('jobId');

        res.status(200).json({ savedJobs });
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch saved jobs', error: error.message });
    }
};

module.exports = {
  saveJobForLater,
  getSavedJobs
};
