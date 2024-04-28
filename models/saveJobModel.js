
const mongoose = require('mongoose');

const SavedJobSchema = new mongoose.Schema({
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
},
{
    timestamps:true
},
);

module.exports = mongoose.model('SavedJob', SavedJobSchema);

