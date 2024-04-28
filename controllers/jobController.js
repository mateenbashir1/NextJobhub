const Job = require('../models/jobModel');
const Company = require('../models/CompanieModel');

const getJobs = async (req, res) => {
  try {
      const jobs = await Job.find().populate({
          path: 'UserId',
          select: 'username',
      });

      // Extract user IDs from the populated jobs
      const userIds = jobs.map(job => job.UserId && job.UserId._id);

      // Fetch companies using the user IDs
      const companies = await Company.find({ UserId: { $in: userIds } });

      // Create a mapping of user ID to company name and logo URL
      const userCompanyMap = {};
      companies.forEach(company => {
          userCompanyMap[company.UserId.toString()] = {
              name: company.name,
              logo: company.logo // Assuming you have a field for storing the logo URL in the Company schema
          };
      });
      // Prepare response data with companyName, companyLogoUrl, and username included for each job
      const responseData = jobs.map(job => ({
          _id: job._id,
          title: job.title,
          description: job.description,
          salary: job.salary,
          city: job.city,
          skills: job.skills,
          companyName: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].name,
          companyLogo: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].logo,
          username: job.UserId && job.UserId.username
      }));

      res.json(responseData);
  } catch (err) {
      res.status(500).json({ message: err.message });
  }
};


const gettotallNoJobs = async (req, res) => {
  try {
    const jobs = await Job.find();

    res.status(200).json({
      totalJobs: jobs.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// get singal user jobs
const getUserJobs = async (req, res) => {
    try {
      const jobs = await Job.find({ UserId: req.user.userId });

      res.status(200).json({
        totalJobs: jobs.length,
        jobs: jobs
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };


// Controller function to create a new job
const createJob = async (req, res) => {
    try {
      // Check if the user has a company
      const company = await Company.findOne({ UserId: req.user.userId });
      if (!company) {
        return res.status(403).json({ message: 'You need to create a company before posting a job' });
      }

      // Create a new job
      const job = new Job({
        title: req.body.title,
        description: req.body.description,
        salary: req.body.salary,
        city: req.body.city,
        skills: req.body.skills,
        status: req.body.status,
        workType: req.body.workType,
        seats: req.body.seats,
        UserId: req.user.userId
      });

      // Save the job
      const newJob = await job.save();
      res.status(201).json(newJob);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  };

// Controller function to update a job
const updateJob = async (req, res) => {
  const jobId = req.params.id;
  const { title, skills, city, salary, description,education } = req.body;

  try {
    // Check if the job post exists
    const job = await Job.findOne({ _id: jobId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the user is authorized to update the job post
    if (!req.isSuperAdmin && req.user.userId !== job.UserId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to update this job post' });
    }

    // Update job details
    const updatedJob = await Job.findOneAndUpdate({ _id: jobId }, req.body, {
      new: true,
      runValidators: true,
    });

    // Check if a new image was uploaded and update jobImg field
    if (req.file) {
      updatedJob.jobImg = req.file.filename;
      await updatedJob.save();
    }

    res.json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


  // Controller function to fetch jobs for a single user with filters
const filterJobsForSingleUser = async (req, res) => {
    try {
      const { status, worktype, sort } = req.query;
      const queryObject = {
        UserId: req.user.userId // Filter by user ID
      };
      if (status && status !== 'all') {
        queryObject.status = status; // Optionally filter by job status
      }
      if (worktype && worktype !== 'all') {
        queryObject.worktype = worktype; // Optionally filter by job workType
      }
      let jobs = await Job.find(queryObject);

      // Sorting
      if (sort === 'latest') {
        jobs = jobs.sort((a, b) => b.createdAt - a.createdAt);
      }
      if (sort === 'oldest') {
        jobs = jobs.sort((a, b) => a.createdAt - b.createdAt);
      }
      if (sort === 'a-z' || sort === 'A-Z') {
        jobs = jobs.sort((a, b) => a.title.localeCompare(b.title));
      }
      if (sort === 'z-a') {
        jobs = jobs.sort((a, b) => b.title.localeCompare(a.title));
      }
      res.status(200).json({
        totalJobs: jobs.length,
        jobs: jobs
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

// Controller function to fetch all jobs with filters
const getAllJobsWithFilters = async (req, res) => {
    try {
      const { city, title, minSalary, maxSalary, worktype, sort } = req.query;
      const queryObject = {};

      if (title && title !== 'all') {
        queryObject.title = { $regex: new RegExp(`.*${title}.*`, 'i') };
      }

      if (city && city !== 'all') {
        queryObject.city = { $regex: new RegExp(city, 'i') }; // Case-insensitive search for city
      }

      if (minSalary && maxSalary && minSalary !== 'all' && maxSalary !== 'all') {
        queryObject.salary = { $gte: minSalary, $lte: maxSalary };
      }

      if (worktype && worktype !== 'all') {
        queryObject.worktype = worktype; // Optionally filter by job workType
      }

      let jobs = await Job.find(queryObject);

      // Sorting
      if (sort === 'latest') {
        jobs = jobs.sort((a, b) => b.createdAt - a.createdAt);
      } else if (sort === 'oldest') {
        jobs = jobs.sort((a, b) => a.createdAt - b.createdAt);
      } else if (sort === 'a-z' || sort === 'A-Z') {
        jobs = jobs.sort((a, b) => a.title.localeCompare(b.title));
      } else if (sort === 'z-a') {
        jobs = jobs.sort((a, b) => b.title.localeCompare(a.title));
      }

      res.status(200).json({
        totalJobs: jobs.length,
        jobs: jobs
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  };

// Controller function to delete a job post
// const deleteJob = async (req, res) => {
//     const jobId = req.params.id;
//     try {
//       // Check if the job post exists
//       const job = await Job.findOne({ _id: jobId });
//       if (!job) {
//         return res.status(404).json({ message: 'Job not found' });
//       }
//       // Check if the user is authorized to delete the job post
//       if (req.user.userId !== job.UserId.toString()) {
//         return res.status(403).json({ message: 'Unauthorized to delete this job post' });
//       }

//       await Job.deleteOne({ _id: jobId });
//       res.json({ message: 'Job deleted successfully' });
//     } catch (err) {
//       res.status(400).json({ message: err.message });
//     }
//   };



// Controller function to delete a job post


const deleteJob = async (req, res) => {
  const jobId = req.params.id;
  try {
    // Check if the job post exists
    const job = await Job.findOne({ _id: jobId });
    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Check if the user is authorized to delete the job post
    if (!req.isSuperAdmin && req.user.userId !== job.UserId.toString()) {
      return res.status(403).json({ message: 'Unauthorized to delete this job post' });
    }

    await Job.deleteOne({ _id: jobId });
    res.json({ message: 'Job deleted successfully' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};




const getSuggestedJobs = async (req, res) => {
  try {
    // Extract user skills from the request (assuming it's available in req.user.skills)
    const userSkills = req.user.skills; // Assuming user skills are stored in req.user.skills
        console.log(userSkills)
    // Query for jobs that require any of the user's skills
    const suggestedJobs = await Job.find({ skills: { $in: userSkills } });

    res.status(200).json({ suggestedJobs });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch suggested jobs', error: error.message });
  }
  };


  module.exports = {
    getJobs,
    getUserJobs,
    createJob,
    updateJob,
    filterJobsForSingleUser,
    getAllJobsWithFilters,
    deleteJob,
    getSuggestedJobs,
    gettotallNoJobs
  };
