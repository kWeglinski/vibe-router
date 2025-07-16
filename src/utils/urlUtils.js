

/**
 * Construct full URL for inference server
 * @param {string} baseUrl - Base URL of inference server
 * @param {string} endpoint - API endpoint (e.g., 'completions')
 * @returns {string} Full URL
 */
const constructInferenceUrl = (baseUrl, endpoint) => {
  return `${baseUrl}${endpoint}`;
};

module.exports = { constructInferenceUrl };

