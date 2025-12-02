// ----------------------------------------------
// TCSS 559: Autumn 2025
// Backend MongoDB Schema
// ----------------------------------------------
// Use Mongoose to create MongoDB Schema
// ----------------------------------------------

const mongoose = require('mongoose');

// Create schema for nested field encrypted token
const encryptedTokenSchema = new mongoose.Schema({
  ciphertext: { type: String, required: true },
  iv: { type: String, required: true },
  authTag: { type: String, required: true }
}, { _id: false });

// Create schema for user
const twitterUserTokensSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  oauth_token: { type: encryptedTokenSchema },
  oauth_secret: { type: encryptedTokenSchema },
  access_token: { type: encryptedTokenSchema },
  access_secret: { type: encryptedTokenSchema },
}, { collection: 'twitterUserTokens'});

const TwitterUserTokens = mongoose.model('TwitterUserTokens', twitterUserTokensSchema);

module.exports = TwitterUserTokens;