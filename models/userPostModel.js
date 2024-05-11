const mongoose = require('mongoose');

// Define the post schema
const PostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  post: {
    type: String, // Assuming you'll store the image URL
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
},
{timestamps:true}
);

// Create the Post model
const Post = mongoose.model('Post', PostSchema);

module.exports = Post;
