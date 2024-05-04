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
    socialMediaLinks: {
        facebook: String,
        twitter: String,
        instagram: String,
        github: String,
    },
    UserId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'User',
    },
    logo:{
        type:Buffer,
        required:true
    }
},
{ timestamps: true }
);

module.exports = mongoose.model('Companie', CompanieSchema);
