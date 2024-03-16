// routes/interviews.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Interview = require('../models/interviewModel');



// Route to schedule an interview
router.post('/', async (req, res) => {
  try {
    // Extract interview details from request body
    const { dateScheduled, interviewerID, intervieweeID } = req.body;



    // Create new interview instance
    const interview = new Interview({ dateScheduled, interviewerID, intervieweeID });

    // Save the interview to the database
    await interview.save();

    // Respond with the created interview object
    res.status(201).json(interview);
  } catch (err) {
    // Handle errors
    res.status(400).json({ message: err.message });
  }
});


module.exports = router;
