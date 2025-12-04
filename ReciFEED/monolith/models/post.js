// ----------------------------------------------
// TCSS 559: Autumn 2025
// Backend MongoDB Schema
// ----------------------------------------------
// Use Mongoose to create MongoDB Schema
// ----------------------------------------------

const mongoose = require('mongoose');

// Create schema for post
const postSchema = new mongoose.Schema({
  created_at: { type: Date, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  username: { type: String },
  recipe_id: { type: mongoose.Schema.Types.ObjectId },
  body: { type: String, required: true },
  image_urls: { type: [String], default: [] },
  likes: { type: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String},
    created_at: { type: Date, required: true },
  }], default: [] },
  comments: { type: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String},
    created_at: { type: Date, required: true },
    text: { type: String, required: true },
  }], default: [] },
}, { collection: 'posts'});

const Post = mongoose.model('Post', postSchema);

module.exports = Post;