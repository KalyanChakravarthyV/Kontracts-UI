import type { VercelRequest, VercelResponse } from '@vercel/node';
import Session from 'supertokens-node/recipe/session';
import supertokens from 'supertokens-node';
import { SuperTokensConfig } from './supertokens-config.js';
import { authLogger, logAuthEvent } from '../lib/logger.js';

let initialized = false;

async function initSupertokens() {
  if (!initialized) {
    try {
      supertokens.init(SuperTokensConfig);
      initialized = true;
      authLogger.info('SuperTokens initialized successfully for logout-all');
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

  authLogger.info('Logout-all request received', {
    method: req.method,
    url: req.url,
    ip: clientIp,
    userAgent,
    timestamp: new Date().toISOString()
  });

  try {
    await initSupertokens();

    // Set CORS headers
    const origin = req.headers.origin || req.headers.referer;
    const allowedOrigin = origin && (
      origin.startsWith('http://localhost:') ||
      origin.startsWith('https://kontracts-ui.vadlakonda.in') ||
      origin.includes('vercel.app')
    ) ? origin : 'http://localhost:3000';

    res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'content-type, authorization');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    // Handle preflight
    if (req.method === 'OPTIONS') {
      return res.status(200).end();
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' });
    }

    // Get current session to identify user
    const session = await Session.getSession(req, res, { sessionRequired: false });

    if (session) {
      const userId = session.getUserId();

      // Revoke all sessions for this user
      const sessionHandles = await Session.getAllSessionHandlesForUser(userId);

      authLogger.info('Revoking all sessions for user', {
        userId,
        sessionCount: sessionHandles.length,
        ip: clientIp,
        userAgent
      });

      // Revoke each session
      await Promise.all(
        sessionHandles.map(handle => Session.revokeSession(handle))
      );

      const responseTime = Date.now() - startTime;

      logAuthEvent({
        action: 'logout_all',
        userId,
        ip: clientIp as string,
        userAgent,
        success: true,
        metadata: {
          sessionsRevoked: sessionHandles.length,
          responseTime
        }
      });

      authLogger.info('All sessions revoked successfully', {
        userId,
        sessionsRevoked: sessionHandles.length,
        ip: clientIp,
        userAgent,
        responseTime
      });

      return res.status(200).json({
        message: 'All sessions logged out successfully',
        success: true,
        sessionsRevoked: sessionHandles.length
      });
    } else {
      // No active session
      authLogger.info('Logout-all attempt with no active session', {
        ip: clientIp,
        userAgent
      });

      return res.status(200).json({
        message: 'No active session',
        success: true,
        sessionsRevoked: 0
      });
    }

  } catch (error) {
    const responseTime = Date.now() - startTime;

    authLogger.error('Logout-all error', {
      error: error.message,
      stack: error.stack,
      ip: clientIp,
      userAgent,
      responseTime
    });

    logAuthEvent({
      action: 'logout_all',
      ip: clientIp as string,
      userAgent,
      success: false,
      error: error.message,
      metadata: {
        responseTime
      }
    });

    return res.status(500).json({
      error: 'Logout all failed',
      message: error.message
    });
  }
}
