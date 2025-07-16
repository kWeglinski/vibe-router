



const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const { loadConfig } = require('./config/config');
const { getAvailableModels } = require('./models/modelMapper');
const { handleCompletionsRequest } = require('./routes/completions');
const { handleModelsRequest } = require('./routes/models');
const { initializeLogging, generateRequestId, logger, httpLogger } = require('./services/loggingService');
const { initializeMetrics, requestMetricsMiddleware } = require('./services/metricsService');

// Load configuration
let config;
try {
  const configPath = path.resolve(__dirname, '../config.json');
  config = loadConfig(configPath);
} catch (err) {
  console.error('Error loading configuration:', err.message);
  process.exit(1);
}

// Initialize logging
initializeLogging(config);

// Log available models
logger().info('Available models:', getAvailableModels(config));

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

// Add request ID middleware
app.use(generateRequestId());

// Add HTTP request logging
app.use(httpLogger());

// Initialize metrics after app is created
initializeMetrics(app, config);

// Add metrics middleware
app.use(requestMetricsMiddleware);

// Setup routes
app.get('/v1/models', (req, res) => handleModelsRequest(req, res, config));
app.post('/v1/completions', (req, res) => handleCompletionsRequest(req, res, config));

// Start the proxy server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  logger().info(`Model proxy server running on port ${PORT}`);
});

module.exports = app; // Export for testing purposes



