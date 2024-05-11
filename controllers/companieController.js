const Companie = require('../models/CompanieModel');
const User = require('../models/User');
const Job = require('../models/jobModel')
const ApplyJob = require('../models/ApplyJobModel');

const getAllCompanies = async (req, res, next) => {
    try {
        const companies = await Companie.find();
        console.log(companies)
        res.json(companies);
    } catch (error) {
        next(error);
    }
};

// gettotallNoCompany for website
const gettotallNoCompany = async (req, res) => {
    try {
        const company = await Companie.find();

        res.status(200).json({
            totalCompany: company.length,
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getCompaniesWithUsers = async (req, res, next) => {
    try {
        const companies = await Companie.find().populate('UserId');
        res.json(companies);
    } catch (error) {
        next(error);
    }
};

const createCompany = async (req, res, next) => {
    try {
        // Check if UserId is provided
        if (!req.user.userId) {
            throw new Error("UserId is required");
        }

        // Check if the provided UserId exists in the User collection
        const userExists = await User.exists({ _id: req.user.userId });
        if (!userExists) {
            res.status(500).json({ message: 'User not found' });

        }

        // Check if the user already has a company
        const existingCompany = await Companie.findOne({ UserId: req.user.userId });
        if (existingCompany) {
            res.status(500).json({ message: 'user has already company' });

        }

        const logo = req.file.path.replace('public', ''); // Remove 'public' from the file path
         console.log(logo)
        // Create a new company
        const company = new Companie({
            name: req.body.name,
            description: req.body.description,
            industry: req.body.industry,
            address: req.body.address,
            website: req.body.website,
            socialMediaLinks: req.body.socialMediaLinks, // Corrected field name
            UserId: req.user.userId,
            logo
        });


        // Save the company to the database
        const newCompany = await company.save();

        await User.findByIdAndUpdate(req.user.userId, { role: 'admin' });

        res.status(201).json(newCompany);
    } catch (error) {
        next(error);
    }
};



const updateCompany = async (req, res, next) => {
    const { name, description, industry, website, SocialMediaLinks } = req.body;
    const companyId = req.params.id;

    try {
        // Find the company by ID
        const company = await Companie.findById(companyId);
        if (!company) {
            throw new Error(`No company found with ID: ${companyId}`);
        }

        // Check if the current user is authorized to update the company
        if (req.user.userId !== company.UserId.toString()) {
            throw new Error('Unauthorized to update this company');
        }

        // Update the company
        const updatedCompany = await Companie.findByIdAndUpdate(companyId, req.body, {
            new: true,
            runValidators: true,
        });

        res.json(updatedCompany);
    } catch (error) {
        next(error);
    }
};


const getCompanyById = async (req, res, next) => {
    const companyId = req.params.id;

    try {
        // Find the company by ID and populate the user details excluding the password field
        const company = await Companie.findById(companyId).populate({
            path: 'UserId',
            select: '-password' // Exclude the password field
        });

        if (!company) {
            return res.status(404).json({ message: `Company not found with ID: ${companyId}` });
        }

        res.json(company);
    } catch (error) {
        next(error);
    }
};

const deleteCompany = async (req, res, next) => {
    const companyId = req.params.id;

    try {
        // Find the company by ID
        const company = await Companie.findById(companyId);
        if (!company) {
            return res.status(404).json({ message: 'No company found with ID' });
        }

        if (req.user.role !== 'superadmin' && req.user.userId !== company.UserId.toString()) {
            return res.status(403).json({ message: 'Unauthorized to delete this company' });
        }

        // Delete the company
        await Companie.findByIdAndDelete(companyId);

        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        next(error);
    }
};



const companyDetails = async (req, res, next) => {
    const userId = req.user.userId;

    try {
        // Find all jobs created by the user
        const userJobs = await Job.find({ UserId: userId });

        // Extract job IDs from the user's jobs
        const jobIds = userJobs.map((job) => job._id);

        // Find all apply job entries for the user's jobs
        const applyJobs = await ApplyJob.find({ jobId: { $in: jobIds } });

        // Extract unique user IDs who applied for the user's jobs
        const uniqueUserIds = [...new Set(applyJobs.map((applyJob) => applyJob.userId))];

        // Count the total number of unique users who applied for the user's jobs
        const totalApplyJobUsers = uniqueUserIds.length;

        // Total number of posted jobs by this company owner
        const totalPostedJobs = userJobs.length;

        // Total number of selected users for specific job owners
        const totalSelectedUsers = await ApplyJob.countDocuments({ jobId: { $in: jobIds }, status: 'selected' });

        // Total number of pending job applications
        const totalPendingApplications = await ApplyJob.countDocuments({ jobId: { $in: jobIds }, status: 'pending' });

        res.status(200).json({
            totalApplyJobUsers,
            totalPostedJobs,
            totalSelectedUsers,
            totalPendingApplications
        });
    } catch (error) {
        next(error);
    }
};






module.exports = {
    getAllCompanies,
    getCompaniesWithUsers,
    createCompany,
    updateCompany,
    gettotallNoCompany,
    getCompanyById,
    deleteCompany,
    companyDetails
};
