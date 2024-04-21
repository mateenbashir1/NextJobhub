const ApplyJob = require('../models/ApplyJobModel');
const Company = require('../models/CompanieModel');
const Job = require('../models/jobModel');
const User=require('../models/User')
const getJobApplications = async (req, res) => {
    const { userId } = req.user;

    try {
      const applications = await ApplyJob.find({ userId }).populate('jobId');
      const responseData = await Promise.all(applications.map(async application => {
        const { status, jobId } = application;
        if (!jobId) {
          return null; // Skip processing this application
        }
        const { title, UserId } = jobId;
        const company = await Company.findOne({ UserId });
        const companyName = company ? company.name : 'Unknown';
        return { status, jobTitle: title, companyName };
      }));

      // Filter out null entries
      const filteredData = responseData.filter(data => data !== null);

      res.status(200).json({ totalApplications: filteredData.length, applications: filteredData });
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch job applications', error: error.message });
    }
  };


  const applyForJob = async (req, res) => {
    const { jobId } = req.params;
    const { userId } = req.user;

    try {
        // Step 1: Check if the user has added education information
        const user = await User.findById(userId);
        if (!user.education || user.education.length === 0) {
            return res.status(400).json({ message: 'Please add education information to your profile before applying for jobs' });
        }

        // Step 2: Retrieve the job details and check for required education
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        // Check if the job requires a specific level of education
        if (job.education !== undefined) {
            const userEducationSet = new Set(user.education);
            const jobEducationSet = new Set(job.education);
            const matchingEducation = [...jobEducationSet].every(education => userEducationSet.has(education));
            if (!matchingEducation) {
                return res.status(400).json({ message: 'Your education level does not match the required education for this job' });
            }
        }

        // Check if the user has already applied for this job
        const existingApplication = await ApplyJob.findOne({ jobId, userId });
        if (existingApplication) {
            return res.status(400).json({ message: 'You have already applied for this job' });
        }

        // Create and save the application
        const apply = new ApplyJob({ jobId, userId });
        await apply.save();

        res.status(201).json({ message: 'Application submitted successfully', apply });
    } catch (error) {
        res.status(400).json({ message: 'Failed to submit application', error: error.message });
    }
};


const changeApplicationStatus = async (req, res) => {
  const { applyId } = req.params;
  const { newStatus, reason } = req.body;
  const { userId } = req.user;

  try {
    const apply = await ApplyJob.findById(applyId);
    if (!apply) {
      return res.status(404).json({ message: 'Job application not found' });
    }

    const job = await Job.findById(apply.jobId);
    if (!job) {
      return res.status(404).json({ message: 'Associated job not found' });
    }

    if (job.UserId.toString() !== userId) {
      return res.status(403).json({ message: 'You are not authorized to update this application' });
    }

    apply.status = newStatus;
    await apply.save();

    res.status(200).json({ message: 'Application status updated successfully', apply });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update application status', error: error.message });
  }
};

module.exports = {
  getJobApplications,
  applyForJob,
  changeApplicationStatus
};
