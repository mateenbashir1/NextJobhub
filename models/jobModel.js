// models/User.js

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
  city:{
    type:String,
    required:true
  },
  worktype:{
    type:String,
    enum:['full-time','part-time','internship'],
    default:'full-time'
  },
  skills: [String],
  UserId: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
  },
  seats:{
    type:Number,
    required:true
  },
  jobImg: {
    type: String ,
  },
},
{ timestamps: true }
);

module.exports = mongoose.model('Job', jobSchema);
