import express, { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import userController from '../controllers/userController';
import { protect, restrictTo, checkOwnership } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody, parseNumbers, parseBooleans, validateFileUpload } from '../middleware/validateRequest';
import upload from '../middleware/uploadMiddleware';
import { bruteForceProtection } from '../middleware/securityMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique user identifier
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         firstName:
 *           type: string
 *           description: User first name
 *         lastName:
 *           type: string
 *           description: User last name
 *         role:
 *           type: string
 *           enum: [student, teacher, admin]
 *           description: User role
 *         profilePicture:
 *           type: string
 *           format: uri
 *           description: Profile picture URL
 *         bio:
 *           type: string
 *           description: User biography
 *         phoneNumber:
 *           type: string
 *           description: User phone number
 *         dateOfBirth:
 *           type: string
 *           format: date
 *           description: User date of birth
 *         timezone:
 *           type: string
 *           description: User timezone
 *         language:
 *           type: string
 *           description: User preferred language
 *         isActive:
 *           type: boolean
 *           description: Whether user account is active
 *         emailVerified:
 *           type: boolean
 *           description: Whether user email is verified
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 *           description: Last login timestamp
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 * 
 *     UserActivity:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum: [enrollment, assignment_submission, course_completion, message_sent]
 *         description:
 *           type: string
 *         action:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         referenceId:
 *           type: string
 * 
 *     UserStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             totalUsers:
 *               type: number
 *             activeUsers:
 *               type: number
 *             verifiedUsers:
 *               type: number
 *             newUsersInPeriod:
 *               type: number
 *             breakdown:
 *               type: object
 *               properties:
 *                 students:
 *                   type: number
 *                 teachers:
 *                   type: number
 *                 admins:
 *                   type: number
 *         activity:
 *           type: object
 *           properties:
 *             totalActive:
 *               type: number
 *             weeklyActive:
 *               type: number
 *             dailyActive:
 *               type: number
 */

// All user routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with filtering and pagination (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, teacher, admin]
 *         description: Filter users by role
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Search users by name or email
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [first_name, last_name, email, created_at, role, last_login_at]
 *           default: created_at
 *         description: Field to sort by
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Filter by email verification status
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created after this date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter users created before this date
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *                     statistics:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                         activeUsers:
 *                           type: number
 *                         verifiedUsers:
 *                           type: number
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   post:
 *     summary: Create a new user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - firstName
 *               - lastName
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: "newuser@example.com"
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 example: "SecurePass123!"
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "John"
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Doe"
 *               role:
 *                 type: string
 *                 enum: [student, teacher]
 *                 default: student
 *               active:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: User already exists or validation error
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
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
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
    query('sortBy')
      .optional()
      .isIn(['first_name', 'last_name', 'email', 'created_at', 'role', 'last_login_at'])
      .withMessage('Sort by must be one of: first_name, last_name, email, created_at, role, last_login_at'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    query('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean'),
    query('verified')
      .optional()
      .isBoolean()
      .withMessage('Verified must be a boolean'),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    validateRequest
  ],
  userController.getAllUsers
);

router.post(
  '/',
  restrictTo('admin'),
  sanitizeBody,
  parseBooleans(['active']),
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must be less than 255 characters'),
    body('password')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    body('firstName')
      .notEmpty()
      .withMessage('First name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('First name must be between 1 and 100 characters')
      .trim()
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage('First name can only contain letters, spaces, hyphens, and apostrophes'),
    body('lastName')
      .notEmpty()
      .withMessage('Last name is required')
      .isLength({ min: 1, max: 100 })
      .withMessage('Last name must be between 1 and 100 characters')
      .trim()
      .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/)
      .withMessage('Last name can only contain letters, spaces, hyphens, and apostrophes'),
    body('role')
      .optional()
      .isIn(['student', 'teacher'])
      .withMessage('Role must be student or teacher'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean'),
    validateRequest
  ],
  userController.createUser
);

