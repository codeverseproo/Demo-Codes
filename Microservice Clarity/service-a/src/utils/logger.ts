// service-a/src/utils/logger.ts

// Snippet 1: Import Pino
import pino from 'pino';

// Snippet 2: Configure and Export Logger
// Similar to Service B's logger, but with a different base field.
const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'SYS:standard',
      ignore: 'pid,hostname',
    },
  },
   base: {
    service: 'service-a', // Identify this service in logs
  },
  level: process.env.LOG_LEVEL || 'info',
});

export default logger;
