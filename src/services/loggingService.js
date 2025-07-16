
const winston = require('winston');
const { v4: uuidv4 } = require('uuid');
const morgan = require('morgan');

// Create a request ID generator middleware
const generateRequestId = () => (req, res, next) => {
  req.requestId = uuidv4();
  res.setHeader('X-Request-ID', req.requestId);
  next();
};

// Create a logger instance
const createLogger = (config) => {
  const { level = 'info', storage = 'file', maxSize = '10MB', maxFiles = 5, redactHeaders = [] } = config.logging || {};

  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  );

  // Create transports based on storage configuration
  const transports = [];

  if (storage === 'file' || !storage) {
    // File transport with rotation
    transports.push(
      new winston.transports.File({
        filename: 'logs/app.log',
        maxsize: maxSize,
        maxFiles: maxFiles,
        format: logFormat
      })
    );
  }

  // Console transport for development
  transports.push(
    new winston.transports.Console({
      format: logFormat,
      level: 'debug' // Always show debug in console for development
    })
  );

  return winston.createLogger({
    level: level || 'info',
    format: logFormat,
    transports: transports
  });
};

// Create morgan logger for HTTP requests with request ID and custom formatting
const createHttpLogger = (config) => {
  const { redactHeaders = [] } = config.logging || {};

  // Custom token to redact sensitive headers
  morgan.token('redacted-headers', (req) => {
    const headersToRedact = {};
    redactHeaders.forEach(header => {
      if (req.headers[header]) {
        headersToRedact[header] = '[REDACTED]';
      }
    });
    return JSON.stringify(headersToRedact);
  });

  // Custom morgan format with request ID and redacted headers
  const httpFormat = `:method :url :status :response-time ms - :res[content-length] `
    + `- Request ID: :req[x-request-id] `
    + `- Headers: :redacted-headers`;

  return morgan(httpFormat, {
    stream: { write: (message) => logger.info(message.trim()) },
    immediate: true,
    skip: (req, res) => req.method === 'OPTIONS' // Skip OPTIONS requests
  });
};

// Initialize logger and HTTP logger
let logger;
let httpLogger;

const initializeLogging = (config) => {
  logger = createLogger(config);
  httpLogger = createHttpLogger(config);

  // Log server startup
  logger.info('Logging service initialized');
};

module.exports = {
  initializeLogging,
  generateRequestId,
  logger: () => logger,
  httpLogger: () => httpLogger
};
