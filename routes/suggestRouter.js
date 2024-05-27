const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Job = require('../models/jobModel');
const Company = require('../models/CompanieModel'); // Import Company model

router.get('/', authMiddleware, async (req, res) => {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Extract user skills and preprocess them
        const userSkills = user.skills.map(skill => skill.toLowerCase().trim());

        const currentDate = new Date();
        const suggestedJobs = await Job.find({
            deadLine: { $gt: currentDate }
        }).sort({ createdAt: -1 }).lean();

        const matchedJobs = [];

        // Filter only the jobs that match the user's skills
        for (const job of suggestedJobs) {
            if (job.skills.some(jobSkill => userSkills.includes(jobSkill.toLowerCase().trim()))) {
                const company = await Company.findOne({ UserId: job.UserId }); // Fetch company info
                if (company) {
                    matchedJobs.push({
                        ...job,
                        companyLogo: company.logo,
                        companyId: company._id, // Assuming UserId is the company ID field
                        username: job.UserId.username // Assuming UserId is a reference to User model
                    });
                }
            }
        }

        res.status(200).json({ suggestedJobs: matchedJobs });
    } catch (error) {
        console.error('Error fetching suggested jobs:', error);
        res.status(500).json({ message: 'Failed to fetch suggested jobs', error: error.message });
    }
});

module.exports = router;
