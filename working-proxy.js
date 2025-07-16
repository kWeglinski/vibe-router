














/**
 * Construct full URL for inference server
 * @param {string} baseUrl - Base URL of inference server
 * @param {string} endpoint - API endpoint (e.g., 'completions')
 * @returns {string} Full URL
 */
function constructInferenceUrl(baseUrl, endpoint) {
  return `${baseUrl}${endpoint}`;
}

const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const { loadConfig } = require('./src/config/config');
const { getAvailableModels } = require('./src/models/modelMapper');
const { handleCompletionsRequest } = require('./src/routes/completions');
const { handleModelsRequest } = require('./src/routes/models');

let config;
try {
  const configPath = path.resolve(__dirname, 'config.json');
  config = loadConfig(configPath);
} catch (err) {
  console.error('Error reading config file:', err.message);
  process.exit(1);
}

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({ origin: '*' }));

// Log available models
console.log('Available models:', getAvailableModels(config));

// Setup routes
app.get('/v1/models', (req, res) => handleModelsRequest(req, res, config));
app.post('/v1/completions', (req, res) => handleCompletionsRequest(req, res, config));

// Start the proxy server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Model proxy server running on port ${PORT}`);
});











