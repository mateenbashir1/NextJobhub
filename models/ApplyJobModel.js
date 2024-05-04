// models/ApplyJobModel.js
const mongoose = require('mongoose');

const ApplyJobSchema = new mongoose.Schema({
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'selected', 'rejected', 'interview'],
    default: 'pending'
  }
},
{timestamps:true});

module.exports = mongoose.model('ApplyJob', ApplyJobSchema);
