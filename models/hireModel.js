const mongoose = require('mongoose');

const hiringSchema = new mongoose.Schema({

  companyOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  hireUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
//   jobId: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Job',
//     required: true
// },
}, { timestamps: true });

const Hiring = mongoose.model('Hiring', hiringSchema);

module.exports = Hiring;
