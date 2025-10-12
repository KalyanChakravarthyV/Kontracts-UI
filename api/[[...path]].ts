import type { VercelRequest, VercelResponse } from '@vercel/node';
import supertokens from 'supertokens-node';
import { middleware, errorHandler } from 'supertokens-node/framework/express';
import { SuperTokensConfig, getWebsiteDomain } from './auth/supertokens-config.ts';
import { authLogger, logApiRequest, logAuthEvent } from './lib/logger.js';

// Initialize SuperTokens
let initialized = false;

async function initSupertokens() {
  if (!initialized) {
    try {
      supertokens.init(SuperTokensConfig);
      initialized = true;
      authLogger.info('SuperTokens initialized successfully');
    } catch (error) {
      authLogger.error('Failed to initialize SuperTokens', { error: error.message, stack: error.stack });
      throw error;
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const startTime = Date.now();
  const clientIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // Log incoming request
  authLogger.info('Auth API Request Started', {
    method: req.method,
    url: req.url,
    ip: clientIp,
    userAgent,
    timestamp: new Date().toISOString()
  });

  try {
    await initSupertokens();

    const websiteDomain = getWebsiteDomain();

    // Determine allowed origin
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigin = origin && (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('https://kontracts-ui.vadlakonda.in') ||
      origin.includes('vercel.app')
    ) ? origin : websiteDomain;

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', [
      'content-type',
      'authorization',
      'accept',
      'x-supertokens-sdk-name',
      'x-supertokens-sdk-version',
      ...supertokens.getAllCORSHeaders()
    ].join(', '));
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight requests
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

    // Simple middleware wrapper
    const supertokensMiddleware = middleware();
    const supertokensErrorHandler = errorHandler();

    // Mock Express request/response for SuperTokens
    const mockReq = {
      method: req.method,
      url: req.url,
      originalUrl: req.url,
      headers: req.headers,
      body: req.body,
      query: req.query,
      get: (name: string) => req.headers[name.toLowerCase()],
      header: (name: string) => req.headers[name.toLowerCase()],
    } as any;

    const mockRes = {
      headersSent: false,
      locals: {},
      status: (code: number) => {
        res.status(code);
        return mockRes;
      },
      setHeader: (name: string, value: string) => {
        res.setHeader(name, value);
        return mockRes;
      },
      getHeader: (name: string) => res.getHeader(name),
      getHeaders: () => ({}),
      json: (data: any) => res.json(data),
      send: (data: any) => res.send(data),
      end: (data?: any) => res.end(data),
      redirect: (url: string) => res.redirect(url),
    } as any;

    return new Promise<void>((resolve) => {
      supertokensMiddleware(mockReq, mockRes, (err?: any) => {
        const responseTime = Date.now() - startTime;

        if (err) {
          // Log authentication error
          logAuthEvent({
            action: 'auth_middleware_error',
            ip: clientIp as string,
            userAgent,
            success: false,
            error: err,
            metadata: {
              url: req.url,
              method: req.method
            }
          });

          logApiRequest({
            method: req.method!,
            url: req.url!,
            statusCode: 500,
            responseTime,
            userAgent,
            ip: clientIp as string,
            error: err
          });

          supertokensErrorHandler(err, mockReq, mockRes, () => {
            res.status(500).json({ error: 'Authentication error' });
            resolve();
          });
        } else {
          // Log successful auth request or 404
          logApiRequest({
            method: req.method!,
            url: req.url!,
            statusCode: 404,
            responseTime,
            userAgent,
            ip: clientIp as string
          });

          res.status(404).json({ error: 'Auth endpoint not found' });
          resolve();
        }
      });
    });

  } catch (error) {
    const responseTime = Date.now() - startTime;

    // Log critical error
    authLogger.error('SuperTokens handler critical error', {
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