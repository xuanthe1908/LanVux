// src/middleware/securityMiddleware.ts - COMPLETE VERSION
import { Request, Response, NextFunction } from 'express';
import AppError from '../utils/appError';
import logger from '../utils/logger';

/**
 * Sanitize user input to prevent XSS attacks
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction): void => {
  const sanitize = (obj: any): any => {
    if (typeof obj === 'string') {
      // Remove script tags and dangerous HTML
      return obj
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
        .replace(/<object[^>]*>.*?<\/object>/gi, '')
        .replace(/<embed[^>]*>.*?<\/embed>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '');
    }
    
    if (typeof obj === 'object' && obj !== null) {
      if (Array.isArray(obj)) {
        return obj.map(sanitize);
      }
      
      const sanitized: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          sanitized[key] = sanitize(obj[key]);
        }
      }
      return sanitized;
    }
    
    return obj;
  };

  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

/**
 * Prevent NoSQL injection attacks
 */
export const preventNoSQLInjection = (req: Request, res: Response, next: NextFunction): void => {
  const checkForInjection = (obj: any): boolean => {
    if (typeof obj === 'object' && obj !== null) {
      for (const key in obj) {
        if (key.startsWith('$') || typeof obj[key] === 'object') {
          return true;
        }
        if (typeof obj[key] === 'string') {
          // Check for common injection patterns
          const dangerousPatterns = [
            /\$where/i,
            /\$ne/i,
            /\$gt/i,
            /\$lt/i,
            /\$regex/i,
            /\$or/i,
            /\$and/i
          ];
          
          if (dangerousPatterns.some(pattern => pattern.test(obj[key]))) {
            return true;
          }
        }
      }
    }
    return false;
  };

  if (checkForInjection(req.body) || checkForInjection(req.query) || checkForInjection(req.params)) {
    return next(new AppError('Invalid input detected', 400));
  }

  next();
};

/**
 * Check Content-Type for POST/PUT/PATCH requests
 */
export const validateContentType = (req: Request, res: Response, next: NextFunction): void => {
  const methods = ['POST', 'PUT', 'PATCH'];
  
  if (methods.includes(req.method)) {
    const contentType = req.headers['content-type'];
    
    if (!contentType) {
      return next(new AppError('Content-Type header is required', 400));
    }
    
    // Allow application/json and multipart/form-data
    const allowedTypes = [
      'application/json',
      'multipart/form-data',
      'application/x-www-form-urlencoded'
    ];
    
    const isValidType = allowedTypes.some(type => contentType.includes(type));
    
    if (!isValidType) {
      return next(new AppError('Invalid Content-Type', 400));
    }
  }
  
  next();
};

/**
 * Prevent parameter pollution
 */
export const preventParameterPollution = (whitelist: string[] = []) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check for duplicate parameters
    for (const key in req.query) {
      if (Array.isArray(req.query[key]) && !whitelist.includes(key)) {
        // Only keep the last value for non-whitelisted parameters
        req.query[key] = (req.query[key] as string[]).pop();
      }
    }
    
    next();
  };
};

/**
 * Add security headers
 */
export const addSecurityHeaders = (req: Request, res: Response, next: NextFunction): void => {
  // X-Content-Type-Options
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // X-Frame-Options
  res.setHeader('X-Frame-Options', 'DENY');
  
  // X-XSS-Protection
  res.setHeader('X-XSS-Protection', '1; mode=block');
  
  // Referrer Policy
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';"
  );
  
  // Remove X-Powered-By header
  res.removeHeader('X-Powered-By');
  
  next();
};

/**
 * Check for suspicious user agents
 */
export const checkUserAgent = (req: Request, res: Response, next: NextFunction): void => {
  const userAgent = req.headers['user-agent'];
  
  if (!userAgent) {
    logger.warn('Request without User-Agent header', {
      ip: req.ip,
      path: req.path
    });
    return next(new AppError('User-Agent header is required', 400));
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    /bot/i,
    /crawler/i,
    /spider/i,
    /scraper/i,
    /curl/i,
    /wget/i,
    /python/i,
    /perl/i
  ];
  
  // Allow legitimate bots (Google, Bing, etc.)
  const legitimateBots = [
    /googlebot/i,
    /bingbot/i,
    /slurp/i,
    /duckduckbot/i,
    /baiduspider/i
  ];
  
  const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(userAgent));
  const isLegitimate = legitimateBots.some(pattern => pattern.test(userAgent));
  
  if (isSuspicious && !isLegitimate) {
    logger.warn('Suspicious User-Agent detected', {
      userAgent,
      ip: req.ip,
      path: req.path
    });
    
    // Don't block completely, but log for monitoring
    // return next(new AppError('Access denied', 403));
  }
  
  next();
};

/**
 * Validate request size
 */
export const validateRequestSize = (maxSize: number = 1024 * 1024) => { // 1MB default
  return (req: Request, res: Response, next: NextFunction): void => {
    const contentLength = req.headers['content-length'];
    
    if (contentLength && parseInt(contentLength) > maxSize) {
      return next(new AppError(`Request too large. Maximum size: ${maxSize} bytes`, 413));
    }
    
    next();
  };
};

/**
 * Check if user account is active and verified
 */
export const checkAccountStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (req.user) {
      // This would typically check database for user status
      // For now, we'll assume all users are active
      const user = req.user as any;
      
      if (user.status === 'suspended') {
        return next(new AppError('Account suspended', 403));
      }
      
      if (user.status === 'deactivated') {
        return next(new AppError('Account deactivated', 403));
      }
      
      if (user.emailVerified === false && req.path !== '/api/auth/verify-email') {
        return next(new AppError('Email verification required', 403));
      }
    }
    
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Log security events
 */
export const logSecurityEvent = (eventType: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    logger.info('Security event', {
      type: eventType,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      path: req.path,
      method: req.method,
      userId: req.user?.id || 'anonymous',
      timestamp: new Date()
    });
    
    next();
  };
};

/**
 * Prevent brute force attacks on specific endpoints
 */
export const bruteForceProtection = (attempts: number = 5, windowMs: number = 15 * 60 * 1000) => {
  const attempts_map = new Map();
  
  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip + req.path;
    const now = Date.now();
    
    if (!attempts_map.has(key)) {
      attempts_map.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = attempts_map.get(key);
    
    if (now > record.resetTime) {
      // Reset the window
      attempts_map.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= attempts) {
      logger.warn('Brute force attempt detected', {
        ip: req.ip,
        path: req.path,
        attempts: record.count
      });
      
      return next(new AppError('Too many attempts. Please try again later.', 429));
    }
    
    record.count++;
    next();
  };
};

/**
 * CORS preflight handler
 */
export const handleCORS = (req: Request, res: Response, next: NextFunction): void | Response => {
  const origin = req.headers.origin;
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'];
  
  if (allowedOrigins.includes(origin || '')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
};

export default {
  sanitizeInput,
  preventNoSQLInjection,
  validateContentType,
  preventParameterPollution,
  addSecurityHeaders,
  checkUserAgent,
  validateRequestSize,
  checkAccountStatus,
  logSecurityEvent,
  bruteForceProtection,
  handleCORS
};