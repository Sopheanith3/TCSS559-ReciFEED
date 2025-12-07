const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./database/connection');
const jwt = require('jsonwebtoken')

// Import routes
const userRoutes = require('./routes/userRoutes');
const recipeRoutes = require('./routes/recipeRoutes');
const postRoutes = require('./routes/postRoutes');
const searchRoutes = require('./routes/searchRoutes');
const { ErrorResponse } = require('./utils/errorHandler');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());

// Custom middleware to parse JSON but skip for multipart/form-data (which multer handles)
app.use((req, res, next) => {
  // Skip body parsing for multipart/form-data - let multer handle it
  if (req.is('multipart/form-data')) {
    return next();
  }
  express.json({ limit: '10mb' })(req, res, next);
});

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// JWT Token Validation Middleware
// This middleware validates JSON Web Tokens (JWT) in incoming requests
// to ensure that the user is authenticated.
const validateToken = (req, res, next) => {
  // Public routes that don't require authentication
  const publicRoutes = ["/api/users/", "/api/users/login", "api/users/validate"];
  const requestPath = req.originalUrl.toLowerCase(); // Normalize path

  // Skip token validation for public routes
  if (publicRoutes.some((route) => requestPath.startsWith(route))) {
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new ErrorResponse('Unauthorized: Missing or invalid token.', 401));
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach user info
    next();
  } catch (error) {
    return next(new ErrorResponse('Unauthorized: Invalid token.', 401));
  }
};

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    message: 'Welcome to ReciFEED API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      users: '/api/users',
      recipes: '/api/recipes',
      posts: '/api/posts',
      search: '/api/search'
    }
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'success',
    message: 'ReciFEED API is running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/users', validateToken, userRoutes);
app.use('/api/recipes', validateToken, recipeRoutes);
app.use('/api/posts', validateToken, postRoutes);
app.use('/api/search', validateToken, searchRoutes);

// Global Error Handler (must be before 404)
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 Handler - must be absolutely last
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} not found`
  });
});

// Start server
const PORT = process.env.PORT || 5050;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});

module.exports = app;