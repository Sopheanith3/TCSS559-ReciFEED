// ----------------------------------------------
// TCSS 559: Autumn 2025
// Backend MongoDB Schema
// ----------------------------------------------
// Use Mongoose to create MongoDB Schema
// ----------------------------------------------

const mongoose = require('mongoose');

// Create schema for user
const twitterUserTokensSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  oauth_token: { type: String },
  oauth_secret: { type: String },
  access_token: { type: String },
  access_secret: { type: String },
}, { collection: 'twitterUserTokens'});

const TwitterUserTokens = mongoose.model('TwitterUserTokens', twitterUserTokensSchema);

module.exports = TwitterUserTokens;