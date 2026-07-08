const winston = require('winston');

// Centralized logger: console in all envs (Render captures stdout),
// plus rotated file logs when running/debugging locally.
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.File({ filename: 'src/logs/error.log', level: 'error' }));
  logger.add(new winston.transports.File({ filename: 'src/logs/combined.log' }));
}

module.exports = logger;
