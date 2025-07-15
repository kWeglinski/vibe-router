

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const { loadConfig } = require('./config');
const { replaceModelName, getAvailableModels } = require('./modelMapper');

/**
 * Construct full URL for inference server
 * @param {string} baseUrl - Base URL of inference server
 * @param {string} endpoint - API endpoint (e.g., 'completions')
 * @returns {string} Full URL
 */
function constructInferenceUrl(baseUrl, endpoint) {
  return `${baseUrl}${endpoint}`;
}

// Load configuration
let config;
try {
  const configPath = require('path').resolve(__dirname, 'config.json');
  config = loadConfig(configPath);
} catch (err) {
  console.error(err.message);
  process.exit(1);
}

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(cors({ origin: '*' }));

// Log available models
console.log('Available models:', getAvailableModels(config.modelMapping));

/**
 * Forward request to inference server
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
async function handleCompletionsRequest(req, res) {
  try {
    // Replace model name in the request
    const modifiedReq = replaceModelName(req, config.modelMapping);

    console.log(`Forwarding POST /v1/completions request to inference server with model:`, modifiedReq.body.model, `URL: ${constructInferenceUrl(config.inferenceServerUrl, 'completions')}`);

    // Prepare axios configuration
    const axiosConfig = {};
    if (config.inferenceApiKey) {
      axiosConfig.headers = {
        'Authorization': `Bearer ${config.inferenceApiKey}`
      };
    }

    // Forward the request to the inference server
    const response = await axios.post(constructInferenceUrl(config.inferenceServerUrl, 'completions'), modifiedReq.body, axiosConfig);

    // Send the response back to client
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error.message || error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

// Route handlers
app.post('/v1/completions', handleCompletionsRequest);

// Start the proxy server
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Model proxy server running on port ${PORT}`);
});