/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user profile
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *   patch:
 *     summary: Update current user's profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               bio:
 *                 type: string
 *                 maxLength: 1000
 *               profilePicture:
 *                 type: string
 *                 format: uri
 *               phoneNumber:
 *                 type: string
 *               dateOfBirth:
 *                 type: string
 *                 format: date
 *               timezone:
 *                 type: string
 *                 maxLength: 50
 *               language:
 *                 type: string
 *                 enum: [en, es, fr, de, zh, ja, vi]
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 */
router.get('/profile', (req: Request, res: Response) => {
  // Set the user ID from the authenticated user
  req.params.id = (req.user as any).id;
  userController.getUserById(req, res, () => {});
});

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
 * @swagger
 * /api/users/profile/avatar:
 *   post:
 *     summary: Upload profile avatar
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               avatar:
 *                 type: string
 *                 format: binary
 *                 description: Avatar image file (max 5MB, JPEG/PNG/WebP/GIF)
 *     responses:
 *       200:
 *         description: Avatar uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     avatarUrl:
 *                       type: string
 *                     message:
 *                       type: string
 *       400:
 *         description: No file uploaded or invalid file type
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
 * @swagger
 * /api/users/stats:
 *   get:
 *     summary: Get user statistics (Admin, Teacher for their students)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Number of days for trend analysis
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, teacher, admin]
 *         description: Filter statistics by role
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/UserStats'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/stats',
  restrictTo('admin', 'teacher'),
  [
    query('period')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Period must be between 1 and 365 days'),
    query('role')
      .optional()
      .isIn(['student', 'teacher', 'admin'])
      .withMessage('Role must be student, teacher, or admin'),
    validateRequest
  ],
  userController.getUserStats
);

