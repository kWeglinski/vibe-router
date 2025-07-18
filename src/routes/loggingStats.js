

const LoggingService = require('../services/loggingService');

/**
 * Handle logging stats request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Object} config - Configuration object
 */
const handleLoggingStatsRequest = async (req, res, config) => {
  try {
    const loggingService = new LoggingService(config);
    const stats = await loggingService.getStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting logging stats:', error.message || error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { handleLoggingStatsRequest };

