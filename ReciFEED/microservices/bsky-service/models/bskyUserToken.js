// ----------------------------------------------
// TCSS 559: Autumn 2025
// Backend MongoDB Schema
// ----------------------------------------------
// Use Mongoose to create MongoDB Schema
// ----------------------------------------------

const mongoose = require('mongoose');

// Create schema for user
const bskyUserTokenSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  refreshJwt: { type: String, required: true}
}, { collection: 'bskyUserToken'});

const BskyUserToken = mongoose.model('BskyUserToken', bskyUserTokenSchema);

module.exports = BskyUserToken;