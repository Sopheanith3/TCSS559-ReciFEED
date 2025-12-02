const express = require("express")
const axios = require("axios");
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");

const router = express.Router()

const consumerKey = process.env.TWITTER_CONSUMER_KEY;
const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;

// Create OAuth object to get auth headers
const oauth = new OAuth({
  consumer: { key: consumerKey, secret: consumerSecret },
  signature_method: "HMAC-SHA1",
  hash_function(base_string, key) {
    return crypto.createHmac("sha1", key).update(base_string).digest("base64");
  },
});

router.post('/post', async (req, res) => {
  
})

export default router;