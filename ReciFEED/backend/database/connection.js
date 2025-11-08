const mongoose = require('mongoose')

const mongoDBConnectString = "mongodb+srv://recifeed_dev_db_user:xyInl7KWe3vRzmQV@recifeed-cluster-0.yywkfdd.mongodb.net/?appName=recifeed-cluster-0"

const connectDB = async () => {
  try {
    await mongoose.connect(mongoDBConnectString);
    console.log('✅ Backend is now connected to MongoDB database')
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
  }
};

module.exports = connectDB;