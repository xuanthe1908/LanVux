import express, { Request, Response, NextFunction } from 'express';
import { body, param, query } from 'express-validator';
import userController from '../controllers/userController';
import { protect, restrictTo, checkOwnership } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody, validateFileUpload } from '../middleware/validateRequest';
import upload from '../middleware/uploadMiddleware';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface User {
      id: string;
      role: 'student' | 'teacher' | 'admin';
      [key: string]: any;
    }
    interface Request {
      user?: User;
    }
  }
}

const router = express.Router();

// All user routes require authentication
router.use(protect);

/**
 * @route GET /api/users
 * @desc Get all users
 * @access Private (Admin)
 */
router.get(
  '/',
  restrictTo('admin'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('role')
      .optional()
      .isIn(['student', 'teacher', 'admin'])
      .withMessage('Role must be student, teacher, or admin'),
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Search query must be between 1 and 100 characters'),
    query('sortBy')
      .optional()
      .isIn(['first_name', 'last_name', 'email', 'created_at', 'role'])
      .withMessage('Sort by must be one of: first_name, last_name, email, created_at, role'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean'),
    validateRequest
  ],
  userController.getAllUsers
);

/**
 * @route GET /api/users/profile
 * @desc Get current user's profile
 * @access Private
 */
router.get('/profile', (req: Request, res: Response, next: NextFunction) => {
  // Set the user ID from the authenticated user
  req.params.id = (req.user as Express.User).id;
  userController.getUserById(req, res, next);
});

/**
 * @route GET /api/users/:id
 * @desc Get user by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction) => {
    // Students can only view their own profile, teachers and admins can view others
    if (req.user!.role === 'student' && req.params.id !== req.user!.id) {
      return res.status(403).json({
        status: 'error',
        message: 'Students can only view their own profile'
      });
    } else {
      return userController.getUserById(req, res, next);
    }
  }
);

/**
 * @route PATCH /api/users/profile
 * @desc Update current user's profile
 * @access Private
 */
router.patch(
  '/profile',
  sanitizeBody,
  [
    body('firstName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters')
      .trim()
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    body('lastName')
      .optional()
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters')
      .trim()
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    body('bio')
      .optional()
      .isString()
      .withMessage('Bio must be a string')
      .isLength({ max: 1000 })
      .withMessage('Bio must be less than 1000 characters')
      .trim(),
    body('profilePicture')
      .optional()
      .isURL()
      .withMessage('Profile picture must be a valid URL')
      .isLength({ max: 500 })
      .withMessage('Profile picture URL must be less than 500 characters'),
    body('phoneNumber')
      .optional()
      .isMobilePhone('any')
      .withMessage('Phone number must be a valid mobile phone number'),
    body('dateOfBirth')
      .optional()
      .isISO8601()
      .withMessage('Date of birth must be a valid date')
      .custom((value) => {
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13 || age > 120) {
          throw new Error('Age must be between 13 and 120 years');
        }
        return true;
      }),
    body('timezone')
      .optional()
      .isString()
      .withMessage('Timezone must be a string')
      .isLength({ max: 50 })
      .withMessage('Timezone must be less than 50 characters'),
    body('language')
      .optional()
      .isIn(['en', 'es', 'fr', 'de', 'zh', 'ja', 'vi'])
      .withMessage('Language must be one of: en, es, fr, de, zh, ja, vi'),
    validateRequest
  ],
  userController.updateProfile
);

/**
 * @route POST /api/users/profile/avatar
 * @desc Upload profile avatar
 * @access Private
 */
router.post(
  '/profile/avatar',
  upload.single('avatar'),
  validateFileUpload({
    required: true,
    maxSize: 5 * 1024 * 1024, // 5MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  }),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'No file uploaded'
      });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;

    // Update user profile with new avatar URL
    // This would typically update the database
    return res.status(200).json({
      status: 'success',
      data: {
        avatarUrl,
        message: 'Avatar uploaded successfully'
      }
    });
  }
);

/**
 * @route DELETE /api/users/:id
 * @desc Delete user
 * @access Private (Admin)
 */
router.delete(
  '/:id',
  restrictTo('admin'),
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    body('confirmEmail')
      .optional()
      .isEmail()
      .withMessage('Confirmation email must be valid'),
    body('reason')
      .optional()
      .isString()
      .isLength({ min: 10, max: 500 })
      .withMessage('Deletion reason must be between 10 and 500 characters'),
    validateRequest
  ],
  userController.deleteUser
);

/**
 * @route PATCH /api/users/:id/role
 * @desc Update user role
 * @access Private (Admin)
 */
router.patch(
  '/:id/role',
  restrictTo('admin'),
  sanitizeBody,
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    body('role')
      .isIn(['student', 'teacher', 'admin'])
      .withMessage('Role must be student, teacher, or admin'),
    body('reason')
      .notEmpty()
      .withMessage('Reason for role change is required')
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'User role updated successfully',
      data: {
        userId: req.params.id,
        newRole: req.body.role,
        reason: req.body.reason
      }
    });
  }
);

/**
 * @route PATCH /api/users/:id/status
 * @desc Update user status (active/inactive)
 * @access Private (Admin)
 */
router.patch(
  '/:id/status',
  restrictTo('admin'),
  sanitizeBody,
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    body('active')
      .isBoolean()
      .withMessage('Active status must be a boolean'),
    body('reason')
      .notEmpty()
      .withMessage('Reason for status change is required')
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    return res.status(200).json({
      status: 'success',
      message: 'User status updated successfully',
      data: {
        userId: req.params.id,
        active: req.body.active,
        reason: req.body.reason
      }
    });
  }
);

/**
 * @route GET /api/users/:id/activity
 * @desc Get user activity log
 * @access Private (Self, Admin)
 */
router.get(
  '/:id/activity',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('type')
      .optional()
      .isIn(['login', 'course_access', 'assignment_submit', 'profile_update'])
      .withMessage('Activity type must be one of: login, course_access, assignment_submit, profile_update'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    if (req.user!.role !== 'admin' && req.params.id !== req.user!.id) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only view your own activity log'
      });
    } else {
      // This would need implementation in the controller
      return res.status(200).json({
        status: 'success',
        message: 'Activity log feature to be implemented',
        data: {
          activities: [],
          totalCount: 0
        }
      });
    }
  }
);

/**
 * @route GET /api/users/stats
 * @desc Get user statistics
 * @access Private (Admin, Teacher for their students)
 */
router.get(
  '/stats',
  restrictTo('admin', 'teacher'),
  [
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('role')
      .optional()
      .isIn(['student', 'teacher'])
      .withMessage('Role filter must be student or teacher'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    return res.status(200).json({
      status: 'success',
      message: 'User statistics feature to be implemented',
      data: {
        totalUsers: 0,
        activeUsers: 0,
        newUsersThisMonth: 0,
        usersByRole: {
          students: 0,
          teachers: 0,
          admins: 0
        }
      }
    });
  }
);

export default router;