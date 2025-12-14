import type { VercelRequest, VercelResponse } from '@vercel/node';
import { authLogger, logAuthEvent } from '../lib/logger.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const responseTime = Date.now() - startTime;

  logAuthEvent({
    action: 'logout_all',
    ip: clientIp as string,
    userAgent,
    success: false,
    metadata: { responseTime },
  });

  authLogger.info('SuperTokens logout-all endpoint deprecated; Auth0 handles logout now.', {
    ip: clientIp,
    userAgent,
    responseTime,
  });

  return res.status(410).json({
    message: 'Use Auth0 logout from the client. This SuperTokens logout-all endpoint has been retired.',
    success: false,
  });
}
