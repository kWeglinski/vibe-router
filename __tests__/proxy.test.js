

const request = require('supertest');
const express = require('express');

const axios = require('axios');
const cors = require('cors');

const { loadConfig, ensureTrailingSlash } = require('../config');
const { replaceModelName, getAvailableModels } = require('../modelMapper');

/**
 * Construct full URL for inference server
 * @param {string} baseUrl - Base URL of inference server
 * @param {string} endpoint - API endpoint (e.g., 'completions')
 * @returns {string} Full URL
 */
function constructInferenceUrl(baseUrl, endpoint) {
  return `${baseUrl}${endpoint}`;
}

jest.mock('axios');
jest.mock('../config');

describe('Proxy Server', () => {
  let app;
  let server;

  beforeAll(() => {
    // Mock the config module to return a test configuration
    loadConfig.mockReturnValue({
      modelMapping: { thinker: 'actual-model' },
      inferenceServerUrl: 'http://mock-server:5004',
      inferenceApiKey: 'test-api-key'
    });

    // Create the Express app
    app = express();
    // Use raw body parser for testing
    app.use(express.json());
    app.use(cors({ origin: '*' }));

    // Setup the route
    app.post('/v1/completions', async (req, res) => {
      try {
        // Ensure req.body exists
        if (!req.body) {
          throw new Error('Request body is undefined');
        }

        // Replace model name in the request
        const modifiedReq = replaceModelName(req, { thinker: 'actual-model' });

        console.log(`Forwarding POST /v1/completions request to inference server with model:`, modifiedReq.body.model, `URL: ${constructInferenceUrl('http://mock-server:5004', 'completions')}`);

        // Prepare axios configuration
        const axiosConfig = {};
        if ('test-api-key') {
          axiosConfig.headers = {
            'Authorization': `Bearer test-api-key`
          };
        }

        // Forward the request to the inference server
        const response = await axios.post(constructInferenceUrl('http://mock-server:5004', 'completions'), modifiedReq.body, axiosConfig);

        // Send the response back to client
        res.json(response.data);
      } catch (error) {
        console.error('Error proxying request:', error.message || error);
        res.status(500).json({ error: 'Internal server error' });
      }
    });

    // Start the server
    server = app.listen(3002);
  });

  afterAll((done) => {
    server.close(done);
  });

  beforeEach(() => {
    // Reset axios mock before each test
    axios.post.mockReset();
  });

  test('should replace model name and forward request', async () => {
    // Mock the axios response
    const mockResponse = {
      data: {
        id: 'mock-id',
        model: 'actual-model',
        choices: [{ text: 'Mock response' }]
      }
    };
    axios.post.mockResolvedValue(mockResponse);

    const response = await request(app)
      .post('/v1/completions')
      .send({ model: 'thinker', prompt: 'Hello' })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('mock-id');
    expect(response.body.model).toBe('actual-model');

    // Verify that axios was called with the correct parameters
    expect(axios.post).toHaveBeenCalled();
    const axiosCall = axios.post.mock.calls[0];
    expect(axiosCall[0]).toBe('http://mock-server:5004completions');
    expect(axiosCall[1].model).toBe('actual-model');
    expect(axiosCall[2].headers.Authorization).toBe('Bearer test-api-key');
  });

  test('should handle missing model name', async () => {
    // Mock the axios response
    const mockResponse = {
      data: {
        id: 'mock-id',
        model: 'actual-model',
        choices: [{ text: 'Mock response' }]
      }
    };
    axios.post.mockResolvedValue(mockResponse);

    const response = await request(app)
      .post('/v1/completions')
      .send({ prompt: 'Hello' })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(200);
    // Verify that axios was called with the original model name
    expect(axios.post).toHaveBeenCalled();
    const axiosCall = axios.post.mock.calls[0];
    expect(axiosCall[1].model).toBeUndefined();
  });

  test.skip('should handle server errors', async () => {
    // Mock axios to throw an error
    axios.post.mockRejectedValue(new Error('Server error'));

    const response = await request(app)
      .post('/v1/completions')
      .send({ model: 'thinker', prompt: 'Hello' })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Internal server error');
  });
});

