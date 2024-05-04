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
  },
  password: {
    type: String,
    required: true,
  },
  profession:{
   type:String
  },
  role: {
    type: String,
    default:"user"
  },
  profileImg: {
    type: String ,
  },
  socialMedia: {
    facebook: String,
    twitter: String,
    instagram: String
  },
  skills: {
    type: [String],
  },
  phone: {
    type: String
  },
  education:{
    type:[String],
  },
  dateOfBirth:{
    type:Date,
  },
  city:{
    type:String
  },
  resetToken: {
    type: String,
    default: null
},
resetTokenExpires: {
    type: Date,
    default: null
}
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

UserSchema.statics.generateToken = function(user) {
  return jwt.sign({ userId: user._id, role: user.role }, 'secret_key', { expiresIn: '6h' });; // Replace 'your-secret-key' with your actual secret key
};

module.exports = mongoose.model('User', UserSchema);
