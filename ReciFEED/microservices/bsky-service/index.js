/**
 * Microservice for user interaction with the Bluesky API
 */
const express = require('express');
const axios = require('axios')
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const connectDB = require('./database/connection');
const BskyUserToken = require('./models/bskyUserToken');

// Load environment variables
dotenv.config();

// Multer memory storage for images
const upload = multer({ storage: multer.memoryStorage() });

// Connect to database
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// JWT Token Validation Middleware
// This middleware validates JSON Web Tokens (JWT) in incoming requests
// to ensure that the user is authenticated.
const validateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token.' });
  }
};

app.use('/bsky/validate', validateToken, async (req, res) => {
  try {
    await refreshSession(req.user.id);
    // No error, user this authorized
    return res.status(200).json({ authorized: true })
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ authorized: false })
    }
    return res.status(500).json({ error: 'Internal error, could not validate user in Bsky.' })
  }
});

app.post('/bsky/auth', validateToken, async (req, res) => {
  const { id } = req.user;

  const { identifier, password } = req.body
  if (!identifier || !password ) {
    return res.status(400).json({ error: 'Must provide Bsky identifier and password.' })
  }

  const url = 'https://bsky.social/xrpc/com.atproto.server.createSession'

  try {
    const response = await axios.post(url, { identifier, password })

    const { refreshJwt } = response.data;

    // Store token in DB for user
    await BskyUserToken.findOneAndUpdate(
      { userId: id },
      { refreshJwt },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return res.status(200).json({ message: 'Successfully logged in Bsky user.' })
  } catch (error) {
    return res.status(500).json({ error: 'Internal error, could not validate user.' })
  }
})

// Helper that uploads image buffer to Twitter under this user for posting
const uploadMediaToBsky = async (accessJwt, buffer, mimetype) => {
  const url = 'https://bsky.social/xrpc/com.atproto.repo.uploadBlob';

  const response = await axios.post(url, buffer, {
    headers: { 
      Authorization: `Bearer ${accessJwt}`,
      'Content-Type': mimetype,
    }
  });

  return response.data.blob;
}

const refreshSession = async (userId) => {
  const refreshUrl = 'https://bsky.social/xrpc/com.atproto.server.refreshSession'

  const userToken = await BskyUserToken.findOne({ userId });
  if (!userToken) {
    throw new Error('User not authenticated for Bsky.');
  }

  const refreshResponse = await axios.post(
    refreshUrl,
    null,
    { headers: { Authorization: `Bearer ${userToken.refreshJwt}` } }
  );

  const { did, accessJwt, refreshJwt } = refreshResponse.data;

  // Store auth token in DB for user
  await BskyUserToken.updateOne({ userId }, { refreshJwt });

  return { did, accessJwt };
}

app.post('/bsky/post', upload.array('images', 4), validateToken, async (req, res) => {
  const { id } = req.user;

  const text = req.body.text || ''
  const files = req.files || []

  if (!text && files.length === 0) {
    return res.status(400).json({ error: 'Must provide either text content or photos for post.' });
  }

  const postUrl = 'https://bsky.social/xrpc/com.atproto.repo.createRecord'

  try {
    const { did, accessJwt } = await refreshSession(id)

    // Upload images to Bsky
    const blobs = [];
    for (const file of files) {
      // Verify image file
      if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        return res.status(400).json({ 
          error: `Invalid file type: ${file.originalname}. Only image files are allowed.` 
        });
      }

      const blob = await uploadMediaToBsky(accessJwt, file.buffer, file.mimetype);
      blobs.push({ alt: file.originalname, image: blob });
    }

    // Create post content
    const record = {
      $type: "app.bsky.feed.post",
      text,
      ...(blobs.length > 0 && { 
        embed: { 
            $type: "app.bsky.embed.images", 
            images: blobs 
        } 
      }),
      createdAt: new Date().toISOString()
    };

    // Post to Bsky
    const response = await axios.post(
      postUrl,
      {
        repo: did,
        collection: 'app.bsky.feed.post',
        record
      },
      { headers: { Authorization: `Bearer ${accessJwt}` } }
    );

    return res.status(200).json({ data: response.data })
  } catch (error) {
    if (error.response && error.response.status === 401) {
      return res.status(401).json({ error: 'User not authorized for Bsky' })
    }
    return res.status(500).json({ error: JSON.stringify(error.response?.data, null, 2) })
    return res.status(500).json({ error: 'Internal error, could not create Bsky post.' })
  }
})

// Start server
const PORT = process.env.PORT || 3082;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});

module.exports = app;