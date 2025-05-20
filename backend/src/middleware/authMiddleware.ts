// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import AppError from '../utils/appError';
import db from '../db';
import redisService from '../services/redisService';

interface JwtPayload {
  id: string;
  role: string;
}

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

/**
 * Middleware to protect routes that require authentication
 */
export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
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
    const isBlacklisted = await redisService.getBlacklistedToken(token);
    if (isBlacklisted) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }

    // 4) Verify token
    const decoded = jwt.verify(token, config.jwtSecret) as JwtPayload;

    // 5) Check if user still exists
    const userResult = await db.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
    if (userResult.rows.length === 0) {
      return next(new AppError('User no longer exists.', 401));
    }

    // 6) Set user on request
    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    next(error);
  }
};

/**
 * Middleware to restrict access based on user roles
 * @param roles - Array of allowed roles
 */
export const restrictTo = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action', 403));
    }

    next();
  };
};

export default {
  protect,
  restrictTo
};