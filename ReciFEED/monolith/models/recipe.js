// ----------------------------------------------
// TCSS 559: Autumn 2025
// Backend MongoDB Schema
// ----------------------------------------------
// Use Mongoose to create MongoDB Schema
// ----------------------------------------------

const mongoose = require('mongoose');

// Create schema for recipe
const recipeSchema = new mongoose.Schema({
  created_at: { type: Date, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
  title: { type: String, required: true },
  tags: { type: [String], default: [] },
  ingredients: { type: [String], default: [] },
  instructions: { type: [String], default: [] },
  image_urls: { type: [String], default: [] },
  reviews: { type: [{
    user_id: { type: mongoose.Schema.Types.ObjectId, required: true },
    username: { type: String },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
    created_at: { type: Date, required: true },
  }], default: [] },
}, { collection: 'recipes'});

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;