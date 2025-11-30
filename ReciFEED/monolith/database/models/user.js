// ----------------------------------------------
// TCSS 559: Autumn 2025
// Backend MongoDB Schema
// ----------------------------------------------
// Use Mongoose to create MongoDB Schema
// ----------------------------------------------

const mongoose = require('mongoose');

// Create schema for user
const userSchema = new mongoose.Schema({
  created_at: { type: Date, required: true },
  email: { type: String, required: true },
  password_hash: { type: String, required: true },
  username: { type: String, required: true },
}, { collection: 'users'});

const User = mongoose.model('User', userSchema);

module.exports = User;