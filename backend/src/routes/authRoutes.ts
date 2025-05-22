import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import authController from '../controllers/authController';
import { protect } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody } from '../middleware/validateRequest';
import { authLimiter, registrationLimiter, passwordResetLimiter } from '../middleware/rateLimitMiddleware';

const router = express.Router();

/**
 * @route POST /api/auth/reset-password
 * @desc Reset password with token
 * @access Public
 */
router.post(
  '/reset-password',
  passwordResetLimiter,
  sanitizeBody,
  [
    body('token')
      .notEmpty()
      .withMessage('Reset token is required')
      .isLength({ min: 32, max: 128 })
      .withMessage('Invalid reset token format'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('Password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
    validateRequest
  ],
    (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully'
    });
  }
);

/**
 * @route POST /api/auth/verify-email
 * @desc Verify email address
 * @access Public
 */
router.post(
  '/verify-email',
  [
    body('token')
      .notEmpty()
      .withMessage('Verification token is required')
      .isLength({ min: 32, max: 128 })
      .withMessage('Invalid verification token format'),
    validateRequest
  ],
  (req: Request, res: Response) => {
  res.status(200).json({
      status: 'success',
      message: 'Email verified successfully'
    });
  }
);

/**
 * @route POST /api/auth/resend-verification
 * @desc Resend email verification
 * @access Private
 */
router.post(
  '/resend-verification',
  protect,
  (req, res) => {
    // This would need implementation in authController
    res.status(200).json({
      status: 'success',
      message: 'Verification email sent'
    });
  }
);

/**
 * @route POST /api/auth/change-email
 * @desc Change user email
 * @access Private
 */
router.post(
  '/change-email',
  protect,
  sanitizeBody,
  [
    body('newEmail')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail()
      .isLength({ max: 255 })
      .withMessage('Email must be less than 255 characters'),
    body('password')
      .notEmpty()
      .withMessage('Current password is required for email change'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Email change verification sent to new address'
    });
  }
);

/**
 * @route DELETE /api/auth/account
 * @desc Delete user account
 * @access Private
 */
router.delete(
  '/account',
  protect,
  sanitizeBody,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required to delete account'),
    body('confirmDeletion')
      .equals('DELETE MY ACCOUNT')
      .withMessage('Please type "DELETE MY ACCOUNT" to confirm'),
    body('reason')
      .optional()
      .isString()
      .isLength({ max: 500 })
      .withMessage('Reason must be less than 500 characters'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Account deletion scheduled. You have 30 days to recover your account.'
    });
  }
);

/**
 * @route GET /api/auth/sessions
 * @desc Get active sessions
 * @access Private
 */
router.get('/sessions', protect, (req, res) => {
  // This would show all active sessions for the user
  res.status(200).json({
    status: 'success',
    data: {
      sessions: [
        {
          id: 'session-1',
          device: 'Chrome on Windows',
          ip: '192.168.1.1',
          location: 'New York, US',
          lastActive: new Date(),
          current: true
        }
      ]
    }
  });
});

/**
 * @route DELETE /api/auth/sessions/:sessionId
 * @desc Revoke specific session
 * @access Private
 */
router.delete(
  '/sessions/:sessionId',
  protect,
  [
    body('sessionId').isUUID().withMessage('Session ID must be a valid UUID'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Session revoked successfully'
    });
  }
);

/**
 * @route POST /api/auth/enable-2fa
 * @desc Enable two-factor authentication
 * @access Private
 */
router.post('/enable-2fa', protect, (req, res) => {
  // This would generate QR code for 2FA setup
  res.status(200).json({
    status: 'success',
    data: {
      qrCode: 'data:image/png;base64,...',
      secret: 'SECRET_KEY',
      backupCodes: ['123456', '789012']
    }
  });
});

/**
 * @route POST /api/auth/verify-2fa
 * @desc Verify 2FA token
 * @access Private
 */
router.post(
  '/verify-2fa',
  protect,
  [
    body('token')
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA token must be 6 digits')
      .isNumeric()
      .withMessage('2FA token must be numeric'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: '2FA enabled successfully'
    });
  }
);

/**
 * @route DELETE /api/auth/disable-2fa
 * @desc Disable two-factor authentication
 * @access Private
 */
router.delete(
  '/disable-2fa',
  protect,
  [
    body('password')
      .notEmpty()
      .withMessage('Password is required to disable 2FA'),
    body('token')
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA token must be 6 digits')
      .isNumeric()
      .withMessage('2FA token must be numeric'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: '2FA disabled successfully'
    });
  }
);

export default router; 
router.post(
  '/register',
  registrationLimiter, // Rate limiting for registration
  sanitizeBody,
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
    body('confirmPassword')
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
      }),
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
      .withMessage('Role must be student or teacher')
      .default('student'),
    body('agreeToTerms')
      .isBoolean()
      .withMessage('Agreement to terms must be a boolean')
      .custom((value) => {
        if (!value) {
          throw new Error('You must agree to the terms and conditions');
        }
        return true;
      }),
    body('marketingOptIn')
      .optional()
      .isBoolean()
      .withMessage('Marketing opt-in must be a boolean'),
    validateRequest
  ],
  authController.register
);

/**
 * @route POST /api/auth/login
 * @desc Login user
 * @access Public
 */
router.post(
  '/login',
  authLimiter, // Rate limiting for login attempts
  sanitizeBody,
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
      .isLength({ min: 1, max: 128 })
      .withMessage('Password must be between 1 and 128 characters'),
    body('rememberMe')
      .optional()
      .isBoolean()
      .withMessage('Remember me must be a boolean'),
    validateRequest
  ],
  authController.login
);

/**
 * @route POST /api/auth/refresh-token
 * @desc Refresh access token
 * @access Public
 */
router.post(
  '/refresh-token',
  [
    body('refreshToken')
      .notEmpty()
      .withMessage('Refresh token is required')
      .isJWT()
      .withMessage('Refresh token must be a valid JWT'),
    validateRequest
  ],
  authController.refreshToken
);

/**
 * @route POST /api/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', protect, authController.logout);

/**
 * @route POST /api/auth/logout-all
 * @desc Logout user from all devices
 * @access Private
 */
router.post('/logout-all', protect, (req, res) => {
  // This would invalidate all refresh tokens for the user
  res.status(200).json({
    status: 'success',
    message: 'Logged out from all devices successfully'
  });
});

/**
 * @route GET /api/auth/me
 * @desc Get current user
 * @access Private
 */
router.get('/me', protect, authController.getMe);

/**
 * @route PATCH /api/auth/change-password
 * @desc Change password
 * @access Private
 */
router.patch(
  '/change-password',
  protect,
  sanitizeBody,
  [
    body('currentPassword')
      .notEmpty()
      .withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 8, max: 128 })
      .withMessage('New password must be between 8 and 128 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character')
      .custom((value, { req }) => {
        if (value === req.body.currentPassword) {
          throw new Error('New password must be different from current password');
        }
        return true;
      }),
    body('confirmNewPassword')
      .custom((value, { req }) => {
        if (value !== req.body.newPassword) {
          throw new Error('Password confirmation does not match new password');
        }
        return true;
      }),
    validateRequest
  ],
  authController.changePassword
);

/**
 * @route POST /api/auth/forgot-password
 * @desc Send password reset email
 * @access Public
 */
router.post(
  '/forgot-password',
  passwordResetLimiter, // Rate limiting for password reset requests
  sanitizeBody,
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'If an account with that email exists, we have sent a password reset link.'
    });
  }
);

