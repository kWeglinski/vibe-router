


const axios = require('axios');
const { constructInferenceUrl } = require('../utils/urlUtils');
const { logger } = require('./loggingService');

/**
 * Forward request to inference server
 * @param {Object} req - Express request object with modified body
 * @param {Object} config - Configuration object containing inference server details
 * @returns {Promise<Object>} Response from inference server
 */
const forwardRequestToInferenceServer = async (req, config) => {
  const requestId = req.requestId || 'unknown';
  const modelName = req.body?.model || 'unknown';

  try {
    // Log request details
    logger().info(`Processing ${req.method} request for model: ${modelName}`, {
      requestId,
      clientIp: req.ip,
      path: req.path,
      headers: req.headers
    });

    // Log request body for debugging (redact sensitive data)
    if (req.body) {
      logger().debug(`Request body for model ${modelName}`, { requestId, body: req.body });
    }

    // Start timing
    const startTime = Date.now();

    // Prepare axios configuration
    const axiosConfig = {};
    if (config.inferenceApiKey) {
      axiosConfig.headers = {
        'Authorization': `Bearer ${config.inferenceApiKey}`
      };
    }

    // Forward the request to the inference server
    const response = await axios.post(
      constructInferenceUrl(config.inferenceServerUrl, 'completions'),
      req.body,
      axiosConfig
    );

    // Log response details
    const duration = Date.now() - startTime;
    logger().info(`Response from inference server for model ${modelName}`, {
      requestId,
      status: response.status,
      duration: `${duration}ms`,
      size: Buffer.byteLength(JSON.stringify(response.data), 'utf8')
    });

    return response.data;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger().error(`Error processing request for model ${modelName}`, {
      requestId,
      error: error.message || 'Unknown error',
      duration: `${duration}ms`
    });

    throw new Error('Internal server error');
  }
};

module.exports = { forwardRequestToInferenceServer };

