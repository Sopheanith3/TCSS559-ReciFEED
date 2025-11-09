const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Backend is now connected to MongoDB database');
    console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
    console.log(`📁 Collections:`, await mongoose.connection.db.listCollections().toArray());
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

module.exports = connectDB;