/**
 * @swagger
 * /api/users/export:
 *   get:
 *     summary: Export users data (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [json, csv]
 *           default: json
 *         description: Export format
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *           enum: [student, teacher, admin]
 *         description: Filter by role
 *       - in: query
 *         name: active
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: verified
 *         schema:
 *           type: boolean
 *         description: Filter by verification status
 *     responses:
 *       200:
 *         description: Users data exported successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 exportedAt:
 *                   type: string
 *                   format: date-time
 *                 totalRecords:
 *                   type: number
 *                 data:
 *                   type: object
 *                   properties:
 *                     users:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/User'
 *           text/csv:
 *             schema:
 *               type: string
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/export',
  restrictTo('admin'),
  [
    query('format')
      .optional()
      .isIn(['json', 'csv'])
      .withMessage('Format must be json or csv'),
    query('role')
      .optional()
      .isIn(['student', 'teacher', 'admin'])
      .withMessage('Role must be student, teacher, or admin'),
    query('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean'),
    query('verified')
      .optional()
      .isBoolean()
      .withMessage('Verified must be a boolean'),
    validateRequest
  ],
  userController.exportUsers
);

/**
 * @swagger
 * /api/users/bulk:
 *   patch:
 *     summary: Bulk update users (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - action
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 100
 *                 example: ["123e4567-e89b-12d3-a456-426614174000"]
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate, verify_email, change_role]
 *                 example: "activate"
 *               value:
 *                 type: string
 *                 description: Required for change_role action
 *                 enum: [student, teacher]
 *     responses:
 *       200:
 *         description: Bulk update completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     affectedCount:
 *                       type: number
 *                     action:
 *                       type: string
 *                     value:
 *                       type: string
 *       400:
 *         description: Invalid request data
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch(
  '/bulk',
  restrictTo('admin'),
  sanitizeBody,
  [
    body('userIds')
      .isArray({ min: 1, max: 100 })
      .withMessage('User IDs must be an array with 1-100 items'),
    body('userIds.*')
      .isUUID()
      .withMessage('Each user ID must be a valid UUID'),
    body('action')
      .isIn(['activate', 'deactivate', 'verify_email', 'change_role'])
      .withMessage('Action must be activate, deactivate, verify_email, or change_role'),
    body('value')
      .optional()
      .custom((value, { req }) => {
        if (req.body.action === 'change_role' && !['student', 'teacher'].includes(value)) {
          throw new Error('Value must be student or teacher for change_role action');
        }
        return true;
      }),
    validateRequest
  ],
  userController.bulkUpdateUsers
);

/**
 * @swagger
 * /api/users/{id}:
 *   get:
 *     summary: Get user by ID
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       allOf:
 *                         - $ref: '#/components/schemas/User'
 *                         - type: object
 *                           properties:
 *                             statistics:
 *                               type: object
 *                               description: Role-specific statistics
 *                             recentActivity:
 *                               type: array
 *                               items:
 *                                 $ref: '#/components/schemas/UserActivity'
 *       403:
 *         description: Students can only view their own profile
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   patch:
 *     summary: Update user by ID (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               lastName:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               role:
 *                 type: string
 *                 enum: [student, teacher]
 *               active:
 *                 type: boolean
 *               emailVerified:
 *                 type: boolean
 *               bio:
 *                 type: string
 *                 maxLength: 1000
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: User updated successfully
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force delete even if user has associated data
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       400:
 *         description: User has associated data and force flag not set
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    validateRequest
  ],
  userController.getUserById
);

router.patch(
  '/:id',
  restrictTo('admin'),
  sanitizeBody,
  parseBooleans(['active', 'emailVerified']),
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
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
    body('role')
      .optional()
      .isIn(['student', 'teacher'])
      .withMessage('Role must be student or teacher'),
    body('active')
      .optional()
      .isBoolean()
      .withMessage('Active must be a boolean'),
    body('emailVerified')
      .optional()
      .isBoolean()
      .withMessage('Email verified must be a boolean'),
    body('bio')
      .optional()
      .isString()
      .withMessage('Bio must be a string')
      .isLength({ max: 1000 })
      .withMessage('Bio must be less than 1000 characters')
      .trim(),
    body('phoneNumber')
      .optional()
      .isMobilePhone('any')
      .withMessage('Phone number must be a valid mobile phone number'),
    validateRequest
  ],
  userController.updateUser
);

router.delete(
  '/:id',
  restrictTo('admin'),
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    query('force')
      .optional()
      .isBoolean()
      .withMessage('Force must be a boolean'),
    validateRequest
  ],
  userController.deleteUser
);

/**
 * @swagger
 * /api/users/{id}/status:
 *   patch:
 *     summary: Update user status (activate/deactivate) (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - active
 *               - reason
 *             properties:
 *               active:
 *                 type: boolean
 *                 example: false
 *               reason:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 500
 *                 example: "Account suspended due to policy violation"
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       403:
 *         description: Cannot deactivate admin users
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:id/status',
  restrictTo('admin'),
  sanitizeBody,
  parseBooleans(['active']),
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    body('active')
      .isBoolean()
      .withMessage('Active status must be a boolean'),
    body('reason')
      .notEmpty()
      .withMessage('Reason for status change is required')
      .isLength({ min: 10, max: 500 })
      .withMessage('Reason must be between 10 and 500 characters')
      .trim(),
    validateRequest
  ],
  userController.updateUserStatus
);

/**
 * @swagger
 * /api/users/{id}/reset-password:
 *   post:
 *     summary: Reset user password (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 128
 *                 example: "NewSecurePass123!"
 *               notifyUser:
 *                 type: boolean
 *                 default: false
 *                 description: Whether to notify user about password reset
 *     responses:
 *       200:
 *         description: Password reset successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/reset-password',
  restrictTo('admin'),
  bruteForceProtection(3, 60 * 60 * 1000), // 3 attempts per hour
  sanitizeBody,
  parseBooleans(['notifyUser']),
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    body('notifyUser')
      .optional()
      .isBoolean()
      .withMessage('Notify user must be a boolean'),
    validateRequest
  ],
  userController.resetUserPassword
);

/**
 * @swagger
 * /api/users/{id}/activity:
 *   get:
 *     summary: Get user activity log
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [enrollment, assignment_submission, course_completion, message_sent]
 *         description: Filter by activity type
 *     responses:
 *       200:
 *         description: User activity retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     activities:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/UserActivity'
 *       403:
 *         description: You can only view your own activity log
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
      .isIn(['enrollment', 'assignment_submission', 'course_completion', 'message_sent'])
      .withMessage('Activity type must be one of: enrollment, assignment_submission, course_completion, message_sent'),
    validateRequest
  ],
  userController.getUserActivity
);

/**
 * @swagger
 * /api/users/{id}/notify:
 *   post:
 *     summary: Send notification to user (Admin only)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - title
 *               - message
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [info, warning, success, error]
 *                 example: "info"
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "Account Update"
 *               message:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 1000
 *                 example: "Your account has been updated successfully."
 *               priority:
 *                 type: string
 *                 enum: [low, normal, high, urgent]
 *                 default: normal
 *     responses:
 *       200:
 *         description: Notification sent successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/notify',
  restrictTo('admin'),
  sanitizeBody,
  [
    param('id').isUUID().withMessage('User ID must be a valid UUID'),
    body('type')
      .isIn(['info', 'warning', 'success', 'error'])
      .withMessage('Type must be info, warning, success, or error'),
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Title must be between 3 and 100 characters')
      .trim(),
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ min: 10, max: 1000 })
      .withMessage('Message must be between 10 and 1000 characters')
      .trim(),
    body('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Priority must be low, normal, high, or urgent'),
    validateRequest
  ],
  userController.sendNotificationToUser
);

export default router;