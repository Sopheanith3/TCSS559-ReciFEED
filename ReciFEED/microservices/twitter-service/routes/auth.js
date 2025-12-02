const express = require("express")
const axios = require("axios");
const OAuth = require("oauth-1.0a");
const crypto = require("crypto");

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

const getOAuthTokens = async () => {
  // Create request data for auth header generation
  const requestData = {
    url: "https://api.twitter.com/oauth/request_token",
    method: "POST",
    data: {
      oauth_callback: "oob",
    },
  };

  // Generate Authorization header
  const authHeader = oauth.toHeader(oauth.authorize(requestData));

  // Send request
  const response = await axios.post(
    requestData.url,
    null,
    {
      params: { oauth_callback: "oob" },
      headers: {
        ...authHeader,
        "Content-Type": "application/json",
      },
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

router.get('/:user', async (req, res) => {
  // TODO check user param

  const request_data = {
    url: "https://api.twitter.com/1.1/account/verify_credentials.json",
    method: "GET",
  };

  try {
    // TODO: Retrieve user tokens from DB
    const token = {
      key: userAccessToken,
      secret: userAccessTokenSecret,
    };

    // If axios does not return error, user is authorized
    await axios.get(request_data.url, {
      headers: oauth.toHeader(oauth.authorize(request_data, token)),
    });

    return res.statusCode(200).json({ authorized: true })
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // User not authorized, start auth process with authorization link
      try {
        const { oauth_token, oauth_token_secret, oauth_callback_confirmed } = getOAuthTokens()
        if (oauth_callback_confirmed !== 'true' || !oauth_token) {
          throw new Error('Could not retrieve valid OAuth token.')
        }

        // TODO: Store auth tokens in DB

        // Return auth flowId and redirect link
        const redirect_link = `https://api.x.com/oauth/authenticate?oauth_token=${oauth_token}`
        return res.statusCode(401).json({ authorized: false, redirect_link })
      } catch (err) {
        return res.statusCode(500).json({ error: 'Internal error, could not retrieve OAuth redirect link.' })
      }
    }

    // Other server error
    return res.statusCode(500).json({ error: 'Internal error, could not verify authorization.' })
  }
});

router.post('/:user', async (req, res) => {
  const url = "https://api.twitter.com/oauth/access_token";

  const { pin } = req.body

  if (!pin) {
    return res.statusCode(400).json({ error: 'Must provide auth pin.' })
  }

  const requestData = {
    url,
    method: "POST",
    data: {
      oauth_verifier: pin,
      oauth_token,
    },
  };
  
  try {
    // TODO: Retrieve user tokens from DB
    const token = {
      key: oauth_token,
      secret: oauth_token_secret,
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
        headers: {
          ...authHeader,
          "Content-Type": "application/json",
        }
      }
    );

    
  } catch (error) {

  }
})

export default router;