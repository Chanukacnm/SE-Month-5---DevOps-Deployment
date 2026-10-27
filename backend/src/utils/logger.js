const path = require('node:path');
const winston = require('winston');
const config = require('../config');

/**
 * Structured JSON logs to stdout. In containers the runtime (Docker, Render,
 * Container Apps) captures stdout and ships it to the log aggregator, so
 * files are optional and off by default.
 */
const transports = [new winston.transports.Console()];

if (config.logDir) {
  transports.push(
    new winston.transports.File({ filename: path.join(config.logDir, 'error.log'), level: 'error' }),
    new winston.transports.File({ filename: path.join(config.logDir, 'combined.log') }),
  );
}

const logger = winston.createLogger({
  level: config.logLevel,
  defaultMeta: { service: 'adminflow-api', env: config.env, version: config.version },
  format: winston.format.combine(winston.format.timestamp(), winston.format.errors({ stack: true }), winston.format.json()),
  transports,
});

module.exports = logger;
