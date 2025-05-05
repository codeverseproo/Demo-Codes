// service-b/src/utils/logger.ts

// Snippet 1: Import Pino
import pino from 'pino';

// Snippet 2: Configure and Export Logger
// This creates a logger instance that prefixes messages with 'service-b'
// and formats output nicely in the terminal.
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname', // Hide OS-specific info
    },
  },
  base: {
    service: 'service-b', // Add a base field to all logs from this service
  },
  level: process.env.LOG_LEVEL || 'info', // Default log level is 'info'
});

export default logger;
