const ApplyJob = require('../models/ApplyJobModel');
const Company = require('../models/CompanieModel');
const Job = require('../models/jobModel');
const User=require('../models/User');


const getJobApplications = async (req, res) => {
    const { userId } = req.user;

    try {

      const applications = await ApplyJob.find({ userId }).populate('jobId');
      console.log(applications)
      const responseData = await Promise.all(applications.map(async application => {
        const { status, jobId } = application;
        if (!jobId) {
          return null;
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

  const getApplicationsByJobOwner = async (req, res) => {
    const { applyJobId } = req.params;
    const { userId } = req.user;

      try {
        // Find the application by ID
        const application = await ApplyJob.findById(applyJobId);
        if (!application) {
          return res.status(404).json({ message: 'Application not found' });
        }

        // Check if the user is the owner of the application's job
        const job = await Job.findById(application.jobId);
        if (!job) {
          return res.status(404).json({ message: 'Job not found' });
        }
        if (job.UserId.toString() !== userId) {
          return res.status(403).json({ message: 'Unauthorized access' });
        }

        res.status(200).json({ application });
    } catch (error) {
      res.status(400).json({ message: 'Failed to retrieve applications', error: error.message });
    }
  };



  // const applyForJob = async (req, res) => {
  //   const { jobId } = req.params;
  //   const { userId } = req.user;
  //   const { email, fullName, phoneNumber, city } = req.body;

  //   try {
  //       const user = await User.findById(userId);
  //       if (!user) {
  //           return res.status(400).json({ message: 'User not found' });
  //       }

  //       const existingApplication = await ApplyJob.findOne({ jobId, userId });
  //       if (existingApplication) {
  //           return res.status(400).json({ message: 'You have already applied for this job' });
  //       }

  //       const cvPath = req.files['cv'][0].path.replace('public', '');
  //       const resumeVideoPath = req.files['resumeVideo'][0].path.replace('public', '');

  //       const apply = new ApplyJob({
  //           jobId,
  //           userId,
  //           email,
  //           fullName,
  //           phoneNumber,
  //           city,
  //           cv: cvPath,
  //           resumeVideo: resumeVideoPath
  //       });
  //       await apply.save();

  //       res.status(201).json({ message: 'Application submitted successfully', apply });
  //   } catch (error) {
  //       res.status(400).json({ message: 'Failed to submit application', error: error.message });
  //   }
  // };




// const changeApplicationStatus = async (req, res) => {
//   const { applyId } = req.params;
//   const { newStatus, reason } = req.body;
//   const { userId } = req.user;

//   try {
//     const apply = await ApplyJob.findById(applyId);
//     if (!apply) {
//       return res.status(404).json({ message: 'Job application not found' });
//     }

//     const job = await Job.findById(apply.jobId);
//     if (!job) {
//       return res.status(404).json({ message: 'Associated job not found' });
//     }

//     if (job.UserId.toString() !== userId) {
//       return res.status(403).json({ message: 'You are not authorized to update this application' });
//     }

//     apply.status = newStatus;
//     await apply.save();

//     res.status(200).json({ message: 'Application status updated successfully', apply });
//   } catch (error) {
//     res.status(400).json({ message: 'Failed to update application status', error: error.message });
//   }
// };

// getTotalApplicants for the user

const applyForJob = async (req, res) => {
  const { jobId } = req.params;
  const { userId } = req.user;
  const { email, fullName, phoneNumber, city } = req.body;

  // Check if all required fields are provided
  if (!email || !fullName || !phoneNumber || !city || !req.files['cv'] || !req.files['resumeVideo']) {
      return res.status(400).json({ message: 'Please provide all required information' });
  }

  if (userId.isVerify !== true){
    return res.status(400).json({ message: 'Please verify your email' });
  }
  // Check if the CV is in PDF format
  const cvFile = req.files['cv'][0];
  if (cvFile.mimetype !== 'application/pdf') {
      return res.status(400).json({ message: 'CV must be in PDF format' });
  }

  // Check if the resume video is in MP4 format
  const resumeVideoFile = req.files['resumeVideo'][0];
  if (resumeVideoFile.mimetype !== 'video/mp4') {
      return res.status(400).json({ message: 'Resume video must be in MP4 format' });
  }

  try {
      // Check if the user has added education information
      const user = await User.findById(userId);
      if (!user) {
          return res.status(400).json({ message: 'User not found' });
      }

      // Check if the user has already applied for this job
      const existingApplication = await ApplyJob.findOne({ jobId, userId });
      if (existingApplication) {
          return res.status(400).json({ message: 'You have already applied for this job' });
      }

      // Get the path of the uploaded CV and resume video files
      const cvPath = cvFile.path.replace('public', '');
      const resumeVideoPath = resumeVideoFile.path.replace('public', '');

      const apply = new ApplyJob({
          jobId,
          userId,
          email,
          fullName,
          phoneNumber,
          city,
          cv: cvPath,
          resumeVideo: resumeVideoPath
      });
      await apply.save();

      res.status(201).json({ message: 'Application submitted successfully', apply });
  } catch (error) {
      res.status(400).json({ message: 'Failed to submit application', error: error.message });
  }
};



const nodemailer = require('nodemailer');


const changeApplicationStatus = async (req, res) => {
  const { selectedApplication } = req.params;
  const { newStatus, reason } = req.body;
  const { userId } = req.user;

  try {
    const apply = await ApplyJob.findById(selectedApplication);
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

    // Update the application status and reason
    apply.status = newStatus;
    apply.reason = reason; // Add the reason for status change
    await apply.save();

    // Send email notification to the applicant
    const applicant = await User.findById(apply.userId);
    if (!applicant) {
      return res.status(404).json({ message: 'Applicant not found' });
    }

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
      to: applicant.email,
      subject: 'Application Status Update',
      text: `Your application for the job "${job.title}" has been "${newStatus}". Reason: ${reason}`
    };

    // transporter.sendMail(mailOptions, (error, info) => {
    //   if (error) {
    //     console.error('Error occurred while sending email:', error);
    //   } else {
    //     console.log('Email sent:', info.response);
    //   }
    // });

    if (newStatus === 'rejected') {
      // Delete the application if status is "rejected"
      await ApplyJob.findByIdAndDelete(selectedApplication);
      return res.status(200).json({ message: 'Application rejected and deleted successfully' });
    }

    res.status(200).json({ message: 'Application status updated successfully', apply });
  } catch (error) {
    res.status(400).json({ message: 'Failed to update application status', error: error.message });
  }
};




const getJobApplicationsByOwner = async (req, res) => {
  const { userId } = req.user;

  try {
    // Find all jobs created by the user
    const userJobs = await Job.find({ UserId: userId });

    // Extract job IDs from the user's jobs
    const jobIds = userJobs.map((job) => job._id);

    // Find applications for the user's jobs with pending status
    const pendingApplications = await ApplyJob.find({ jobId: { $in: jobIds }, status: 'pending' }).populate('jobId').populate('userId');

    // Process applications data
    const responseData = await Promise.all(pendingApplications.map(async (application) => {
      const { _id: applyJobId, status, jobId, userId: applicantId } = application;
      const { title, UserId } = jobId;

      // Find the user details for the applicant
      const applicant = await User.findById(applicantId);
      const username = applicant ? applicant.username : 'Unknown';

      return { applyJobId, status, jobTitle: title, username, userId: applicantId };
    }));

    // Filter out null entries
    const filteredData = responseData.filter((data) => data !== null);

    res.status(200).json({ totalApplications: filteredData.length, applications: filteredData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending job applications', error: error.message });
  }
};





const getTotalApplicants = async (req, res) => {
  try {
    const { userId } = req.user;
    const userJobs = await Job.find({ UserId: userId });

    let totalApplicants = 0;

    for (const job of userJobs) {
      totalApplicants += await ApplyJob.countDocuments({ jobId: job._id });
    }

    res.status(200).json({ totalApplicants });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch total applicants', error: error.message });
  }
};


const getSelectedUsersByJobOwner = async (req, res) => {
  const { userId } = req.user;

  try {
    // Find all jobs created by the user
    const userJobs = await Job.find({ UserId: userId });

    // Extract job IDs from the user's jobs
    const jobIds = userJobs.map((job) => job._id);

    // Find applications for the user's jobs where status is 'selected'
    const selectedApplications = await ApplyJob.find({ jobId: { $in: jobIds }, status: 'selected' }).populate('userId').populate('jobId');

    // Process selected applicants data
    const responseData = selectedApplications.map((application) => {
      const { userId, jobId } = application;
      const { username, email } = userId; // Assuming User model has username and email fields
      const { title } = jobId; // Assuming Job model has title field

      return { applyJobId: application._id, jobTitle: title, userId: userId._id, username, email };
    });

    res.status(200).json({ selectedUsers: responseData });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch selected users', error: error.message });
  }
};

const getUserJobApplications = async (req, res) => {
  const { userId } = req.user;

  try {
      // Find all job applications submitted by the user
      const userJobApplications = await ApplyJob.find({ userId }).populate('jobId');

      // Process the job applications data
      const responseData = userJobApplications.map((application) => {
          const { status, jobId } = application;
          const { _id: jobIdVal, title } = jobId || {};

          return { status, jobId: jobIdVal, jobTitle: title || 'Unknown' };
      });

      res.status(200).json({ totalApplications: responseData.length, applications: responseData });
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch job applications for the user', error: error.message });
  }
};

const getUserAppyJob = async (req, res) => {
  const { userId } = req.user;

  try {
      // Find all applications for the user and populate the jobId field
      const applications = await ApplyJob.find({ userId }).populate('jobId');

      // Extract job details from the applications
      const appliedJobs = [];
      for (const application of applications) {
          const { jobId } = application;
          const job = jobId; // Already populated
          const company = await Company.findOne({ UserId: job.UserId });

          if (company) {
              appliedJobs.push({
                  job: {
                      _id: job._id,
                      title: job.title,
                      description: job.description,
                      salary: job.salary,
                      city: job.city,
                      skills: job.skills,
                      deadLine: job.deadLine,
                      category: job.category,
                      worktype: job.worktype,
                      remote: job.remote
                  },
                  company: {
                      name: company.name,
                      logo: company.logo,
                      description: company.description
                  }
              });
          }
      }

      res.status(200).json({ appliedJobs });
  } catch (error) {
      res.status(400).json({ message: 'Failed to fetch applied jobs', error: error.message });
  }
};


module.exports = {
  getJobApplications,
  applyForJob,
  changeApplicationStatus,
  getTotalApplicants,
  getJobApplicationsByOwner,
  getSelectedUsersByJobOwner,
  getUserJobApplications,
  getUserAppyJob,
  getApplicationsByJobOwner
};
