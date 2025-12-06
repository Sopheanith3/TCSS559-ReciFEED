const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const eventRouter = require('./routes/eventRoutes')
const liveRouter = require('./routes/liveRoutes');
const popularRouter = require('./routes/popularRoutes');
const connectDB = require('./database/connection');

// Load environment variables
dotenv.config();

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ 
    message: 'Analytics microservice is running',
    timestamp: new Date().toISOString()
  });
});

// Get routes
app.use('/event', validateToken, eventRouter);
app.use('/live', liveRouter);
app.use('/popular', popularRouter);

// Start server
const PORT = process.env.PORT || 3081;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});

module.exports = app;