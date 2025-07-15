














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
const axios = require('axios');
const fs = require('fs');
const path = require('path');

let config;
try {
  const configPath = path.resolve(__dirname, 'config.json');
  config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

  // Get base URL from environment variable or config
  const baseUrl = process.env.INFERENCE_BASE_URL || config.baseUrl;
  if (baseUrl) {
    // Ensure base URL ends with a slash but doesn't have double slashes
    const cleanBaseUrl = baseUrl.replace(/\/$/, '');
    config.inferenceServerUrl = `${cleanBaseUrl}/`;
  }

  // Get API key from environment variable or config
  const apiKey = process.env.INFERENCE_API_KEY || config.apiKey;
  if (apiKey) {
    config.inferenceApiKey = apiKey;
  }
} catch (err) {
  console.error('Error reading config file:', err);
  process.exit(1);
}

const app = express();
app.use(bodyParser.json());

const cors = require('cors');
app.use(cors({ origin: '*' }));

// Helper function to replace model name
function replaceModelName(request) {
  if (!request.body || !request.body.model) {
    return request;
  }

  const modelMapping = config.modelMapping;
  if (modelMapping[request.body.model]) {
    request.body.model = modelMapping[request.body.model];
  }

  return request;
}

// Proxy endpoint for OpenAI-compatible API
app.post('/v1/completions', async (req, res) => {
  try {
    // Replace model name in the request
    const modifiedReq = replaceModelName(req);

    console.log(`Forwarding POST /v1/completions request to inference server with model:`, modifiedReq.body.model, `URL: ${constructInferenceUrl(config.inferenceServerUrl, 'completions')}`);

    // Forward the request to the inference server
    const axiosConfig = {};
    if (config.inferenceApiKey) {
      axiosConfig.headers = {
        'Authorization': `Bearer ${config.inferenceApiKey}`
      };
    }
    const response = await axios.post(constructInferenceUrl(config.inferenceServerUrl, 'completions'), modifiedReq.body, axiosConfig);

    // Send the response back to client
    res.json(response.data);
  } catch (error) {
    console.error('Error proxying request:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Model proxy server running on port ${PORT}`);
  console.log('Available models:', Object.keys(config.modelMapping));
});











