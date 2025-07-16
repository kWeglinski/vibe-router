


/**
 * Handle models listing request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} config - Configuration object
 */
const handleModelsRequest = (req, res, config) => {
  try {
    const modelMapping = config.modelMapping || {};
    const modelsConfig = config.models || {};

    // Format the response according to OpenAI API spec
    const models = Object.keys(modelMapping).map(systemName => {
      // Get the actual model name and API info
      const actualModel = modelMapping[systemName];
      const apiInfo = modelsConfig[systemName]?.api || null;

      return {
        id: systemName,
        object: "model",
        owned_by: "organization-name", // Default value as per OpenAI spec
        additional: {
          actual_model: actualModel,
          api_name: apiInfo
        }
      };
    });

    res.json({
      object: "list",
      data: models
    });
  } catch (error) {
    console.error('Error listing models:', error.message);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { handleModelsRequest };


