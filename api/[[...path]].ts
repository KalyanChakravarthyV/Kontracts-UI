import type { VercelRequest, VercelResponse } from '@vercel/node';
import { logApiRequest } from './lib/logger.js';

export default function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    const responseTime = Date.now() - startTime;
    logApiRequest({
      method: req.method!,
      url: req.url!,
      statusCode: 200,
      responseTime,
      userAgent,
      ip: clientIp as string,
    });
    return res.status(200).end();
  }

  const responseTime = Date.now() - startTime;
  logApiRequest({
    method: req.method!,
    url: req.url!,
    statusCode: 410,
    responseTime,
    userAgent,
    ip: clientIp as string,
  });

  return res.status(410).json({
    error: 'SuperTokens endpoints have been removed. Use Auth0 authentication flows instead.',
  });
}
