import { Request, Response, NextFunction } from 'express';
import db from '../db';
import AppError from '../utils/appError';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

/**
 * Check if user exists and is active
 */
export const checkUserExists = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query(
      'SELECT id, role, is_active, email_verified FROM users WHERE id = ?',
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = result.rows[0];
    
    // Attach user info to request for further middleware
    (req as any).targetUser = user;
    
    next();
  } catch (error) {
    logger.error('Check user exists error:', error);
    next(error);
  }
};

/**
 * Check if user is active (not suspended/deactivated)
 */
export const checkUserActive = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const targetUser = (req as any).targetUser;
  
  if (targetUser && !targetUser.is_active) {
    return next(new AppError('User account is deactivated', 403));
  }
  
  next();
};

/**
 * Check if user email is verified (for sensitive operations)
 */
export const checkEmailVerified = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const targetUser = (req as any).targetUser;
  
  if (targetUser && !targetUser.email_verified) {
    return next(new AppError('Email verification required', 403));
  }
  
  next();
};

/**
 * Prevent operations on admin users by non-admin users
 */
export const protectAdminUsers = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const targetUser = (req as any).targetUser;
  const currentUser = req.user;
  
  if (targetUser && targetUser.role === 'admin' && currentUser?.role !== 'admin') {
    return next(new AppError('Cannot perform this operation on admin users', 403));
  }
  
  next();
};

/**
 * Check user self-access (user can only access their own data)
 */
export const checkSelfAccess = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  const currentUserId = req.user?.id;
  
  if (id !== currentUserId && req.user?.role !== 'admin') {
    return next(new AppError('You can only access your own data', 403));
  }
  
  next();
};

/**
 * Check if user has required role permissions
 */
export const checkRolePermissions = (allowedRoles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const currentUserRole = req.user?.role;
    const targetUser = (req as any).targetUser;
    
    // Admin can always access
    if (currentUserRole === 'admin') {
      return next();
    }
    
    // Check if current user role is in allowed roles
    if (!allowedRoles.includes(currentUserRole || '')) {
      return next(new AppError('Insufficient permissions', 403));
    }
    
    // For teachers, they can only access their own students
    if (currentUserRole === 'teacher' && targetUser?.role === 'student') {
      // This would require checking if the student is enrolled in teacher's courses
      // For now, we'll allow access and let the controller handle the specific logic
      return next();
    }
    
    next();
  };
};

/**
 * Log user operations for audit trail
 */
export const logUserOperation = (operation: string) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const currentUser = req.user;
    const targetUserId = req.params.id;
    const targetUser = (req as any).targetUser;
    
    logger.info('User operation', {
      operation,
      performedBy: {
        id: currentUser?.id,
        role: currentUser?.role
      },
      targetUser: {
        id: targetUserId,
        role: targetUser?.role,
        email: targetUser?.email
      },
      timestamp: new Date(),
      ip: req.ip,
      userAgent: req.headers['user-agent']
    });
    
    next();
  };
};

/**
 * Validate user data before operations
 */
export const validateUserData = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { body } = req;
  
  // Check for sensitive field modifications
  const sensitiveFields = ['role', 'is_active', 'email_verified'];
  const hasSensitiveFields = sensitiveFields.some(field => field in body);
  
  if (hasSensitiveFields && req.user?.role !== 'admin') {
    return next(new AppError('Only administrators can modify sensitive user fields', 403));
  }
  
  // Validate role changes
  if (body.role && !['student', 'teacher'].includes(body.role)) {
    return next(new AppError('Invalid role specified', 400));
  }
  
  next();
};

/**
 * Check user dependencies before deletion
 */
export const checkUserDependencies = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { force } = req.query;
    
    // Skip check if force delete is requested
    if (force === 'true') {
      return next();
    }
    
    // Check for user dependencies
    const dependencies = await db.query(
      `SELECT 
         (SELECT COUNT(*) FROM courses WHERE teacher_id = ?) as courses_count,
         (SELECT COUNT(*) FROM enrollments WHERE user_id = ?) as enrollments_count,
         (SELECT COUNT(*) FROM assignment_submissions WHERE user_id = ?) as submissions_count,
         (SELECT COUNT(*) FROM messages WHERE sender_id = ? OR recipient_id = ?) as messages_count,
         (SELECT COUNT(*) FROM payments WHERE user_id = ?) as payments_count`,
      [id, id, id, id, id, id]
    );
    
    const deps = dependencies.rows[0];
    const hasDependencies = Object.values(deps).some(count => parseInt(count as string) > 0);
    
    if (hasDependencies) {
      const dependencyDetails = Object.entries(deps)
        .filter(([_, count]) => parseInt(count as string) > 0)
        .map(([key, count]) => `${key}: ${count}`)
        .join(', ');
      
      return next(new AppError(
        `User has dependencies: ${dependencyDetails}. Use force=true to delete anyway.`,
        400
      ));
    }
    
    next();
  } catch (error) {
    logger.error('Check user dependencies error:', error);
    next(error);
  }
};

/**
 * Rate limiting for user-specific operations
 */
