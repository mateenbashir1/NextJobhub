const nodemailer = require('nodemailer');
const Hiring = require('../models/hireModel');
const User = require('../models/User');

const hireUserForJob = async (req, res, next) => {
  try {
    // Extract necessary data from the request
    const { userId } = req.user;
    const { hireUserId } = req.params;
    const { message } = req.body;
    if (!message){
        return res.status(404).json({ message: 'message ie required' });

    }

    // Check if the company owner exists
    const companyOwner = await User.findById(userId);
    if (!companyOwner) {
      return res.status(404).json({ message: 'Company owner not found' });
    }

    // Check if the user exists
    const hiredUser = await User.findById(hireUserId);
    if (!hiredUser) {
      return res.status(404).json({ message: 'Hired user not found' });
    }

    // Create a new hiring record
    const hiring = new Hiring({
      companyOwnerId: userId,
      hireUser:hireUserId
    });

    // Save the hiring record to the database
    const newHiring = await hiring.save();

    // Send email to the hired user
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
        rejectUnauthorized: false
      }
    });

    const mailOptions = {
      from: companyOwner.email,
      to: hiredUser.email,
      subject: 'You have been hired!',
      text: `${message}\n\n`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        // Handle error
      } else {
        console.log('Email sent:', info.response);
        // Handle success
      }
    });

    res.status(201).json(newHiring);
  } catch (error) {
    next(error);
  }
};


const getHiringDetails = async (req, res, next) => {
    try {
      const { hiringId } = req.params;

      // Find hiring details by ID
      const hiring = await Hiring.findById(hiringId);

      if (!hiring) {
        return res.status(404).json({ message: 'Hiring details not found' });
      }

      res.json(hiring);
    } catch (error) {
      next(error);
    }
  };

module.exports = {
  hireUserForJob,
  getHiringDetails
};
