// -----------------------------------------------------------
// TCSS 559: Autumn 2025
// Import Helper or Utility for MongoDB Database
// Designed primarily for TCSS 559
// -----------------------------------------------------------
// required libraries
const { MongoClient } = require('mongodb');
const fs = require('fs');   // for filesystem input/output

// ***********************************************************
// (A) Connection string
// ***********************************************************
const uri = "mongodb+srv://recifeed_dev_db_user:xyInl7KWe3vRzmQV@recifeed-cluster-0.yywkfdd.mongodb.net/?appName=recifeed-cluster-0";

// ***********************************************************
// (B) specify the name of the database
// ***********************************************************
const dbName = 'recifeed_db'; 

// Instantiate MongoClient with connection string
const client = new MongoClient(uri);

// ***********************************************************
// Main function 
// ***********************************************************
async function main() {
  try {
    // Try connecting to the MongoDB server
    await client.connect();
    console.log('You are now connected to MongoDB');

    // Access the database dbName
    const database = client.db(dbName);

    // A
    const userCollection = database.collection('users');

    console.log('Data import completed.');
  } catch (error) {
    console.error('There has been an error:', error);
  } finally {
    try {
      // Try closing the connection 
      await client.close();
      console.log('MongoDB connection is now closed.');
    } catch (error) {
      console.error('There has been an error closing MongoDB connection:', error);
    }
  }
}

// ***********************************************************
// Call the main function
// ***********************************************************
main();


// ***********************************************************
// INDEX TOOL ENDS
// ***********************************************************
