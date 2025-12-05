// ----------------------------------------------
// TCSS 559: Autumn 2025
// Backend MongoDB Schema
// ----------------------------------------------
// Use Mongoose to create MongoDB Schema
// ----------------------------------------------

const mongoose = require('mongoose');

// Create schema for analytics event
const event = new mongoose.Schema({
  type: { 
    type: String, 
    required: true, 
    enum: [
      'login',
      'create_post',
      'create_recipe',
      'recipe_view',
      'post_interaction',
      'user_view',
      'search'
    ]
  },
  user_id: { type: mongoose.Types.ObjectId, required: true },
  timestamp: { type: Date, default: Date.now(), required: true},
  content: {
    id: { type: mongoose.Types.ObjectId }, // ID of interacted with content (post, recipe, user)
    label: { type: String }, // For recipe, post, user: name of item
    text: { type: String }, // For search
    filters: { type: [String] } // For search event
  }
}, { collection: 'event'});

// ----------------------------------------------
// Indeces
// ----------------------------------------------

// Filter by type + time
event.index({ type: 1, timestamp: -1 });
// Filter by userId
event.index({ userId: 1, timestamp: -1 });
// For recipe views
event.index({ "data.recipeId": 1, timestamp: -1 });
// For post interactions
event.index({ "data.postId": 1, timestamp: -1 });

const Event = mongoose.model('Event', event);

module.exports = Event;