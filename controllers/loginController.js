const User = require('../models/User');

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check the password
    if (!password) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    const isMatch = await User.comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password." });
    }
    const token = User.generateToken(user);

    return res.status(200).json({ message: "User login success",userData :{userId: user._id, user_email: user.email, user_username: user.username, token}, statusCode: 200 });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "An error occurred." });
  }
};

module.exports = {
  loginUser
};
