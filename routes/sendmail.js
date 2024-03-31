const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Job = require('../models/jobModel');
const User = require('../models/User');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
    try {
        // Extract job details from request body
        const { title, description, salary, city, seats, skills } = req.body;

        // Save the job to the database
        const job = new Job({
            title,
            description,
            salary,
            city,
            seats,
            skills
        });
        await job.save();

        // Fetch users whose skills match the job's required skills
        const users = await User.find({ skills: { $in: skills } });

        // Send email notifications to matching users
        const emailPromises = users.map(async (user) => {
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
                    rejectUnauthorized: false // Ignore TLS errors
                }
            });

            const mailOptions = {
                from: 'mateenbashirm@gmail.com',
                to: user.email,
                subject: 'New Job Opportunity',
                text: `Hello ${user.username},\n\nA new job has been posted matching your skills. Check it out: ${job.title}\n\nRegards,\nThe Job Portal Team`
            };

            // Send email
            try {
                await transporter.sendMail(mailOptions);
                console.log(`Email sent successfully to ${user.email}`);
            } catch (error) {
                console.error(`Error sending email to ${user.email}:`, error);
            }
        });

        await Promise.all(emailPromises);

        res.status(201).json({ message: 'Job posted successfully' });
    } catch (error) {
        console.error('Error posting job:', error);
        res.status(500).json({ message: 'Failed to post job', error: error.message });
    }
});

module.exports = router;
