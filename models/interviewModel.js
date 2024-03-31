const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  jobPosterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applyJobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ApplyJob',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'scheduled', 'completed'],
    default: 'pending'
  },
  scheduledDate: {
    type: Date
  },
  notes: {
    type: String
  }
}, { timestamps: true });

module.exports = mongoose.model('Interview', interviewSchema);
