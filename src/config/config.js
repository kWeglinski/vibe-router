
const fs = require('fs');
const path = require('path');

/**
 * Ensure URL ends with a slash
 * @param {string} url - The base URL
 * @returns {string} URL with trailing slash
 */
const ensureTrailingSlash = (url) => url.endsWith('/') ? url : `${url}/`;

/**
 * Get environment variable or return default value
 * @param {string} name - Environment variable name
 * @param {*} defaultValue - Default value if not set
 * @returns {*} Value from environment or default
 */
const getEnv = (name, defaultValue) => {
  if (process.env[name] !== undefined) {
    // Handle boolean values
    if (process.env[name].toLowerCase() === 'true') return true;
    if (process.env[name].toLowerCase() === 'false') return false;

    // Handle numeric values
    if (!isNaN(Number(process.env[name]))) return Number(process.env[name]);

    // Return string value
    return process.env[name];
  }
  return defaultValue;
};

/**
 * Load configuration from JSON file
 * @param {string} configPath - Path to config.json
 * @returns {{modelMapping: Object, inferenceServerUrl: string, baseUrl: string, apiKey: string}}
 * @throws {Error} If config file cannot be read
 */
const loadConfig = (configPath) => {
  try {
    const rawData = fs.readFileSync(configPath, 'utf8');
    let config = JSON.parse(rawData);

    // Convert new structure to old structure for backward compatibility
    if (config.apis && config.models) {
      // Create model mapping from new structure
      const modelMapping = {};
      for (const [modelName, modelConfig] of Object.entries(config.models)) {
        if (config.apis[modelConfig.api]) {
          modelMapping[modelName] = modelConfig.name;
        }
      }

      // Use the first API's baseUrl and apiKey as default
      const apis = Object.values(config.apis);
      if (apis.length > 0) {
        const defaultApi = apis[0];
        config.inferenceServerUrl = ensureTrailingSlash(defaultApi.baseUrl);
        config.apiKey = defaultApi.apiKey;
      }

      // Add modelMapping for backward compatibility
      config.modelMapping = modelMapping;
    } else {
      // Handle old structure (for backward compatibility)
      if (config.baseUrl) {
        const cleanBaseUrl = config.baseUrl.replace(/\/$/, '');
        config.inferenceServerUrl = ensureTrailingSlash(cleanBaseUrl);
      }

      if (config.apiKey) {
        config.inferenceApiKey = config.apiKey;
      }

      if (!config.modelMapping && config.models) {
        // Convert models to modelMapping
        config.modelMapping = {};
        for (const [modelName, modelConfig] of Object.entries(config.models)) {
          config.modelMapping[modelName] = modelConfig.name;
        }
      }
    }

    // Handle environment variable overrides
    if (process.env.INFERENCE_BASE_URL) {
      const cleanBaseUrl = process.env.INFERENCE_BASE_URL.replace(/\/$/, '');
      config.inferenceServerUrl = ensureTrailingSlash(cleanBaseUrl);
    }

    if (process.env.INFERENCE_API_KEY) {
      config.inferenceApiKey = process.env.INFERENCE_API_KEY;
    }

    // Handle logging configuration
    config.logging = {
      enabled: getEnv('ENABLE_LOGGING', false),
      storage: getEnv('LOGGING_STORAGE', 'filesystem'),
      path: getEnv('LOGGING_PATH', './logs'),
      embedding_model: getEnv('EMBEDDING_MODEL', 'text-embedding-ada-002'),
      retention_days: getEnv('LOGGING_RETENTION_DAYS', 30),
      batch_size: getEnv('LOGGING_BATCH_SIZE', 100)
    };

    // Override with config.json values if present
    if (config.loggingConfig) {
      Object.assign(config.logging, config.loggingConfig);
    }

    return config;
  } catch (err) {
    throw new Error(`Error reading config file: ${err.message}`);
  }
};

module.exports = { loadConfig, ensureTrailingSlash };