export const userOperationRateLimit = (maxOperations: number = 10, windowMs: number = 60000) => {
  const operationTracker = new Map<string, { count: number; resetTime: number }>();
  
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    const userId = req.user?.id;
    const operation = req.route?.path || req.path;
    const key = `${userId}:${operation}`;
    const now = Date.now();
    
    if (!operationTracker.has(key)) {
      operationTracker.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    const record = operationTracker.get(key)!;
    
    if (now > record.resetTime) {
      // Reset the window
      operationTracker.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    
    if (record.count >= maxOperations) {
      logger.warn('User operation rate limit exceeded', {
        userId,
        operation,
        count: record.count,
        maxOperations
      });
      
      return next(new AppError('Too many operations. Please try again later.', 429));
    }
    
    record.count++;
    next();
  };
};

/**
 * Sanitize user profile data
 */
export const sanitizeUserProfile = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { body } = req;
  
  // Remove any potentially dangerous HTML/scripts from text fields
  const textFields = ['firstName', 'lastName', 'bio'];
  
  textFields.forEach(field => {
    if (body[field] && typeof body[field] === 'string') {
      // Remove HTML tags and trim whitespace
      body[field] = body[field]
        .replace(/<[^>]*>/g, '')
        .trim();
    }
  });
  
  // Normalize email if present
  if (body.email && typeof body.email === 'string') {
    body.email = body.email.toLowerCase().trim();
  }
  
  // Validate phone number format
  if (body.phoneNumber && typeof body.phoneNumber === 'string') {
    // Remove all non-digit characters except + for international format
    body.phoneNumber = body.phoneNumber.replace(/[^\d+]/g, '');
  }
  
  next();
};

/**
 * Check user quota/limits before operations
 */
export const checkUserQuota = (quotaType: 'courses' | 'enrollments' | 'messages', limit: number) => {
  return async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        return next(new AppError('Authentication required', 401));
      }
      
      let query = '';
      let params = [userId];
      
      switch (quotaType) {
        case 'courses':
          query = 'SELECT COUNT(*) as count FROM courses WHERE teacher_id = ?';
          break;
        case 'enrollments':
          query = 'SELECT COUNT(*) as count FROM enrollments WHERE user_id = ?';
          break;
        case 'messages':
          query = 'SELECT COUNT(*) as count FROM messages WHERE sender_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 1 DAY)';
          break;
        default:
          return next(new AppError('Invalid quota type', 400));
      }
      
      const result = await db.query<{ count: string }>(query, params);
      const currentCount = parseInt(result.rows[0]?.count || '0');
      
      if (currentCount >= limit) {
        return next(new AppError(`${quotaType} quota exceeded. Maximum allowed: ${limit}`, 429));
      }
      
      next();
    } catch (error) {
      logger.error('Check user quota error:', error);
      next(error);
    }
  };
};

/**
 * Validate bulk operations
 */
export const validateBulkOperation = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { userIds, action } = req.body;
  
  if (!Array.isArray(userIds)) {
    return next(new AppError('userIds must be an array', 400));
  }
  
  if (userIds.length === 0) {
    return next(new AppError('userIds array cannot be empty', 400));
  }
  
  if (userIds.length > 100) {
    return next(new AppError('Cannot process more than 100 users at once', 400));
  }
  
  const validActions = ['activate', 'deactivate', 'verify_email', 'change_role'];
  if (!validActions.includes(action)) {
    return next(new AppError(`Invalid action. Must be one of: ${validActions.join(', ')}`, 400));
  }
  
  // Check for duplicate IDs
  const uniqueIds = new Set(userIds);
  if (uniqueIds.size !== userIds.length) {
    return next(new AppError('Duplicate user IDs found', 400));
  }
  
  next();
};

/**
 * Check if user can be modified (prevent self-modification of critical fields)
 */
export const checkUserModificationPermissions = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const { id } = req.params;
  const { role, active } = req.body;
  const currentUser = req.user;
  
  // Prevent users from modifying their own role or active status
  if (id === currentUser?.id) {
    if (role !== undefined) {
      return next(new AppError('Cannot modify your own role', 403));
    }
    
    if (active === false) {
      return next(new AppError('Cannot deactivate your own account', 403));
    }
  }
  
  next();
};

/**
 * Cache user data for performance
 */
export const cacheUserData = (req: AuthRequest, res: Response, next: NextFunction): void => {
  // Simple in-memory cache for user data
  // In production, you would use Redis or similar
  const cacheKey = `user:${req.params.id}`;
  const cachedData = (global as any).userCache?.[cacheKey];
  
  if (cachedData && Date.now() - cachedData.timestamp < 300000) { // 5 minutes
    (req as any).cachedUser = cachedData.user;
  }
  
  next();
};

export default {
  checkUserExists,
  checkUserActive,
  checkEmailVerified,
  protectAdminUsers,
  checkSelfAccess,
  checkRolePermissions,
  logUserOperation,
  validateUserData,
  checkUserDependencies,
  userOperationRateLimit,
  sanitizeUserProfile,
  checkUserQuota,
  validateBulkOperation,
  checkUserModificationPermissions,
  cacheUserData
};