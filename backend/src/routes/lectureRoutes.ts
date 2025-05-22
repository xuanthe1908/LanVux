// src/routes/lectureRoutes.ts - FIXED VERSION
import express from 'express';
import { body, param } from 'express-validator';
import lectureController from '../controllers/lectureController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import validateRequest from '../middleware/validateRequest';

const router = express.Router();

// All lecture routes require authentication
router.use(protect);

/**
 * @route GET /api/lectures/:id
 * @desc Get lecture by ID
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Lecture ID must be a valid UUID'),
    validateRequest
  ],
  lectureController.getLectureById as express.RequestHandler
);

/**
 * @route PATCH /api/lectures/:id
 * @desc Update lecture
 * @access Private (Teacher - own courses, Admin - all)
 */
router.patch(
  '/:id',
  [
    param('id').isUUID().withMessage('Lecture ID must be a valid UUID'),
    body('title').optional().isLength({ max: 255 }).withMessage('Title must be less than 255 characters'),
    body('description').optional().isString().withMessage('Description must be a string'),
    body('contentType').optional().isIn(['video', 'document', 'quiz']).withMessage('Content type must be video, document, or quiz'),
    body('contentUrl').optional().isURL().withMessage('Content URL must be a valid URL'),
    body('orderIndex').optional().isInt({ min: 1 }).withMessage('Order index must be a positive integer'),
    body('duration').optional().isInt({ min: 0 }).withMessage('Duration must be a non-negative integer'),
    validateRequest
  ],
  lectureController.updateLecture as express.RequestHandler
);

/**
 * @route DELETE /api/lectures/:id
 * @desc Delete lecture
 * @access Private (Teacher - own courses, Admin - all)
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Lecture ID must be a valid UUID'),
    validateRequest
  ],
  lectureController.deleteLecture as express.RequestHandler
);

/**
 * @route PATCH /api/lectures/:id/publish
 * @desc Publish lecture
 * @access Private (Teacher - own courses, Admin - all)
 */
router.patch(
  '/:id/publish',
  [
    param('id').isUUID().withMessage('Lecture ID must be a valid UUID'),
    validateRequest
  ],
  lectureController.publishLecture as express.RequestHandler
);

/**
 * @route POST /api/lectures/:id/progress
 * @desc Update lecture progress
 * @access Private (Student)
 */
router.post(
  '/:id/progress',
  restrictTo('student'),
  [
    param('id').isUUID().withMessage('Lecture ID must be a valid UUID'),
    body('progressSeconds').optional().isInt({ min: 0 }).withMessage('Progress seconds must be a non-negative integer'),
    body('isCompleted').optional().isBoolean().withMessage('Is completed must be a boolean'),
    validateRequest
  ],
  lectureController.updateLectureProgress as express.RequestHandler
);

export default router;