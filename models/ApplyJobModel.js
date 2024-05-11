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
    },
    reason: {
        type: String
    },
    email: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    phoneNumber: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    cv: {
      type:String,
      required:true
    },
    resumeVideo:{
      type:String,
      required:true
    }
}, { timestamps: true });

module.exports = mongoose.model('ApplyJob', ApplyJobSchema);
