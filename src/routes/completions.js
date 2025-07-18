


const LoggingService = require('../services/loggingService');
const { replaceModelName } = require('../models/modelMapper');
const { forwardRequestToInferenceServer } = require('../services/proxyService');

/**
 * Handle completions request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} config - Configuration object
 */
const handleCompletionsRequest = async (req, res, config) => {
  // Initialize logging service
  const loggingService = new LoggingService(config);

  let modifiedReq;
  try {
    // Replace model name in the request
    modifiedReq = replaceModelName(req, config.modelMapping);

    console.log(`Forwarding POST /v1/completions request to inference server with model:`, modifiedReq.body.model);

    // Record start time for processing
    const startTime = Date.now();
    modifiedReq.startTime = startTime;

    // Forward the request and send response
    const responseData = await forwardRequestToInferenceServer(modifiedReq, config);

    // Calculate processing time
    const processingTimeMs = Date.now() - startTime;

    // Log the request asynchronously
    loggingService.logRequest(modifiedReq, responseData, processingTimeMs);

    res.json(responseData);
  } catch (error) {
    console.error('Error proxying request:', error.message || error);

    // Log failed requests with error status only if logging is not disabled for this request
    if (loggingService.enabled && modifiedReq.body.log_request !== false) {
      const failedLogEntry = loggingService.generateLogEntry(modifiedReq, { error: error.message || 'Unknown error' }, Date.now() - (modifiedReq.startTime || Date.now()));
      failedLogEntry.metadata.status = 'error';
      loggingService.storeLogEntry(failedLogEntry);
    }

    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { handleCompletionsRequest };


