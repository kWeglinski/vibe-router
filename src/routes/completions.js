


const { replaceModelName } = require('../models/modelMapper');
const { forwardRequestToInferenceServer } = require('../services/proxyService');
const { logger } = require('../services/loggingService');

/**
 * Handle completions request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} config - Configuration object
 */
const handleCompletionsRequest = async (req, res, config) => {
  const requestId = req.requestId || 'unknown';
  const modelName = req.body?.model || 'unknown';

  try {
    // Replace model name in the request
    const modifiedReq = replaceModelName(req, config.modelMapping);

    logger().info(`Handling ${req.method} /v1/completions request for model: ${modelName}`, {
      requestId,
      clientIp: req.ip,
      path: req.path
    });

    // Forward the request and send response
    const responseData = await forwardRequestToInferenceServer(modifiedReq, config);
    res.json(responseData);

    logger().info(`Successfully processed request for model ${modelName}`, { requestId });

  } catch (error) {
    logger().error(`Error processing request for model ${modelName}`, {
      requestId,
      error: error.message || 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });

    if (res.headersSent) {
      logger().warning(`Headers already sent for request ${requestId}`, { requestId });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

module.exports = { handleCompletionsRequest };


