// models/Interview.js
const mongoose = require('mongoose');



const interviewSchema = new mongoose.Schema({
    dateScheduled: { type: Date, required: true },
    interviewerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    intervieweeID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['Scheduled', 'Completed', 'Cancelled'], default: 'Scheduled' },
    feedback: { type: String }

  });

  module.exports = mongoose.model('interview', interviewSchema);