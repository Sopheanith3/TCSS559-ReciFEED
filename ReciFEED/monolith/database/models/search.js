// ----------------------------------------------
// TCSS 559: Autumn 2025
// Backend MongoDB Schema
// ----------------------------------------------
// Use Mongoose to create MongoDB Schema
// ----------------------------------------------

const mongoose = require('mongoose');

// Create schema for search
const searchSchema = new mongoose.Schema({
  created_at: { type: Date, required: true },
  query: { type: String, required: true },
  filters: { type: [String], required: true },
}, { collection: 'searches'});

const Search = mongoose.model('Search', searchSchema);

module.exports = Search;