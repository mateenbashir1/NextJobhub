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

        // Create a new company
        const company = new Companie({
            name: req.body.name,
            description: req.body.description,
            industry: req.body.industry,
            address: req.body.address,
            website: req.body.website,
            socialMediaLinks: req.body.socialMediaLinks,
            UserId: req.user.userId
        });

        // Check if a new image was uploaded and update the logo field
        if (req.file) {
            company.logo = req.file.filename;
        }

        // Save the company to the database
        const newCompany = await company.save();

        // // Update the user's role to "admin"
        // await User.findByIdAndUpdate(req.user.userId, { role: 'admin' });

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
    updateCompany,
    gettotallNoCompany
};
