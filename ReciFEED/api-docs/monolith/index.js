const express = require('express');
const swaggerUi = require('swagger-ui-express');
const SwaggerParser = require('@apidevtools/swagger-parser');
const swaggerDoc = require('./swagger.json');

// Initialize Express application
const app = express();

// To professor, could not work out how to import external files as references in swagger:
// apologies, this is our attempt
if (swaggerDoc.info && swaggerDoc.info.servers) {
  swaggerDoc.servers = swaggerDoc.info.servers;
  delete swaggerDoc.info.servers;
} else if (!swaggerDoc.servers) {
  swaggerDoc.servers = [
    { url: 'http://recifeed.example.com', description: 'Recifeed API URL from Ingress' }
  ];
}

// Dereference $refs so paths/users.json etc. are resolved
SwaggerParser.dereference(swaggerDoc)
  .then(api => {
    app.use('/', swaggerUi.serve, swaggerUi.setup(api));

    const PORT = 2020;
    app.listen(PORT, () => console.log(`Swagger docs running on port ${PORT}`));
  })
  .catch(err => console.error('Error loading Swagger:', err));
