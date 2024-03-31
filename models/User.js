const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ // Regular expression for email validation
  },
  password: {
    type: String,
    required: true,
    // minlength: 6, // Minimum password length
    // maxlength: 20 // Maximum password length
  },
  role: {
    type: String,
    required: true
  },
  profileImg: {
    type: String ,
  },
  skills: {
    type: [String],
  },
});

// Static method to compare passwords
UserSchema.statics.comparePassword = async function(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
};

// Pre-save hook to hash the password before saving the user
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(this.password, salt);
    this.password = hashedPassword;
    next();
  } catch (error) {
    return next(error);
  }
});
const token =

UserSchema.statics.generateToken = function(user) {
  return jwt.sign({ userId: user._id, role: user.role }, 'secret_key', { expiresIn: '1h' });; // Replace 'your-secret-key' with your actual secret key
};

module.exports = mongoose.model('User', UserSchema);
