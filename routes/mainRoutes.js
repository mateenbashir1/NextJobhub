const express = require('express');
const router = express.Router();
const User =require('../models/User')
const Job =require('../models/jobModel')
const Companie =require('../models/CompanieModel');
const TotalApplicants =require('../models/ApplyJobModel')





router.get('/', async (req, res) => {
    try {
      const user = await User.find();
      const jobs = await Job.find();
      const company = await Companie.find();
      const totalApplicants=await TotalApplicants.find()
      res.status(200).json({
        totalJobs: jobs.length,
        totalUser: user.length,
        totalCompany: company.length,
        totalApplicants:totalApplicants.length,

      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });

  module.exports = router;

