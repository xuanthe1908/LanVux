// src/routes/courseRoutes.ts - FIXED VERSION
import express from 'express';
import { body, query, param } from 'express-validator';
import courseController from '../controllers/courseController';
import lectureController from '../controllers/lectureController';
import assignmentController from '../controllers/assignmentController';
import enrollmentController from '../controllers/enrollmentController';
import { protect, restrictTo, optionalAuth } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody, parseNumbers } from '../middleware/validateRequest';
import { courseCreationLimiter } from '../middleware/rateLimitMiddleware';

const router = express.Router();

/**
 * @route GET /api/courses
 * @desc Get all courses with filters
 * @access Public
 */
router.get(
  '/',
  optionalAuth,
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isString().trim().isLength({ min: 1, max: 100 }).withMessage('Category must be a string between 1 and 100 characters'),
    query('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level must be beginner, intermediate, or advanced'),
    query('search').optional().isString().trim().isLength({ min: 1, max: 200 }).withMessage('Search query must be between 1 and 200 characters'),
    query('teacher').optional().isUUID().withMessage('Teacher must be a valid UUID'),
    validateRequest
  ],
  courseController.getAllCourses as express.RequestHandler
);

/**
 * @route GET /api/courses/:id
 * @desc Get course by ID
 * @access Public
 */
router.get(
  '/:id',
  optionalAuth,
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  courseController.getCourseById as express.RequestHandler
);

// Protected routes
router.use(protect);

/**
 * @route POST /api/courses
 * @desc Create a new course
 * @access Private (Teacher, Admin)
 */
router.post(
  '/',
  courseCreationLimiter,
  restrictTo('teacher', 'admin'),
  sanitizeBody,
  parseNumbers(['price']),
  [
    body('title').notEmpty().withMessage('Title is required').isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters').trim(),
    body('description').notEmpty().withMessage('Description is required').isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters').trim(),
    body('thumbnailUrl').optional().isURL().withMessage('Thumbnail URL must be a valid URL'),
    body('price').isFloat({ min: 0, max: 999999 }).withMessage('Price must be a non-negative number less than 1,000,000'),
    body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level must be beginner, intermediate, or advanced'),
    body('category').notEmpty().withMessage('Category is required').isLength({ min: 2, max: 100 }).withMessage('Category must be between 2 and 100 characters').trim(),
    body('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID'),
    validateRequest
  ],
  courseController.createCourse as express.RequestHandler
);

/**
 * @route PATCH /api/courses/:id
 * @desc Update course
 * @access Private (Teacher - own courses, Admin - all)
 */
router.patch(
  '/:id',
  sanitizeBody,
  parseNumbers(['price']),
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    body('title').optional().isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters').trim(),
    body('description').optional().isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters').trim(),
    body('thumbnailUrl').optional().isURL().withMessage('Thumbnail URL must be a valid URL'),
    body('price').optional().isFloat({ min: 0, max: 999999 }).withMessage('Price must be a non-negative number'),
    body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level must be beginner, intermediate, or advanced'),
    body('category').optional().isLength({ min: 2, max: 100 }).withMessage('Category must be between 2 and 100 characters').trim(),
    body('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID'),
    validateRequest
  ],
  courseController.updateCourse as express.RequestHandler
);

/**
 * @route DELETE /api/courses/:id
 * @desc Delete course
 * @access Private (Teacher - own courses, Admin - all)
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  courseController.deleteCourse as express.RequestHandler
);

/**
 * @route PATCH /api/courses/:id/publish
 * @desc Publish course
 * @access Private (Teacher - own courses, Admin - all)
 */
router.patch(
  '/:id/publish',
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  courseController.publishCourse as express.RequestHandler
);

// Nested routes
/**
 * @route GET /api/courses/:courseId/lectures
 * @desc Get lectures for a course
 * @access Private
 */
router.get(
  '/:courseId/lectures',
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  lectureController.getLecturesByCourse as express.RequestHandler
);

/**
 * @route POST /api/courses/:courseId/lectures
 * @desc Create a new lecture
 * @access Private (Teacher, Admin)
 */
router.post(
  '/:courseId/lectures',
  restrictTo('teacher', 'admin'),
  sanitizeBody,
  parseNumbers(['orderIndex', 'duration']),
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    body('title').notEmpty().withMessage('Title is required').isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters').trim(),
    body('description').optional().isLength({ max: 2000 }).withMessage('Description must be less than 2000 characters').trim(),
    body('contentType').isIn(['video', 'document', 'quiz']).withMessage('Content type must be video, document, or quiz'),
    body('contentUrl').optional().isURL().withMessage('Content URL must be a valid URL'),
    body('orderIndex').isInt({ min: 1, max: 1000 }).withMessage('Order index must be a positive integer between 1 and 1000'),
    body('duration').optional().isInt({ min: 0, max: 86400 }).withMessage('Duration must be between 0 and 86400 seconds'),
    validateRequest
  ],
  lectureController.createLecture as express.RequestHandler
);

/**
 * @route GET /api/courses/:courseId/assignments
 * @desc Get assignments for a course
 * @access Private
 */
router.get(
  '/:courseId/assignments',
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  assignmentController.getAssignmentsByCourse as express.RequestHandler
);

/**
 * @route POST /api/courses/:courseId/assignments
 * @desc Create a new assignment
 * @access Private (Teacher, Admin)
 */
router.post(
  '/:courseId/assignments',
  restrictTo('teacher', 'admin'),
  sanitizeBody,
  parseNumbers(['maxPoints']),
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    body('title').notEmpty().withMessage('Title is required').isLength({ min: 3, max: 255 }).withMessage('Title must be between 3 and 255 characters').trim(),
    body('description').notEmpty().withMessage('Description is required').isLength({ min: 10, max: 5000 }).withMessage('Description must be between 10 and 5000 characters').trim(),
    body('dueDate').optional().isISO8601().withMessage('Due date must be a valid ISO 8601 date'),
    body('maxPoints').isInt({ min: 1, max: 1000 }).withMessage('Max points must be a positive integer between 1 and 1000'),
    validateRequest
  ],
  assignmentController.createAssignment as express.RequestHandler
);

/**
 * @route GET /api/courses/:courseId/enrollments
 * @desc Get course enrollments
 * @access Private (Teacher - own courses, Admin - all)
 */
router.get(
  '/:courseId/enrollments',
  restrictTo('teacher', 'admin'),
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    validateRequest
  ],
  enrollmentController.getCourseEnrollments as express.RequestHandler
);

export default router;