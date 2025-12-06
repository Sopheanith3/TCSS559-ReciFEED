// Import libraries
const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerDoc = require('./swagger.json');

// Force the server URL programmatically
swaggerDoc.servers = [{ url: 'http://recifeed.example.app', description: 'Recifeed API URL from Ingress' }]

// Initialize Express application
const app = express();

app.use('/', swaggerUi.serve, swaggerUi.setup(swaggerDoc))

// Start server on specified port
const PORT = 2020
app.listen(PORT, () => console.log(`Swagger docs running on port ${PORT}`));
