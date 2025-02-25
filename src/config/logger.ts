import fs from 'fs';
import path from 'path';
import morgan from 'morgan';
import winston from 'winston';
import { isNodeEnv } from '../utils/env';
import { createConfig } from './config';
import { fileURLToPath } from 'url';

const config = createConfig();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Directory path for storing log files.
 * @constant {string}
 */
const logDirectory = path.join(__dirname, config.logs.path);

/**
 * Creates the logs directory if it does not already exist.
 */
if (!fs.existsSync(logDirectory)) fs.mkdirSync(logDirectory);

/**
 * Write stream for Morgan to log HTTP requests to a file.
 * @constant {fs.WriteStream}
 */
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });

/**
 * Middleware for logging HTTP requests using Morgan.
 * The 'combined' format provides a comprehensive log output including remote address, user agent, and response status.
 * @type {morgan.Morgan}
 */
export const morganMiddleware = morgan('combined', { stream: accessLogStream });

/**
 * Winston logger configuration for detailed application logging.
 * Logs are output to files and optionally to the console, based on the environment.
 * @constant {winston.Logger}
 */
export const logger = winston.createLogger({
  level: config.logs.level,
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    // Log all levels to 'application.log'
    new winston.transports.File({
      filename: path.join(logDirectory, 'application.log'),
    }),

    // Log only error levels to 'error.log'
    new winston.transports.File({
      filename: path.join(logDirectory, 'error.log'),
      level: 'error',
    }),
  ],
});

// Log to the console with a simple text format if in development mode
if (isNodeEnv('production')) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.simple(),
    })
  );
}
