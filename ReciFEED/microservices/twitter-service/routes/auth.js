const express = require("express")
const axios = require("axios");
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");
const dotenv = require('dotenv')
const TwitterUserTokens = require('../models/twitterUserTokens')

// Load environment variables
dotenv.config();

const router = express.Router();

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

// Get Twitter OAuth tokens associated with this app
const getOAuthTokens = async () => {
  // Create request data for auth header generation
  const requestData = {
    url: 'https://api.x.com/oauth/request_token?oauth_callback=oob',
    method: "POST",
  };

  console.log(consumerKey, consumerSecret)

  // Generate Authorization header
  const authHeader = oauth.toHeader(oauth.authorize(requestData));

  // Send request
  const response = await axios.post(
    requestData.url,
    null,
    {
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      }
    }
  );

  // Retrieve response fields and return
  const params = new URLSearchParams(response.data);

  return {
    oauth_token: params.get("oauth_token"),
    oauth_token_secret: params.get("oauth_token_secret"),
    oauth_callback_confirmed: params.get("oauth_callback_confirmed"),
  };
}

/**
 * Retrieves if current user is authenticated for Twitter
 */
router.get('/', async (req, res) => {
  // Retrieve user ID as attached to request by token validator
  const { id } =  req.user

  const request_data = {
    url: "https://api.twitter.com/1.1/account/verify_credentials.json",
    method: "GET",
  };

  try {
    // Retrieve user tokens from DB
    const userTokens = await TwitterUserTokens.findOne({ userId: id });
    
    if (!userTokens || !userTokens.access_token || !userTokens.access_secret) {
      return res.status(401).json({ authorized: false });
    }

    const token = {
      key: userTokens.access_token,
      secret: userTokens.access_secret,
    };

    // If axios does not return error, user is authenticated
    await axios.get(request_data.url, {
      headers: oauth.toHeader(oauth.authorize(request_data, token)),
    });

    return res.status(200).json({ authorized: true })
  } catch (error) {
    if (error.response && error.response.status === 401) {
        return res.status(401).json({ authorized: false })
    }
    // Other server error
    return res.status(500).json({ error: 'Internal error, could not verify authentication.' })
  }
});

router.get('/start', async (req, res) => {
  // Retrieve user ID as attached to request by token validator
  const { id } =  req.user

  try {
    const { oauth_token, oauth_token_secret, oauth_callback_confirmed } = await getOAuthTokens()
    if (oauth_callback_confirmed !== 'true') {
      return res.status(500).json({ error: 'Could not retrieve valid OAuth tokens.' });
    }

    // Store auth tokens in DB for user
    await TwitterUserTokens.findOneAndUpdate(
      { userId: id },
      { oauth_token, oauth_secret: oauth_token_secret },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    // Return auth flowId and redirect link
    const redirectLink = `https://api.x.com/oauth/authenticate?oauth_token=${oauth_token}`
    return res.status(200).json({ redirectLink })
  } catch (error) {
    return res.status(500).json({ error: 'Internal error, could not start auth process.' })
  }
});

/**
 * Authenticates a user using an authentication pin after redirect
 */
router.post('/complete', async (req, res) => {
  // Retrieve user ID as attached to request by token validator
  const { id } =  req.user

  const { pin } = req.body
  if (!pin) {
    return res.status(400).json({ error: 'Must provide auth pin.' })
  }

  const url = "https://api.twitter.com/oauth/access_token";
  
  try {
    // Retrieve auth tokens from DB
    const userTokens = await TwitterUserTokens.findOne({ userId: id });
    
    if (!userTokens || !userTokens.oauth_token || !userTokens.oauth_secret) {
      return res.status(401).json({ authorized: false });
    }

    const { oauth_token, oauth_secret } = userTokens

    const requestData = {
      url,
      method: "POST",
      data: {
        oauth_verifier: pin,
        oauth_token,
      },
    };

    const token = {
      key: oauth_token,
      secret: oauth_secret,
    };

    const authHeader = oauth.toHeader(oauth.authorize(requestData, token));

    const response = await axios.post(
      url,
      null,
      {
        params: {
          oauth_verifier: pin,
          oauth_token,
        },
        headers: authHeader
      }
    );

    // Twitter responds in URL-encoded format
    const params = new URLSearchParams(response.data);

    const access_token = params.get("oauth_token");
    const access_secret = params.get("oauth_token_secret");

    // Store new access tokens in DB
    await TwitterUserTokens.findOneAndUpdate(
      { userId: id },
      { access_token, access_secret },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: 'Successfully authenticated Twitter access for this user.' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal error, could not authenticate access.' });
  }
})

module.exports = router;