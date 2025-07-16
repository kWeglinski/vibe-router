


const { replaceModelName } = require('../models/modelMapper');
const { forwardRequestToInferenceServer } = require('../services/proxyService');

/**
 * Handle completions request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} config - Configuration object
 */
const handleCompletionsRequest = async (req, res, config) => {
  try {
    // Replace model name in the request
    const modifiedReq = replaceModelName(req, config.modelMapping);

    console.log(`Forwarding POST /v1/completions request to inference server with model:`, modifiedReq.body.model);

    // Forward the request and send response
    const responseData = await forwardRequestToInferenceServer(modifiedReq, config);
    res.json(responseData);
  } catch (error) {
    console.error('Error proxying request:', error.message || error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { handleCompletionsRequest };

