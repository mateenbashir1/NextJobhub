const ApplyJob = require('../models/ApplyJobModel');
const Company = require('../models/CompanieModel');
const Job = require('../models/jobModel');

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
    const existingApplication = await ApplyJob.findOne({ jobId, userId });
    if (existingApplication) {
      return res.status(400).json({ message: 'You have already applied for this job' });
    }

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
