
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

/**
 * Logging Service for capturing request/response data
 */
class LoggingService {
  constructor(config) {
    this.config = config;
    this.enabled = config.logging?.enabled || false;

    // Initialize storage based on configuration
    if (this.enabled) {
      this.initStorage();
    }
  }

  /**
   * Initialize storage based on configuration
   */
  initStorage() {
    const storageConfig = this.config.logging;
    if (storageConfig.storage === 'filesystem') {
      // Ensure log directory exists
      const logDir = storageConfig.path || './logs';
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    }
  }

  /**
   * Log a request and response
   * @param {Object} req - Express request object
   * @param {Object} resData - Response data from inference server
   * @param {number} processingTimeMs - Processing time in milliseconds
   * @param {Object} config - Configuration object
   */
  async logRequest(req, resData, processingTimeMs) {
    if (!this.enabled || req.body.log_request === false) {
      return;
    }

    try {
      // Generate log entry
      const logEntry = this.generateLogEntry(req, resData, processingTimeMs);

      // Store the log entry asynchronously
      await this.storeLogEntry(logEntry);
    } catch (error) {
      console.error('Error logging request:', error.message || error);
    }
  }

  /**
   * Generate log entry object
   */
  generateLogEntry(req, resData, processingTimeMs) {
    return {
      timestamp: new Date().toISOString(),
      request_id: uuidv4(),
      model: req.body.model,
      prompt: req.body.prompt || '',
      parameters: req.body,
      response: resData.choices ? resData.choices[0].text : '',
      metadata: {
        processing_time_ms: processingTimeMs,
        tokens_used: resData.usage?.total_tokens || 0,
        status: 'success'
      }
    };
  }

  /**
   * Store log entry based on configured storage
   */
  async storeLogEntry(logEntry) {
    const storageConfig = this.config.logging;

    if (storageConfig.storage === 'filesystem') {
      await this.storeToFileSystem(logEntry, storageConfig.path);
    }
    // Add other storage backends (MongoDB, PostgreSQL) here
  }

  /**
   * Store log entry to filesystem
   */
  async storeToFileSystem(logEntry, logPath) {
    const fileName = path.join(logPath || './logs', `${logEntry.timestamp.replace(/[:.]/g, '-')}.json`);

    // Write log entry to file asynchronously
    await fs.promises.writeFile(fileName, JSON.stringify(logEntry, null, 2), 'utf8');
  }

  /**
   * Get logging statistics
   */
  async getStats() {
    if (!this.enabled) {
      return { enabled: false, storage: 'none', logCount: 0 };
    }

    const storageConfig = this.config.logging;

    if (storageConfig.storage === 'filesystem') {
      const logDir = storageConfig.path || './logs';
      try {
        const files = await fs.promises.readdir(logDir);
        return {
          enabled: true,
          storage: 'filesystem',
          logCount: files.length,
          path: logDir
        };
      } catch (error) {
        return {
          enabled: true,
          storage: 'filesystem',
          logCount: 0,
          error: 'Could not read log directory'
        };
      }
    }

    // Add other storage backends here
    return {
      enabled: true,
      storage: storageConfig.storage || 'unknown',
      logCount: 0
    };
  }
}

module.exports = LoggingService;
