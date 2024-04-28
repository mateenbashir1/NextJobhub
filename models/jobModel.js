const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  salary: {
    type: Number,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  worktype: {
    type: String,
    enum: ['full-time', 'part-time', 'internship'],
    default: 'full-time'
  },
  skills: [String],
  UserId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
  },
  seats: {
    type: Number,
    required: true
  },
  education: {
    type: [String],
    required: true
  },
  deadLine: {
    type: Date,
  },
  category: {
    type: String,
    required: true
  },
  experienceLevel: {
    type: String,
    enum: ['internship', '1 year', '3 year', 'Expert'],
    required: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
