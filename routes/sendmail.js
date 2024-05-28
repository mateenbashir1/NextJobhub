const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Job = require('../models/jobModel');
const User = require('../models/User');
const Company = require('../models/CompanieModel');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
    try {
        // Check if the user has a company
        const company = await Company.findOne({ UserId: req.user.userId });
        if (!company) {
          return res.status(403).json({ message: 'You need to create a company before posting a job' });
        }

        // Format the deadline date
        const formattedDeadline = new Date(req.body.deadLine);

        // Create a new job
        const job = new Job({
          title: req.body.title,
          description: req.body.description,
          salary: {
            min: req.body.minSalary,
            max: req.body.maxSalary
          },
          city: req.body.city,
          skills: req.body.skills,
          worktype: req.body.worktype,
          seats: req.body.seats,
          experienceLevel: req.body.experienceLevel,
          category: req.body.category,
          deadLine: formattedDeadline,
          remote: req.body.remote,
          UserId: req.user.userId
        });
        // Fetch all users from the database
        const users = await User.find();

        // Filter users based on their skills matching the job's required skills
        const usersWithMatchingSkills = users.filter(user => {
            // Check if user's skills intersect with the job's required skills
            return user.skills.some(skill => req.body.skills.includes(skill));
        });

        // Send email notifications to users with matching skills
        const emailPromises = usersWithMatchingSkills.map(async (user) => {
            const transporter = nodemailer.createTransport({
                host: 'smtp.gmail.com',
                port: 587,
                secure: false,
                requireTLS: true,
                auth: {
                    user: 'mateenbashirm@gmail.com',
                    pass: 'xvlcyysovqjdljul',
                },
                tls: {
                    rejectUnauthorized: false
                }
            });
            const mailOptions = {
                from: 'mateenbashirm@gmail.com',
                to: user.email,
                subject: 'New Job Opportunity',
                text: `Hello ${user.username},\n\nA new job has been posted matching your skills. Check it out: ${job.title}\n\nRegards,\nThe Job Portal Team`
            };

            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent successfully to ${user.email}`);
            } catch (error) {
                console.error(`Error sending email to ${user.email}:`, error);
            }
        });

        // Send emails to users with matching skills
        await Promise.all(emailPromises);
        const newJob = await job.save();
        res.status(201).json({ message: 'Job posted successfully',newJob });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ message: 'Failed to post job', error: error.message });
    }
});

module.exports = router;
