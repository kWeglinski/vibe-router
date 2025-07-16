


/**
 * Replace model name in request body
 * @param {Object} req - Express request object
 * @param {Object} modelMappingOrConfig - Mapping of friendly names to actual model names or full config object
 * @returns {Object} Modified request object with replaced model name
 */
function replaceModelName(req, modelMappingOrConfig) {
  // Create a deep copy of the request body to avoid mutation
  const modifiedBody = JSON.parse(JSON.stringify(req.body));

  // Determine the model mapping to use
  let modelMapping;
  if (modelMappingOrConfig.modelMapping) {
    // New config structure - use modelMapping property
    modelMapping = modelMappingOrConfig.modelMapping;
  } else if (typeof modelMappingOrConfig === 'object' && !Array.isArray(modelMappingOrConfig)) {
    // Old structure or model mapping object
    modelMapping = modelMappingOrConfig;
  } else {
    modelMapping = {};
  }

  if (modifiedBody.model && modelMapping[modifiedBody.model]) {
    modifiedBody.model = modelMapping[modifiedBody.model];
  }

  // Create a new request object with the modified body
  const modifiedReq = Object.assign({}, req, { body: modifiedBody });

  return modifiedReq;
}

/**
 * Get available model names from mapping
 * @param {Object} config - Configuration object (can be new or old structure)
 * @returns {string[]} Array of available model names
 */
function getAvailableModels(config) {
  if (config.modelMapping) {
    return Object.keys(config.modelMapping);
  } else if (config.models) {
    return Object.keys(config.models);
  }
  return [];
}

module.exports = { replaceModelName, getAvailableModels };

