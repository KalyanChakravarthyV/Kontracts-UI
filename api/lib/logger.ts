import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

// Create logs directory structure
const logsDir = process.env.NODE_ENV === 'production' ? '/tmp' : './logs';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

// Console format for development
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({
    format: 'HH:mm:ss'
  }),
  winston.format.printf(({ level, message, timestamp, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
      msg += ` ${JSON.stringify(meta)}`;
    }
    return msg;
  })
);

// Daily rotate file transport for API logs
const apiFileTransport = new DailyRotateFile({
  filename: `${logsDir}/api-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d', // Keep logs for 30 days
  format: logFormat,
  level: 'info'
});

// Daily rotate file transport for error logs
const errorFileTransport = new DailyRotateFile({
  filename: `${logsDir}/error-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
  level: 'error'
});

// Daily rotate file transport for auth logs
const authFileTransport = new DailyRotateFile({
  filename: `${logsDir}/auth-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
  level: 'info'
});

// Create main logger
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'kontracts-api' },
  transports: [
    apiFileTransport,
    errorFileTransport
  ],
});

// Create specialized loggers
export const authLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: logFormat,
  defaultMeta: { service: 'kontracts-auth' },
  transports: [
    authFileTransport,
    errorFileTransport,
    new winston.transports.Console()
  ],
});

// Add console transport for development
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));

  authLogger.add(new winston.transports.Console({
    format: consoleFormat,
    level: 'debug'
  }));
}

// API request logging helper
export interface ApiLogData {
  method: string;
  url: string;
  statusCode?: number;
  responseTime?: number;
  userAgent?: string;
  ip?: string;
  userId?: string;
  error?: any;
  requestBody?: any;
  responseBody?: any;
}

export const logApiRequest = (data: ApiLogData) => {
  const {
    method,
    url,
    statusCode,
    responseTime,
    userAgent,
    ip,
    userId,
    error,
    requestBody,
    responseBody
  } = data;

  const logEntry = {
    method,
    url,
    statusCode,
    responseTime: responseTime ? `${responseTime}ms` : undefined,
    userAgent,
    ip,
    userId,
    requestBody: requestBody ? JSON.stringify(requestBody) : undefined,
    responseBody: responseBody ? JSON.stringify(responseBody) : undefined,
    timestamp: new Date().toISOString()
  };

  if (error) {
    logger.error('API Request Error', {
      ...logEntry,
      error: error.message || error,
      stack: error.stack
    });
  } else if (statusCode && statusCode >= 400) {
    logger.warn('API Request Warning', logEntry);
  } else {
    logger.info('API Request', logEntry);
  }
};

// Auth-specific logging helper
export interface AuthLogData {
  action: string;
  userId?: string;
  email?: string;
  provider?: string;
  ip?: string;
  userAgent?: string;
  success: boolean;
  error?: any;
  metadata?: Record<string, any>;
}

export const logAuthEvent = (data: AuthLogData) => {
  const {
    action,
    userId,
    email,
    provider,
    ip,
    userAgent,
    success,
    error,
    metadata
  } = data;

  const logEntry = {
    action,
    userId,
    email,
    provider,
    ip,
    userAgent,
    success,
    metadata,
    timestamp: new Date().toISOString()
  };

  if (error) {
    authLogger.error(`Auth ${action} Failed`, {
      ...logEntry,
      error: error.message || error,
      stack: error.stack
    });
  } else if (success) {
    authLogger.info(`Auth ${action} Success`, logEntry);
  } else {
    authLogger.warn(`Auth ${action} Warning`, logEntry);
  }
};

// Cleanup function for graceful shutdown
export const closeLoggers = async () => {
  return new Promise<void>((resolve) => {
    let closedCount = 0;
    const totalLoggers = 2;

    const onClose = () => {
      closedCount++;
      if (closedCount === totalLoggers) {
        resolve();
      }
    };

    logger.end(onClose);
    authLogger.end(onClose);
  });
};

export default logger;