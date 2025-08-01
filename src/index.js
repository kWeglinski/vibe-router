

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const { loadConfig } = require('./config/config');
const { getAvailableModels } = require('./models/modelMapper');
const { handleCompletionsRequest } = require('./routes/completions');
const { handleModelsRequest } = require('./routes/models');
const { handleLoggingStatsRequest } = require('./routes/loggingStats');

// Load configuration
let config;


// Override config with environment variables
config.inferenceBaseUrl = process.env.INFERENCE_BASE_URL || config.inferenceBaseUrl;
config.apiKey = process.env.INFERENCE_API_KEY || config.apiKey;


try {
  const configPath = path.resolve(__dirname, '../config.json');
  config = loadConfig(configPath);


// Override config with environment variables
config.inferenceBaseUrl = process.env.INFERENCE_BASE_URL || config.inferenceBaseUrl;
config.apiKey = process.env.INFERENCE_API_KEY || config.apiKey;


} catch (err) {
  console.error('Error loading configuration:', err.message);
  process.exit(1);
}

// Log available models
console.log('Available models:', getAvailableModels(config));

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

// Setup routes
app.get('/v1/models', (req, res) => handleModelsRequest(req, res, config));
app.post('/v1/completions', (req, res) => handleCompletionsRequest(req, res, config));
app.get('/v1/logs/stats', (req, res) => handleLoggingStatsRequest(req, res, config));

// Start the proxy server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Model proxy server running on port ${PORT}`);
});

module.exports = app; // Export for testing purposes

