// src/routes/assignmentRoutes.ts - FIXED VERSION
import express from 'express';
import { body, param } from 'express-validator';
import assignmentController from '../controllers/assignmentController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody, parseNumbers } from '../middleware/validateRequest';
import { assignmentSubmissionLimiter } from '../middleware/rateLimitMiddleware';

const router = express.Router();

// All assignment routes require authentication
router.use(protect);

/**
 * @route GET /api/assignments/:id
 * @desc Get assignment by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Assignment ID must be a valid UUID'),
    validateRequest
  ],
  assignmentController.getAssignmentById as express.RequestHandler
);

/**
 * @route PATCH /api/assignments/:id
 * @desc Update assignment
 * @access Private (Teacher - own courses, Admin - all)
 */
router.patch(
  '/:id',
  restrictTo('teacher', 'admin'),
  sanitizeBody,
  parseNumbers(['maxPoints']),
  [
    param('id').isUUID().withMessage('Assignment ID must be a valid UUID'),
    body('title').optional().isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters').trim(),
    body('description').optional().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters').trim(),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
    body('maxPoints').optional().isInt({ min: 1, max: 1000 }).withMessage('Max points must be a positive integer between 1 and 1000'),
    validateRequest
  ],
  assignmentController.updateAssignment as express.RequestHandler
);

/**
 * @route DELETE /api/assignments/:id
 * @desc Delete assignment
 * @access Private (Teacher - own courses, Admin - all)
 */
router.delete(
  '/:id',
  restrictTo('teacher', 'admin'),
  [
    param('id').isUUID().withMessage('Assignment ID must be a valid UUID'),
    validateRequest
  ],
  assignmentController.deleteAssignment as express.RequestHandler
);

/**
 * @route POST /api/assignments/:id/submit
 * @desc Submit assignment
 * @access Private (Student)
 */
router.post(
  '/:id/submit',
  assignmentSubmissionLimiter,
  restrictTo('student'),
  sanitizeBody,
  [
    param('id').isUUID().withMessage('Assignment ID must be a valid UUID'),
    body('submissionUrl').optional().isURL().withMessage('Submission URL must be a valid URL').isLength({ max: 500 }).withMessage('Submission URL must be less than 500 characters'),
    body('submissionText').optional().isString().withMessage('Submission text must be a string').isLength({ min: 1, max: 10000 }).withMessage('Submission text must be between 1 and 10000 characters').trim(),
    body().custom((value, { req }) => {
      if (!req.body.submissionUrl && !req.body.submissionText) {
        throw new Error('Either submission URL or submission text is required');
      }
      return true;
    }),
    validateRequest
  ],
  assignmentController.submitAssignment as express.RequestHandler
);

/**
 * @route PATCH /api/assignments/submissions/:submissionId/grade
 * @desc Grade assignment submission
 * @access Private (Teacher, Admin)
 */
router.patch(
  '/submissions/:submissionId/grade',
  restrictTo('teacher', 'admin'),
  sanitizeBody,
  parseNumbers(['grade']),
  [
    param('submissionId').isUUID().withMessage('Submission ID must be a valid UUID'),
    body('grade').isInt({ min: 0 }).withMessage('Grade must be a non-negative integer'),
    body('feedback').optional().isString().withMessage('Feedback must be a string').isLength({ max: 2000 }).withMessage('Feedback must be less than 2000 characters').trim(),
    validateRequest
  ],
  assignmentController.gradeSubmission as express.RequestHandler
);

export default router;