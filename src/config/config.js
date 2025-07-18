
const fs = require('fs');
const path = require('path');

/**
 * Ensure URL ends with a slash
 * @param {string} url - The base URL
 * @returns {string} URL with trailing slash
 */
const ensureTrailingSlash = (url) => url.endsWith('/') ? url : `${url}/`;

/**
 * Merge default logging configuration with user-provided config
 * @param {Object} config - User configuration
 * @returns {Object} Merged configuration with default logging settings
 */
const mergeLoggingConfig = (config) => {
  const defaultLoggingConfig = {
    level: 'info',
    storage: 'file',
    maxSize: '10MB',
    maxFiles: 5,
    redactHeaders: ['authorization', 'api-key'],
    metricsEndpoint: '/metrics'
  };

  // Merge with user-provided logging config if exists
  if (config.logging) {
    return { ...defaultLoggingConfig, ...config.logging };
  }

  return defaultLoggingConfig;
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

    // Add default logging configuration
    config.logging = mergeLoggingConfig(config);

    return config;
  } catch (err) {
    throw new Error(`Error reading config file: ${err.message}`);
  }
};

module.exports = { loadConfig, ensureTrailingSlash };
