
const User = require('../models/User');



// Controller function to get all users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Controller function to create a user
const createUser = async (req, res) => {
  const { username, email, password, role } = req.body;
  const user = new User({ username, email, password, role });
  try {
    const newUser = await user.save();
    const token = User.generateToken(newUser);
    res.status(201).json({ newUser, token });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller function to update a user
const updateUser = async (req, res) => {
  const { userId } = req.user;
  const { username, email, skills,education } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user._id.toString() !== userId) {
      return res.status(403).json({ message: 'Unauthorized to update this user profile' });
    }
    if (username) user.username = username;
    if (email) user.email = email;
    if (skills) user.skills = skills;
    if (education) user.education = education;
    if (req.file) user.profileImg = req.file.filename;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
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


module.exports = {
  createUser,
  updateUser,
  deleteUser,
  getUser,
  getAllUsers,
  forgotPassword,
  resetPassword
};
