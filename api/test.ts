import type { VercelRequest, VercelResponse } from '@vercel/node';
import { logger, logApiRequest } from './lib/logger';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  logger.info('Test API Request Started', {
    method: req.method,
    url: req.url,
    ip: clientIp,
    userAgent,
    timestamp: new Date().toISOString()
  });

  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      const responseTime = Date.now() - startTime;
      logApiRequest({
        method: req.method!,
        url: req.url!,
        statusCode: 200,
        responseTime,
        userAgent,
        ip: clientIp as string
      });
      return res.status(200).end();
    }

    const responseData = {
      message: 'Vercel API function is working!',
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
    };

    const responseTime = Date.now() - startTime;
    logApiRequest({
      method: req.method!,
      url: req.url!,
      statusCode: 200,
      responseTime,
      userAgent,
      ip: clientIp as string,
      responseBody: responseData
    });

    return res.status(200).json(responseData);

  } catch (error) {
    const responseTime = Date.now() - startTime;

    logger.error('Test API critical error', {
      error: error.message,
      stack: error.stack,
      method: req.method,
      url: req.url,
      ip: clientIp,
      userAgent
    });

    logApiRequest({
      method: req.method!,
      url: req.url!,
      statusCode: 500,
      responseTime,
      userAgent,
      ip: clientIp as string,
      error
    });

    return res.status(500).json({ error: 'Internal server error' });
  }
}