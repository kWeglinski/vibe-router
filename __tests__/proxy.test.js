



const request = require('supertest');
const express = require('express');

const axios = require('axios');
const cors = require('cors');

jest.mock('../src/config/config');
jest.mock('../src/models/modelMapper');
const { loadConfig, ensureTrailingSlash } = require('../src/config/config');
const { replaceModelName, getAvailableModels } = require('../src/models/modelMapper');

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

    // Mock the model mapper
    replaceModelName.mockImplementation((req, mapping) => {
      const modifiedBody = JSON.parse(JSON.stringify(req.body));
      if (modifiedBody.model && mapping[modifiedBody.model]) {
        modifiedBody.model = mapping[modifiedBody.model];
      }
      return Object.assign({}, req, { body: modifiedBody });
    });

    // Create the Express app
    app = express();
    app.use(express.json());
    app.use(cors({ origin: '*' }));

    // Setup the route using our new handler
    const { handleCompletionsRequest } = require('../src/routes/completions');
    app.post('/v1/completions', (req, res) => handleCompletionsRequest(req, res, {
      modelMapping: { thinker: 'actual-model' },
      inferenceServerUrl: 'http://mock-server:5004',
      inferenceApiKey: 'test-api-key'
    }));

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


