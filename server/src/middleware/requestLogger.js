const logger = require('../utils/logger');

// Lightweight structured request log. Helps trace issues in Render's
// log stream without needing a separate APM tool early on.
const requestLogger = (req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.info(`${req.method} ${req.originalUrl} ${res.statusCode} - ${duration}ms`);
  });
  next();
};

module.exports = requestLogger;
