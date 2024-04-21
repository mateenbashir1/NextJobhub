// models/User.js

const mongoose = require('mongoose');

const CompanieSchema = new mongoose.Schema({
    name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true,
  },
  industry: {
    type: String,
    required: true
  },
  address:{
    type:String,
    required:true
  },
  website: {
    type: String,
    required: true
  },
  SocialMediaLinks: {
    type: String,
    required: true
  },
  UserId: {
     type: mongoose.Schema.Types.ObjectId, ref: 'User',
 },
 logo:{
  type:String,
  required:true
 }
},
{ timestamps: true }
);

module.exports = mongoose.model('Companie', CompanieSchema);
