const Job = require('../models/jobModel');
const Company = require('../models/CompanieModel')
const moment = require('moment');

const getJobs = async (req, res) => {
  try {
    const jobs = await Job.find({remote : 'No'})
    .sort({ createdAt: -1 }).populate({
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
        logo: company.logo,
        description:company.description
      };
    });

    // Prepare response data with companyName, companyLogoUrl, and username included for each job
    const responseData = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      description: job.description,
      salary: {
        min: job.salary.min,
        max: job.salary.max
      },
      city: job.city,
      skills: job.skills,
      companyLogo: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].logo,
      username: job.UserId && job.UserId.username,
      deadLine: job.deadLine,
      category: job.category,
      worktype: job.worktype,
      remote:job.remote
    }));

    res.json({totaljob:responseData.length,responseData});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getRemoteJobs = async (req, res) => {
  try {
    const jobs = await Job.find({remote : 'Yes'}) .sort({ createdAt: -1 }).populate({
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
        logo: company.logo,
        description:company.description
      };
    });

    // Prepare response data with companyName, companyLogoUrl, and username included for each job
    const responseData = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      description: job.description,
      salary: {
        min: job.salary.min,
        max: job.salary.max
      },
      city: job.city,
      skills: job.skills,
      companyLogo: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].logo,

      // companyName: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].name,
      // companyDetails: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].description,

      username: job.UserId && job.UserId.username,
      deadLine: job.deadLine,
      category: job.category,
      worktype: job.worktype,
      remote:job.remote
    }));

    res.json({totaljob:responseData.length,responseData});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to fetch all jobs with filters
