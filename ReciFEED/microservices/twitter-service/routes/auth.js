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

// Get Twitter OAuth tokens associated with this app
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

/**
 * Retrieves if user is authenticated for Twitter, and if not gets an auth 
 * redirect link to begin the authentication process for user
 */
router.get('/:userId', async (req, res) => {
  const { userId } =  req.params.userId
  if (!userId) {
    return res.statusCode(400).json({ error: 'Must provide parameter userId.' })
  }

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
        return res.statusCode(401).json({ authorized: false })
    }
    // Other server error
    return res.statusCode(500).json({ error: 'Internal error, could not verify authorization.' })
  }
});

router.post('/:userId/start', async (req, res) => {
  const { userId } =  req.params.userId
  if (!userId) {
    return res.statusCode(400).json({ error: 'Must provide parameter userId.' })
  }

  try {
    const { oauth_token, oauth_token_secret, oauth_callback_confirmed } = getOAuthTokens()
    if (oauth_callback_confirmed !== 'true') {
      return res.statusCode(500).json({ error: 'Could not retrieve valid OAuth token.' });
    }

    // TODO: Store auth tokens in DB for user

    // Return auth flowId and redirect link
    const redirectLink = `https://api.x.com/oauth/authenticate?oauth_token=${oauth_token}`
    return res.statusCode(200).json({ redirectLink })
  } catch (error) {
    return res.statusCode(500).json({ error: 'Internal error, could not verify authorization.' })
  }
});

/**
 * Authenticates a user using an authorization pin after redirect
 */
router.post('/:userId/complete', async (req, res) => {
  const { userId } =  req.params.userId
  if (!userId) {
    return res.statusCode(400).json({ error: 'Must provide parameter userId.' })
  }
  const { pin } = req.body
  if (!pin) {
    return res.statusCode(400).json({ error: 'Must provide auth pin.' })
  }

  const url = "https://api.twitter.com/oauth/access_token";

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

    // Twitter responds in URL-encoded format
    const params = new URLSearchParams(response.data);

    const access_token = params.get("oauth_token");
    const access_secret = params.get("oauth_token_secret");

    // TODO Store in DB under userId

    return res.statusCode(200).json({ message: 'Successfully authenticated Twitter access for this user.' })
  } catch (error) {
    return res.statusCode(500).json({ error: 'Internal error, could not authenticate access.' })
  }
})

export default router;