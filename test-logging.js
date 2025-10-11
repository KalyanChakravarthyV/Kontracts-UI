// Test script to verify Winston logging functionality
const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

// Simulate the same logging configuration as our API
const logsDir = './logs';

const logFormat = winston.format.combine(
  winston.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss'
  }),
  winston.format.errors({ stack: true }),
  winston.format.json(),
  winston.format.prettyPrint()
);

const apiFileTransport = new DailyRotateFile({
  filename: `${logsDir}/api-%DATE%.log`,
  datePattern: 'YYYY-MM-DD',
  zippedArchive: true,
  maxSize: '20m',
  maxFiles: '30d',
  format: logFormat,
  level: 'info'
});

const logger = winston.createLogger({
  level: 'debug',
  format: logFormat,
  defaultMeta: { service: 'test-kontracts-api' },
  transports: [
    apiFileTransport,
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ],
});

// Test logging functionality
logger.info('Testing Winston logger configuration');
logger.info('API Request Test', {
  method: 'GET',
  url: '/api/test',
  statusCode: 200,
  responseTime: '45ms',
  userAgent: 'TestClient/1.0',
  ip: '127.0.0.1',
  timestamp: new Date().toISOString()
});

logger.warn('API Request Warning Test', {
  method: 'POST',
  url: '/api/auth/signin',
  statusCode: 401,
  responseTime: '120ms',
  userAgent: 'TestClient/1.0',
  ip: '127.0.0.1',
  timestamp: new Date().toISOString()
});

logger.error('API Request Error Test', {
  method: 'POST',
  url: '/api/auth/signup',
  statusCode: 500,
  responseTime: '200ms',
  userAgent: 'TestClient/1.0',
  ip: '127.0.0.1',
  error: 'Database connection timeout',
  timestamp: new Date().toISOString()
});

console.log('Logging test completed. Check the logs directory for log files.');

// Close logger to ensure all data is written
setTimeout(() => {
  logger.end();
  process.exit(0);
}, 1000);