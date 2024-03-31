const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/jobModel');

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Extract user skills and preprocess them
        const userSkills = user.skills.map(skill => skill.toLowerCase().trim());

        // Find jobs that require any of the user's skills
        const suggestedJobs = await Job.find().lean();
        const matchedJobs = suggestedJobs.filter(job => {
            return job.skills.some(jobSkill => userSkills.includes(jobSkill.toLowerCase().trim()));
        });

        res.status(200).json({ suggestedJobs: matchedJobs });
    } catch (error) {
        console.error('Error fetching suggested jobs:', error);
        res.status(500).json({ message: 'Failed to fetch suggested jobs', error: error.message });
    }
});

module.exports = router;
