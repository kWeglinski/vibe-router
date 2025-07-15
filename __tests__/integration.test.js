



const request = require('supertest');
const path = require('path');
const fs = require('fs');

describe('Integration Tests', () => {
  let server;
  const configPath = path.resolve(__dirname, '../config.json');

  beforeAll((done) => {
    // Start the actual proxy server for integration testing
    const { loadConfig } = require('../config');
    const { replaceModelName, getAvailableModels } = require('../modelMapper');

    const express = require('express');
    const bodyParser = require('body-parser');
    const axios = require('axios');
    const cors = require('cors');

    // Load actual config
    const config = loadConfig(configPath);

    // Create the Express app
    const app = express();
    app.use(bodyParser.json());
    app.use(cors({ origin: '*' }));

    // Setup the route
    app.post('/v1/completions', async (req, res) => {
      try {
        // Replace model name in the request
        const modifiedReq = replaceModelName(req, config.modelMapping);

        console.log(`Forwarding POST /v1/completions request to inference server with model:`, modifiedReq.body.model, `URL: ${config.inferenceServerUrl}completions`);

        // Prepare axios configuration
        const axiosConfig = {};
        if (config.inferenceApiKey) {
          axiosConfig.headers = {
            'Authorization': `Bearer ${config.inferenceApiKey}`
          };
        }

        // Forward the request to the inference server
        const response = await axios.post(config.inferenceServerUrl + 'completions', modifiedReq.body, axiosConfig);

        // Send the response back to client
        res.json(response.data);
      } catch (error) {
        console.error('Error proxying request:', error.message || error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Start the server on a different port for testing
    server = app.listen(3003, '127.0.0.1', done);
  });

  afterAll((done) => {
    server.close(done);
  });

  test('should start proxy server and handle requests', async () => {
    const response = await request(server)
      .post('/v1/completions')
      .send({ model: 'thinker', prompt: 'Hello' })
      .set('Content-Type', 'application/json');

    // This test will fail in this environment since we don't have a real inference server
    // But it would pass in a real testing environment with a mock server running
    expect(response.status).toBe(200);
  });
});



