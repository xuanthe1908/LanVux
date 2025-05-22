import rateLimit from 'express-rate-limit';
import config from '../config';

// Create store for rate limiting (memory-based for simplicity, use Redis in production)
const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  message: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    max: options.max,
    message: {
      status: 'error',
      message: options.message
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: options.skipSuccessfulRequests || false,
    skipFailedRequests: options.skipFailedRequests || false,
    // Custom key generator to include user ID for authenticated requests
    keyGenerator: (req) => {
      const userId = req.user?.id;
      const ip = req.ip || req.connection.remoteAddress || 'unknown';
      return userId ? `user:${userId}` : `ip:${ip}`;
    },
    // Skip rate limiting for certain conditions
    skip: (req) => {
      // Skip for health checks
      if (req.path === '/api/health') return true;
      
      // Skip for admins (be careful with this in production)
      if (req.user?.role === 'admin') return true;
      
      return false;
    },
    handler: (req, res) => {
      res.status(429).json({
        status: 'error',
        message: options.message,
        retryAfter: Math.ceil(options.windowMs / 1000)
      });
    }
  });
};

// General rate limiting for all API requests
export const generalLimiter = createRateLimiter({
  windowMs: config.rateLimit.windowMs, // 15 minutes
  max: config.rateLimit.max, // 100 requests per window per IP/user
  message: 'Too many requests from this IP, please try again later.'
});

// Strict rate limiting for authentication endpoints
export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts per window
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true // Don't count successful logins against the limit
});

// AI chat rate limiting - more restrictive
export const aiChatLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 AI requests per minute
  message: 'Too many AI chat requests, please wait before sending another message.'
});

// Upload rate limiting
export const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 uploads per window
  message: 'Too many upload requests, please try again later.'
});

// Password reset rate limiting
export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 password reset attempts per hour
  message: 'Too many password reset attempts, please try again later.'
});

// Email verification rate limiting
export const emailVerificationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 email verification requests per hour
  message: 'Too many email verification requests, please try again later.'
});

// Course creation rate limiting (prevent spam)
export const courseCreationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 courses per hour per teacher
  message: 'Too many course creation requests, please try again later.'
});

// Assignment submission rate limiting
export const assignmentSubmissionLimiter = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // 5 submissions per minute (to prevent spam resubmissions)
  message: 'Too many assignment submissions, please wait before trying again.'
});

// Message sending rate limiting
export const messageLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 messages per 15 minutes
  message: 'Too many messages sent, please try again later.'
});

// Registration rate limiting
export const registrationLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 registrations per IP per hour
  message: 'Too many registration attempts from this IP, please try again later.'
});

// Export all limiters for easy import
export default {
  generalLimiter,
  authLimiter,
  aiChatLimiter,
  uploadLimiter,
  passwordResetLimiter,
  emailVerificationLimiter,
  courseCreationLimiter,
  assignmentSubmissionLimiter,
  messageLimiter,
  registrationLimiter
};