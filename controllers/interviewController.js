const Interview = require('../models/interviewModel');
const ApplyJob = require('../models/ApplyJobModel');
const Job=require('../models/jobModel')


const scheduleInterview = async (req, res) => {
    try {
      const { scheduledDate, notes } = req.body;
      const { applyJobId } = req.params;
      const jobPosterId = req.user.userId;

      // Fetch the apply job document by ID
      const applyJob = await ApplyJob.findById(applyJobId);
      if (!applyJob) {
        return res.status(404).json({ message: 'Apply job not found' });
      }

      // Fetch the job document by ID
      const job = await Job.findById(applyJob.jobId);
      if (!job) {
        return res.status(404).json({ message: 'Job not found' });
      }

      // Check if the user making the request is the job poster
      if (job.UserId.toString() !== jobPosterId) {
        return res.status(403).json({ message: 'Unauthorized: Only the job poster can schedule an interview' });
      }

      // Create a new interview document
      const interview = new Interview({
        jobPosterId,
        userId: applyJob.userId,
        jobId: applyJob.jobId,
        status: 'scheduled',
        scheduledDate,
        notes,
        applyJobId:applyJobId
      });

      // Save the interview to the database
      await interview.save();

      res.status(201).json({ message: 'Interview scheduled successfully', interview });
    } catch (error) {
      console.error('Error scheduling interview:', error);
      res.status(500).json({ message: 'Failed to schedule interview', error: error.message });
    }
  };


const getInterview = async (req, res) => {
    try {
      const { interviewId } = req.params;
      const jobPosterId = req.user.userId; // Assuming the user ID of the job poster is stored in req.user.userId
      const userId = req.user.userId; // Assuming the user ID of the employee is stored in req.user.userId

      // Find the interview document by ID
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found' });
      }

      // Check if the user making the request is the job poster or the user who applied for the job
      if (interview.jobPosterId.toString() !== jobPosterId && interview.userId.toString() !== userId) {
        return res.status(403).json({ message: 'Unauthorized: You are not authorized to view this interview' });
      }

      res.status(200).json({ interview });
    } catch (error) {
      console.error('Error fetching interview:', error);
      res.status(500).json({ message: 'Failed to fetch interview', error: error.message });
    }
  };



const updateInterviewStatus = async (req, res) => {
    try {
      const { interviewId } = req.params;
      const { status, scheduledDate, notes } = req.body;
      const jobPosterId = req.user.userId; // Assuming the user ID of the job poster is stored in req.user.userId

      // Find the interview document by ID
      const interview = await Interview.findById(interviewId);
      if (!interview) {
        return res.status(404).json({ message: 'Interview not found' });
      }

      // Check if the user making the request is the interview creator
      if (interview.jobPosterId.toString() !== jobPosterId) {
        return res.status(403).json({ message: 'Unauthorized: Only the interview creator can update the interview' });
      }

      // Update the interview fields
      interview.status = status;
      if (scheduledDate) {
        interview.scheduledDate = scheduledDate;
      }
      if (notes) {
        interview.notes = notes;
      }

      // Save the updated interview
      await interview.save();

      res.status(200).json({ message: 'Interview updated succes'});
    } catch (error) {
        console.error('Error scheduling interview:', error);
        res.status(500).json({ message: 'Failed to schedule interview', error: error.message });
      }
  };

module.exports={
    scheduleInterview,
    getInterview,
    updateInterviewStatus
}