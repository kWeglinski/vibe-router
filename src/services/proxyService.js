

const axios = require('axios');
const { constructInferenceUrl } = require('../utils/urlUtils');

/**
 * Forward request to inference server
 * @param {Object} req - Express request object with modified body
 * @param {Object} config - Configuration object containing inference server details
 * @returns {Promise<Object>} Response from inference server
 */
const forwardRequestToInferenceServer = async (req, config) => {
  try {
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

    return response.data;
  } catch (error) {
    console.error('Error proxying request:', error.message || error);
    throw new Error('Internal server error');
  }
};

module.exports = { forwardRequestToInferenceServer };


