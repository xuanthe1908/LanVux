// src/routes/enrollmentRoutes.ts - FIXED VERSION
import express from 'express';
import { param, query } from 'express-validator';
import enrollmentController from '../controllers/enrollmentController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import validateRequest from '../middleware/validateRequest';

const router = express.Router();

// All enrollment routes require authentication
router.use(protect);

/**
 * @route GET /api/enrollments
 * @desc Get user's enrollments
 * @access Private (Student)
 */
router.get(
  '/',
  restrictTo('student'),
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('status').optional().isIn(['completed', 'in_progress', 'not_started']).withMessage('Status must be completed, in_progress, or not_started'),
    validateRequest
  ],
  enrollmentController.getUserEnrollments as express.RequestHandler
);

/**
 * @route GET /api/enrollments/stats
 * @desc Get enrollment statistics
 * @access Private (Teacher, Admin)
 */
router.get(
  '/stats',
  restrictTo('teacher', 'admin'),
  enrollmentController.getEnrollmentStats as express.RequestHandler
);

/**
 * @route POST /api/enrollments/:courseId
 * @desc Enroll in a course
 * @access Private (Student)
 */
router.post(
  '/:courseId',
  restrictTo('student'),
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  enrollmentController.enrollInCourse as express.RequestHandler
);

/**
 * @route GET /api/enrollments/:enrollmentId
 * @desc Get enrollment details
 * @access Private
 */
router.get(
  '/:enrollmentId',
  [
    param('enrollmentId').isUUID().withMessage('Enrollment ID must be a valid UUID'),
    validateRequest
  ],
  enrollmentController.getEnrollmentById as express.RequestHandler
);

/**
 * @route DELETE /api/enrollments/:enrollmentId
 * @desc Unenroll from course
 * @access Private (Student - own enrollments, Admin - all)
 */
router.delete(
  '/:enrollmentId',
  [
    param('enrollmentId').isUUID().withMessage('Enrollment ID must be a valid UUID'),
    validateRequest
  ],
  enrollmentController.unenrollFromCourse as express.RequestHandler
);

export default router;