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

// ***********************************************************
// (C) specify the names of the collection
// ***********************************************************
const collectionNames = ['users', 'posts', 'recipes', 'searches']; 

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

    for (const collectionName in collectionNames) {
      // Access the collection
      const collection = database.collection(collectionName);

      // We will process data from a file to import it into MongoDB
      const collectionData = fs.readFileSync(`./example-data/${collection}.json`, 'utf8');
      const importDataJSON = JSON.parse(collectionData);

      // For each record in the collection, insert a new record 
      // in the MongoDB database collection
      for (const row of importDataJSON) {
          try {
              const result = await collection.insertOne(row);
              console.log('Inserted document with ID:', result.insertedId);
          }
          catch (error) {
              console.error('Error inserting document:', error);
          }
      }

      console.log('Data import for' + collectionName + 'is now completed.');
    }
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
// IMPORT TOOL ENDS
// ***********************************************************
