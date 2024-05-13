const Post = require('../models/userPostModel');
const User=require('../models/User')
// Controller function to handle creating a new post with file upload
const createPost = async (req, res) => {
  try {

    const { description } = req.body;
    const { userId } = req.user;
    const post = req.file.path.replace('public', '');

    // Create a new post object
    const newPost = new Post({
      user:userId,
      post,
      description
    });

    // Save the new post to the database
    await newPost.save();

    // Update the user model with the postId reference
    await User.findByIdAndUpdate(
        userId,
        { $push: { postId: newPost._id } }, // Assuming postId is the field in the User model
        { new: true }
      );

    res.status(201).json({ message: 'Post created successfully', post: newPost });
  } catch (error) {
    // If an error occurs, respond with an error message
    res.status(500).json({ message: 'Failed to create post', error: error.message });
  }
};


// Controller function to handle retrieving a post by ID
const getPostById = async (req, res) => {
  try {
    const postId = req.params.id; // Extract post ID from request parameters

    // Retrieve the post from the database by its ID
    const post = await Post.findById(postId).populate('user', 'username profileImg');

    // Check if the post exists
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Respond with the retrieved post
    res.status(200).json({ post });
  } catch (error) {
    // If an error occurs, respond with an error message
    res.status(500).json({ message: 'Failed to retrieve post', error: error.message });
  }
};

// Controller function to handle retrieving all posts by user ID
const getAllPostsByUserId = async (req, res) => {
  try {
    const userId = req.params.userId; // Extract user ID from request parameters

    // Retrieve all posts from the database by user ID
    const posts = await Post.find({ user: userId }).populate('user', 'username profileImg');

    // Respond with the retrieved posts
    res.status(200).json({ posts });
  } catch (error) {
    // If an error occurs, respond with an error message
    res.status(500).json({ message: 'Failed to retrieve posts', error: error.message });
  }
};


module.exports =
 {
     createPost,
     getPostById,
     getAllPostsByUserId
 };
