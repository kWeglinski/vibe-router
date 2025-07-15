

/**
 * Replace model name in request body
 * @param {Object} req - Express request object
 * @param {Object} modelMapping - Mapping of friendly names to actual model names
 * @returns {Object} Modified request object with replaced model name
 */
function replaceModelName(req, modelMapping) {
  // Create a deep copy of the request body to avoid mutation
  const modifiedBody = JSON.parse(JSON.stringify(req.body));

  if (modifiedBody.model && modelMapping[modifiedBody.model]) {
    modifiedBody.model = modelMapping[modifiedBody.model];
  }

  // Create a new request object with the modified body
  const modifiedReq = Object.assign({}, req, { body: modifiedBody });

  return modifiedReq;
}

/**
 * Get available model names from mapping
 * @param {Object} modelMapping - Mapping of friendly names to actual model names
 * @returns {string[]} Array of available model names (friendly names)
 */
function getAvailableModels(modelMapping) {
  return Object.keys(modelMapping);
}

module.exports = { replaceModelName, getAvailableModels };

