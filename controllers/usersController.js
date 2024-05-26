
const User = require('../models/User');



// Controller function to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json({ totalUser: users.length, users });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//gettotallNoJobs for the website
const gettotallNoUser = async (req, res) => {
  try {
    const user = await User.find();

    res.status(200).json({
      totalUser: user.length,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Controller function to create a user
const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const userDuplicate = await User.findOne({ email: email });
  if (userDuplicate) {
    return res.status(404).json({ message: `${email} already taken, please provide another email` });
  }
  const user = new User({ username, email, password, role });
  try {
    const newUser = await user.save();
    const token = User.generateToken(newUser);
    res.status(201).json({ userData: { newUser }, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};


const updateUser = async (req, res) => {
  const userIds = req.user.userId;
  const { userId } = req.params;
  const { username, email, skills, education, phone, profession, socialMedia, city, dateOfBirth } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user._id.toString() !== userIds) {
      return res.status(403).json({ message: 'Unauthorized to update this user profile' });
    }

    let profileImg = '';
    let cv = '';

    // Check if files are uploaded
    if (req.files) {
      if (req.files['profileImg']) {
        profileImg = req.files['profileImg'][0].path.replace('public', ''); // Remove 'public' from the file path
      }
      if (req.files['cv']) {
        // Check if the CV is in PDF format
        if (req.files['cv'][0].mimetype !== 'application/pdf') {
          return res.status(400).json({ message: 'CV must be in PDF format' });
        }
        cv = req.files['cv'][0].path.replace('public', ''); // Remove 'public' from the file path
      }
    }

    // Update user fields if provided in the request body
    if (username) user.username = username;
    if (email) user.email = email;
    if (skills) user.skills = skills;
    if (education) user.education = education;
    if (profession) user.profession = profession;
    if (city) user.city = city;
    if (phone) user.phone = phone;
    if (socialMedia) user.socialMedia = socialMedia;
    if (dateOfBirth) user.dateOfBirth = new Date(dateOfBirth); // Convert to Date object if necessary
    if (profileImg) user.profileImg = profileImg;
    if (cv) user.cv = cv;

    // Save the updated user
    const updatedUser = await user.save();

    // Omit password from the response
    updatedUser.password = undefined;

    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// get user by id
const getUserById = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Omit password from the response
    user.password = undefined;

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err.message });
  }
};

// Controller function to delete a user
const deleteUser = async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user.userId; // Corrected property name
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user is a super admin or is deleting their own account
    if (!req.isSuperAdmin && userId !== requesterId) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own account' });
    }

    await user.deleteOne();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const { generateResetToken, sendPasswordResetEmail } = require('../utils/passwordResetUtils');

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const resetToken = generateResetToken(user);

    // Send password reset email with the resetToken
    await sendPasswordResetEmail(user, resetToken);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error('Error sending password reset email:', error);
    res.status(500).json({ message: 'Failed to send password reset email' });
  }
};

const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Find user by reset token
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return res.status(404).json({ message: 'Invalid or expired token' });
    }

    // Update user's password
    user.password = newPassword;
    user.resetToken = null;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('Error resetting password:', error);
    res.status(500).json({ message: 'Failed to reset password' });
  }
};





// Middleware function to get a user by ID
async function getUser(req, res, next) {
  let user;
  try {
    user = await User.findById(req.params.id);
    if (user == null) {
      return res.status(404).json({ message: 'Cannot find user' });
    }
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }

  res.user = user;
  next();
}


const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');

const sendVerificationEmail = async (req, res, next) => {
  try {
    // Check if email is provided in the request body
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if the email exists in the database
    const existingUser = await User.findOne({ email });
    if (!existingUser) {
      return res.status(404).json({ message: 'User not found with provided email' });
    }

    // Generate OTP
    const otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false
    });

    // Update user's OTP in the database
    existingUser.otp = otp;
    await existingUser.save();

    // Send email with OTP
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
      from: 'mateenbashirm@gmail.com',
      to: email,
      subject: 'Email Verification OTP',
      text: `Your OTP for email verification is: ${otp}`
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ message: 'Failed to send email' });
      }
      console.log('Email sent:', info.response);
    });
    res.status(200).json({ email,message: 'Email sent successfully' });

  } catch (error) {
    next(error);
  }
};

const verifyEmailOTP = async (req, res, next) => {
  try {
    // Check if email and OTP are provided in the request body
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ message: 'Email and OTP are required' });
    }

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: 'User not found with provided email' });
    }

    // Check if the provided OTP matches the user's OTP
    if (user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Clear the OTP from the user's record
    user.otp = null;
    user.isVerify = true;

    await user.save();

    // Send response indicating successful verification
    res.status(200).json({ message: 'Email verification successful' });
  } catch (error) {
    next(error);
  }
};

// Controller function to get current user's username and profile image
const getCurrentUserProfile = async (req, res) => {
  const userId = req.user; // Assuming you have middleware that sets req.user

  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare response with username and profile image
    const userProfile = {
      username: user.username,
      profileImg: user.profileImg,

    };

    res.json(userProfile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};





module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  forgotPassword,
  resetPassword,
  getUserById,
  gettotallNoUser,
  sendVerificationEmail,
  verifyEmailOTP,
  getCurrentUserProfile
};

