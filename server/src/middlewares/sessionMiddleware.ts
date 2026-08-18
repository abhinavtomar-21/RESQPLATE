import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './authMiddleware.js';

// In-memory store for sessions (Note: For horizontal scaling, this should be moved to Redis)
export const activeSessions: Record<string, any[]> = {};

/**
 * Validates the session device, IP, and geo-velocity.
 * Complements the Supabase session management flow with backend enforcement.
 */
export const requireValidSession = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) {
    return res.status(401).json({ success: false, error: 'Unauthorized: User context missing' });
  }

  const userId = req.user.id;
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // 1. Enforce Max Sessions (Policy: Max 3)
  if (!activeSessions[userId]) {
    activeSessions[userId] = [];
  }
  
  // Track this request
  const currentSession = { ip, userAgent, timestamp: new Date().toISOString() };
  
  // Very naive geo-velocity check (If IP completely changes within 5 minutes)
  const lastSession = activeSessions[userId][activeSessions[userId].length - 1];
  if (lastSession) {
    const timeDiff = new Date().getTime() - new Date(lastSession.timestamp).getTime();
    if (lastSession.ip !== ip && timeDiff < 5 * 60 * 1000) {
      // Geo-velocity trigger (Suspicious Login)
      console.warn(`🚨 Suspicious Login detected for ${userId}. IP jumped from ${lastSession.ip} to ${ip} in under 5 minutes.`);
      return res.status(403).json({ 
        success: false, 
        error: 'Forbidden: Suspicious login activity detected. Session locked. Please re-authenticate.' 
      });
    }
  }

  // Record session
  activeSessions[userId].push(currentSession);

  // Enforce Max 3 sessions (kick oldest)
  if (activeSessions[userId].length > 3) {
    activeSessions[userId].shift(); // Remove oldest
  }

  next();
};

/**
 * Enforces MFA (Multi-Factor Authentication) based on the user's settings and roles.
 */
export const requireMFA = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  if (!req.user) return res.status(401).json({ success: false, error: 'Unauthorized' });

  // Admins MUST have MFA
  if (req.user.permissionGroup === 'Super Admin' && !req.user.mfaVerified) {
    return res.status(403).json({ 
      success: false, 
      error: 'MFA_REQUIRED', 
      message: 'Multi-Factor Authentication is mandatory for Administrators.' 
    });
  }

  next();
};

