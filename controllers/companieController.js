const Companie = require('../models/CompanieModel');
const User = require('../models/User');

const getAllCompanies = async (req, res, next) => {
    try {
        const companies = await Companie.find();
        console.log(companies)
        res.json(companies);
    } catch (error) {
        next(error);
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
            throw new Error("User with the provided UserId not found");
        }

        // Create a new company
        const company = new Companie({
            name: req.body.name,
            description: req.body.description,
            industry: req.body.industry,
            address:req.body.address,
            website: req.body.website,
            SocialMediaLinks: req.body.SocialMediaLinks,
            UserId: req.user.userId
        });

        // Save the company to the database
        const newCompany = await company.save();
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

module.exports = {
    getAllCompanies,
    getCompaniesWithUsers,
    createCompany,
    updateCompany
};