const getAllRemoteJobsWithFilters = async (req, res, next) => {
  try {
    const { city, category, title, minSalary, maxSalary, worktype, experienceLevel, sort } = req.query;
    const queryObject = {};

    const currentDate = new Date(); // Get the current date

    // Adding filters to the queryObject
    if (title && title !== 'all') {
      queryObject.title = { $regex: new RegExp(`.*${title}.*`, 'i') };
    }

    if (category && category !== 'all') {
      queryObject.category = { $regex: new RegExp(category, 'i') };
    }

    if (city && city !== 'all') {
      queryObject.city = { $regex: new RegExp(city, 'i') };
    }

    if (minSalary && maxSalary && minSalary !== 'all' && maxSalary !== 'all') {
      queryObject['salary.min'] = { $gte: minSalary };
      queryObject['salary.max'] = { $lte: maxSalary };
    }

    if (worktype && worktype !== 'all') {
      queryObject.worktype = worktype;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      queryObject.experienceLevel = experienceLevel;
    }

    // Filter to show only remote jobs
    queryObject.remote = "Yes";

    // Filter to exclude expired jobs
    queryObject.deadLine = { $gte: currentDate };

    let jobs;

    if (Object.keys(queryObject).length === 0 && queryObject.constructor === Object) {
      jobs = await Job.find().sort({ createdAt: -1 }).populate('UserId');
    } else {
      jobs = await Job.find(queryObject).populate('UserId');
    }

    // Extract user IDs from the populated jobs
    const userIds = jobs.map(job => job.UserId && job.UserId._id);

    // Fetch companies using the user IDs
    const companies = await Company.find({ UserId: { $in: userIds } });

    // Create a mapping of user ID to company name and logo URL
    const userCompanyMap = {};
    companies.forEach(company => {
      userCompanyMap[company.UserId.toString()] = {
        name: company.name,
        logo: company.logo,
        description: company.description
      };
    });

    // Prepare response data with companyName, companyLogoUrl, and username included for each job
    const responseData = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      description: job.description,
      salary: {
        min: job.salary.min,
        max: job.salary.max
      },
      city: job.city,
      skills: job.skills,
      companyLogo: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].logo,
      companyName: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].name,
      companyDetails: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].description,
      username: job.UserId && job.UserId.username,
      deadLine: job.deadLine,
      category: job.category,
      worktype: job.worktype,
      remote: job.remote
    }));

    res.json({ totalJobs: responseData.length, jobs: responseData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
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
      const jobs = await Job.find({ UserId: req.user.userId }).sort({ createdAt: -1 });

      res.status(200).json({
        totalJobs: jobs.length,
        jobs: jobs
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };
// categary
const getAllCategories = async (req, res) => {
    try {
      const categories = await Job.distinct("category").sort({ createdAt: -1 });
      res.status(200).json(categories);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  };


// create job
const createJob = async (req, res) => {
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

    // Save the job
    const newJob = await job.save();
    res.status(201).json(newJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


// Controller function to fetch all jobs with filters
const getAllJobsWithFilters = async (req, res, next) => {
  try {
    const {
      city, category, title, minSalary, maxSalary, worktype, experienceLevel, sort, page = 1, pageSize = 20
    } = req.query;
    const queryObject = {};
    const currentDate = new Date();

    if (title && title !== 'all') {
      queryObject.title = { $regex: new RegExp(`.*${title}.*`, 'i') };
    }

    if (category && category !== 'all') {
      queryObject.category = { $regex: new RegExp(category, 'i') };
    }

    if (city && city !== 'all') {
      queryObject.city = { $regex: new RegExp(city, 'i') };
    }

    if (minSalary && maxSalary && minSalary !== 'all' && maxSalary !== 'all') {
      queryObject['salary.min'] = { $gte: minSalary };
      queryObject['salary.max'] = { $lte: maxSalary };
    }

    if (worktype && worktype !== 'all') {
      queryObject.worktype = worktype;
    }

    if (experienceLevel && experienceLevel !== 'all') {
      queryObject.experienceLevel = experienceLevel;
    }

    // Add filter for remote jobs
    queryObject.remote = "No";

    // Add filter to exclude expired jobs
    queryObject.deadLine = { $gte: currentDate };

    // Calculate pagination parameters
    const skip = (page - 1) * pageSize;
    const limit = parseInt(pageSize);

    // Fetch the total number of jobs matching the filters
    const totalJobs = await Job.countDocuments(queryObject);

    let jobs = await Job.find(queryObject)
      .sort({ createdAt: -1 })
      .populate('UserId')
      .skip(skip)
      .limit(limit);

    // Extract user IDs from the populated jobs
    const userIds = jobs.map(job => job.UserId && job.UserId._id);

    // Fetch companies using the user IDs
    const companies = await Company.find({ UserId: { $in: userIds } });

    // Create a mapping of user ID to company name and logo URL
    const userCompanyMap = {};
    companies.forEach(company => {
      userCompanyMap[company.UserId.toString()] = {
        name: company.name,
        logo: company.logo,
        description: company.description
      };
    });

    // Prepare response data with companyName, companyLogoUrl, and username included for each job
    const responseData = jobs.map(job => ({
      _id: job._id,
      title: job.title,
      description: job.description,
      salary: {
        min: job.salary.min,
        max: job.salary.max
      },
      city: job.city,
      skills: job.skills,
      companyLogo: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].logo,
      companyName: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].name,
      companyDetails: job.UserId && userCompanyMap[job.UserId._id.toString()] && userCompanyMap[job.UserId._id.toString()].description,
      username: job.UserId && job.UserId.username,
      deadLine: job.deadLine,
      category: job.category,
      worktype: job.worktype,
      remote: job.remote
    }));

    res.json({
      totalJobs,
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalJobs / pageSize),
      jobs: responseData
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};



// Controller function to update a job
const updateJob = async (req, res) => {
  const jobId = req.params.id;
  const { title, skills, city, salary, description, worktype, seats, experienceLevel, category, deadLine, remote } = req.body;

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
    const updatedJob = await Job.findOneAndUpdate(
      { _id: jobId },
      {
        title: title || job.title,
        description: description || job.description,
        salary: salary || job.salary,
        city: city || job.city,
        worktype: worktype || job.worktype,
        skills: skills || job.skills,
        seats: seats || job.seats,
        experienceLevel: experienceLevel || job.experienceLevel,
        category: category || job.category,
        deadLine: deadLine || job.deadLine,
        remote: remote || job.remote
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.json(updatedJob);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};



  // Controller function to fetch jobs for a single user with filters
const filterJobsForSingleUser = async (req, res) => {
    try {
      const {  worktype,city, sort } = req.query;
      const queryObject = {
        UserId: req.user.userId // Filter by user ID
      };
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




// getJobsByCategory


const getJobsByCategory = async (req, res) => {
  try {
      const { category } = req.params;

      // Find all jobs with the specified category
      const jobs = await Job.find({ category });

      res.status(200).json(jobs);
  } catch (error) {
      res.status(500).json({ message: 'Failed to fetch jobs by category', error: error.message });
  }
};


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

const getJobById = async (req, res) => {
  try {
    // Extract job ID from request parameters
    const jobId = req.params.id;

    // Fetch job by ID
    const job = await Job.findById(jobId).populate('UserId');

    if (!job) {
      return res.status(404).json({ message: 'Job not found' });
    }

    // Fetch company associated with the job
    const company = await Company.findOne({ UserId: job.UserId });

    // Prepare response data with companyName, companyLogoUrl, and companyDetails included for the job
    const responseData = {
      _id: job._id,
      title: job.title,
      description: job.description,
      salary: {
        min: job.salary.min,
        max: job.salary.max
      },
      seats:job.seats,
      city: job.city,
      skills: job.skills,
      companyLogo: company ? company.logo : null,
      companyId: company ? company._id : null,
      companyName: company ? company.name : null,
      companyDetails: company ? company.description : null,
      username: job.UserId.username,
      deadLine: job.deadLine,
      category: job.category,
      worktype: job.worktype,
      remote:job.remote,
      experienceLevel:job.experienceLevel,
      createdAt:job.createdAt
    };

    res.json(responseData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




const getJobsWithExpiredDeadline = async (req, res) => {
    try {
      const { userId } = req.user;
      const currentDate = moment().toDate(); // Get current date
      const expiredJobs = await Job.find({ UserId: userId, deadLine: { $lt: currentDate } });
      res.status(200).json(expiredJobs);
    } catch (err) {
      res.status(500).json({ message: 'Failed to fetch jobs with expired deadline', error: err.message });
    }
  };



const getTrendingJobs = async (req, res) => {
  try {

    const jobs = await Job.find();

      const categoryCounts = {};
      jobs.forEach((job) => {
        const title = job.title.toLowerCase();
        categoryCounts[title] = (categoryCounts[title] || 0) + 1;
      });

      const sortedCategories = Object.keys(categoryCounts).sort((a, b) => categoryCounts[b] - categoryCounts[a]);

      const trendingCategories = sortedCategories.slice(0, 4);

      res.status(200).json({ trendingCategories });
    } catch (error) {
      console.error('Error fetching trending jobs:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
};

const getAllCities = async (req, res) => {
  try {
    // Retrieve all unique cities from the job model
    const cities = await Job.distinct('city');

    res.status(200).json({ cities });
  } catch (error) {
    console.error('Error fetching cities:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    gettotallNoJobs,
    getJobsByCategory,
    getAllCategories,
    getJobById,
    getJobsWithExpiredDeadline,
    getTrendingJobs,
    getRemoteJobs,
    getAllCities,
    getAllRemoteJobsWithFilters
  };
