const express = require('express')
const axios = require('axios');
const OAuth = require('oauth-1.0a');
const crypto = require('crypto');
const multer = require('multer');
const FormData = require('form-data')
const TwitterUserTokens = require('../models/twitterUserTokens');

const router = express.Router();

// Multer memory storage for images
const upload = multer({ storage: multer.memoryStorage() });

const consumerKey = process.env.TWITTER_CONSUMER_KEY;
const consumerSecret = process.env.TWITTER_CONSUMER_SECRET;

// Create OAuth object to get auth headers
const oauth = new OAuth({
  consumer: { key: consumerKey, secret: consumerSecret },
  signature_method: 'HMAC-SHA1',
  hash_function(base_string, key) {
    return crypto.createHmac('sha1', key).update(base_string).digest('base64');
  },
});

// Helper that uploads image buffer to Twitter under this user for posting
async function uploadMediaToTwitter(access_token, access_secret, buffer) {
  const url = "https://upload.twitter.com/1.1/media/upload.json";

  const requestData = { url, method: "POST" };
  const authHeader = oauth.toHeader(
    oauth.authorize(requestData, { key: access_token, secret: access_secret })
  );

  const formData = new FormData();
  formData.append("media", buffer);

  const response = await axios.post(url, formData, {
    headers: {
      ...authHeader,
      ...formData.getHeaders(),
    },
  });

  return response.data.media_id_string;
}

/**
 * POST /twitter/post
 * Posts a post to Twitter under the current user
 */
router.post('/', upload.array('images', 4), async (req, res) => {
  const text = req.body.text || ''
  const files = req.files || []
  // Retrieve user ID attached to request from token validation
  const { id } = req.user

  if (!text && files.length === 0) {
    return res.status(400).json({ error: 'Must provide either text content or photos for post.' });
  }

  try {
    const userTokens = await TwitterUserTokens.findOne({ userId: id });

    if (!userTokens || !userTokens.access_token || !userTokens.access_secret) {
      return res.status(401).json({ error: 'User not authorized for Twitter.' });
    }

    const { access_token, access_secret } = userTokens;
  
    // Upload images to Twitter
    const mediaIds = [];
    for (const file of files) {
      const mediaId = await uploadMediaToTwitter(access_token, access_secret, file.buffer);
      mediaIds.push(mediaId);
    }

    // Create tweet using API endpoint
    const url = "https://api.twitter.com/2/tweets";
    const requestData = { url, method: "POST" };
    const authHeader = oauth.toHeader(
      oauth.authorize(requestData, { key: access_token, secret: access_secret })
    );

    // Make post request
    const requestBody = {
      text,
      ...(mediaIds.length > 0 && { media: { media_ids: mediaIds } }),
    };
    const response = await axios.post(url, requestBody, {
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
    });

    res.status(200).json({ message: 'Post successful.', post: response.data});
  } catch (error) {
    return res.status(500).json({ error: error.message })
    return res.status(500).json({ error: 'Internal error, could not post to Twitter.' })
  }
})

module.exports = router;