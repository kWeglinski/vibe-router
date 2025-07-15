
const fs = require('fs');
const path = require('path');

/**
 * Load configuration from JSON file
 * @param {string} configPath - Path to config.json
 * @returns {{modelMapping: Object, inferenceServerUrl: string, baseUrl: string, apiKey: string}}
 * @throws {Error} If config file cannot be read
 */
function loadConfig(configPath) {
  try {
    const rawData = fs.readFileSync(configPath, 'utf8');
    let config = JSON.parse(rawData);

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

    return config;
  } catch (err) {
    throw new Error(`Error reading config file: ${err.message}`);
  }
}

module.exports = { loadConfig };
