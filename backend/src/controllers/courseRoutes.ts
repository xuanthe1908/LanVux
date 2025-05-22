import express from 'express';
import { body, query, param } from 'express-validator';
import courseController from '../controllers/courseController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import validateRequest from '../middleware/validateRequest';

const router = express.Router();

/**
 * @route GET /api/courses
 * @desc Get all courses with filters
 * @access Public
 */
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('category').optional().isString().withMessage('Category must be a string'),
    query('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level must be beginner, intermediate, or advanced'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('teacher').optional().isUUID().withMessage('Teacher must be a valid UUID'),
    validateRequest
  ],
  courseController.getAllCourses
);

/**
 * @route GET /api/courses/:id
 * @desc Get course by ID
 * @access Public
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  courseController.getCourseById
);

// Protected routes - require authentication
router.use(protect);

/**
 * @route POST /api/courses
 * @desc Create a new course
 * @access Private (Teacher, Admin)
 */
router.post(
  '/',
  restrictTo('teacher', 'admin'),
  [
    body('title').notEmpty().withMessage('Title is required').isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
    body('description').notEmpty().withMessage('Description is required'),
    body('thumbnailUrl').optional().isURL().withMessage('Thumbnail URL must be a valid URL'),
    body('price').isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('level').isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level must be beginner, intermediate, or advanced'),
    body('category').notEmpty().withMessage('Category is required'),
    body('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID'),
    validateRequest
  ],
  courseController.createCourse
);

/**
 * @route PATCH /api/courses/:id
 * @desc Update course
 * @access Private (Teacher - own courses, Admin - all)
 */
router.patch(
  '/:id',
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    body('title').optional().isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('thumbnailUrl').optional().isURL().withMessage('Thumbnail URL must be a valid URL'),
    body('price').optional().isFloat({ min: 0 }).withMessage('Price must be a non-negative number'),
    body('level').optional().isIn(['beginner', 'intermediate', 'advanced']).withMessage('Level must be beginner, intermediate, or advanced'),
    body('category').optional().isString().withMessage('Category must be a string'),
    body('categoryId').optional().isUUID().withMessage('Category ID must be a valid UUID'),
    validateRequest
  ],
  courseController.updateCourse
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
  courseController.deleteCourse
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
  courseController.publishCourse
);

export default router;