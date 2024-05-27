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
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  city: {
    type: String,
    required: true
  },
  worktype: {
    type: String,
    enum: ['Full Time', 'Part Time'],
    default: 'Full Time'
  },
  skills: [String],
  UserId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
  },
  seats: {
    type: Number,
    required: true
  },
  deadLine: {
    type: Date,
  },
  category: {
    type: String,
    required: true
  },
  remote: {
    type: String,
    enum: ['Yes', 'No'],
  },
  experienceLevel: {
    type: String,
    enum: ['Intern', '1 year', 'Intermediate', 'Expert'],
    required: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
