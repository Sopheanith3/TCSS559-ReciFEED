const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
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

// Get routes
app.use('/event', eventRouter);
app.use('/live', liveRouter);
app.use('/popular', popularRouter);

// Start server
const PORT = process.env.PORT || 3081;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});

module.exports = app;