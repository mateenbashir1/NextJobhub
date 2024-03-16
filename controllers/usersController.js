
const User = require('../models/User');

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
  const { username, email, skills } = req.body;
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
    if (req.file) user.profileImg = req.file.filename;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Controller function to delete a user
const deleteUser = async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    await user.remove();
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
  getUser
};
