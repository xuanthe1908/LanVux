import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import AppError from '../utils/appError';
import db from '../db';
import redisService from '../services/redisService';

interface JwtPayload {
  id: string;
  role: string;
  iat?: number;
  exp?: number;
}

interface UserRow {
  id: string;
  role: string;
  email: string;
  first_name: string;
  last_name: string;
  [key: string]: any;
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // 1) Get token from Authorization header
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // 2) Check if token exists
    if (!token) {
      return next(new AppError('Authentication required. Please log in.', 401));
    }

    // 3) Check if token is blacklisted (logged out)
    try {
      const isBlacklisted = await redisService.getBlacklistedToken(token);
      if (isBlacklisted) {
        return next(new AppError('Invalid token. Please log in again.', 401));
      }
    } catch (redisError) {
      // If Redis is down, continue without blacklist check
      console.warn('Redis unavailable for token blacklist check');
    }

    // 4) Verify token
    let decoded: JwtPayload;
    try {
      decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;
    } catch (jwtError) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 5) Check if user still exists
    const userResult = await db.query<UserRow>(
      'SELECT id, role, email, first_name, last_name FROM users WHERE id = $1', 
      [decoded.id]
    );
    
    if (userResult.rows.length === 0) {
      return next(new AppError('User no longer exists.', 401));
    }

    const user = userResult.rows[0];

    // 6) Set user on request object
    req.user = {
      id: user.id,
      role: user.role as 'student' | 'teacher' | 'admin'
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return next(new AppError('Authentication failed. Please log in again.', 401));
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param roles - Array of allowed roles
 */
export const restrictTo = (...roles: ('student' | 'teacher' | 'admin')[]): any => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

/**
 * Optional authentication - doesn't fail if no token
 */
export const optionalAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next();
    }

    try {
      // Check if token is blacklisted
      const isBlacklisted = await redisService.getBlacklistedToken(token);
      if (isBlacklisted) {
        return next();
      }
    } catch (redisError) {
      // Continue if Redis is unavailable
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // Check if user exists
    const userResult = await db.query<UserRow>(
      'SELECT id, role FROM users WHERE id = $1', 
      [decoded.id]
    );

    if (userResult.rows.length > 0) {
      const user = userResult.rows[0];
      req.user = {
        id: user.id,
        role: user.role as 'student' | 'teacher' | 'admin'
      };
    }

    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

/**
 * Check if user owns the resource or has admin privileges
 */
export const checkOwnership = (resourceUserIdField: string = 'user_id') => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    // Admins can access everything
    if (req.user.role === 'admin') {
      return next();
    }

    // Check if user owns the resource
    const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
    
    if (resourceUserId && resourceUserId !== req.user.id) {
      return next(new AppError('You can only access your own resources', 403));
    }

    next();
  };
};

/**
 * Validate API key for external integrations
 */
export const validateApiKey = (req: Request, res: Response, next: NextFunction): void => {
  const apiKey = req.headers['x-api-key'] as string;
  
  if (!apiKey) {
    return next(new AppError('API key required', 401));
  }

  // In production, validate against database
  const validApiKeys = process.env.VALID_API_KEYS?.split(',') || [];
  
  if (!validApiKeys.includes(apiKey)) {
    return next(new AppError('Invalid API key', 401));
  }

  next();
};

export default {
  protect,
  restrictTo,
  optionalAuth,
  checkOwnership,
  validateApiKey
};