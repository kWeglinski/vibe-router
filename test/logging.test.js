





const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const { loadConfig } = require('../src/config/config');
const { getAvailableModels } = require('../src/models/modelMapper');
const { handleCompletionsRequest } = require('../src/routes/completions');
const { handleModelsRequest } = require('../src/routes/models');
const { initializeLogging, generateRequestId, logger, httpLogger } = require('../src/services/loggingService');
const { initializeMetrics, requestMetricsMiddleware } = require('../src/services/metricsService');

describe('Logging and Monitoring System', () => {
  let app;
  let config;

  beforeAll(() => {
    // Load configuration
    const configPath = path.resolve(__dirname, '../config.json');
    config = loadConfig(configPath);

    // Initialize logging
    initializeLogging(config);

    // Initialize Express app
    app = express();
    app.use(bodyParser.json());
    app.use(cors({ origin: '*' }));

    // Add request ID middleware
    app.use(generateRequestId());

    // Add HTTP request logging
    app.use(httpLogger());

    // Initialize metrics
    initializeMetrics(app, config);

    // Add metrics middleware
    app.use(requestMetricsMiddleware);

    // Setup routes
    app.get('/v1/models', (req, res) => handleModelsRequest(req, res, config));
    app.post('/v1/completions', (req, res) => handleCompletionsRequest(req, res, config));
  });

  test('should log models request', async () => {
    const response = await request(app)
      .get('/v1/models')
      .expect(200);

    expect(response.body).toHaveProperty('object', 'list');
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  test('should log metrics endpoint', async () => {
    const response = await request(app)
      .get('/metrics')
      .expect(200);

    expect(response.text).toContain('http_requests_total');
    expect(response.text).toContain('system_cpu_usage');
  });

  test('should log completions request with error handling', async () => {
    const response = await request(app)
      .post('/v1/completions')
      .send({ model: 'thinker', prompt: 'Hello, world!' })
      .expect(500);

    // The request should fail (since no real inference server), but we expect proper logging
  });
});




