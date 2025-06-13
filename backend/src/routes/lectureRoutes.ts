import express from 'express';
import { body, param } from 'express-validator';
import lectureController from '../controllers/lectureController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import validateRequest from '../middleware/validateRequest';

const router = express.Router();

// All lecture routes require authentication
router.use(protect);

/**
 * @swagger
 * components:
 *   schemas:
 *     Lecture:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique lecture identifier
 *         courseId:
 *           type: string
 *           format: uuid
 *           description: Course this lecture belongs to
 *         title:
 *           type: string
 *           description: Lecture title
 *         description:
 *           type: string
 *           description: Lecture description
 *         contentType:
 *           type: string
 *           enum: [video, document, quiz]
 *           description: Type of lecture content
 *         contentUrl:
 *           type: string
 *           format: uri
 *           description: URL to lecture content
 *         orderIndex:
 *           type: integer
 *           minimum: 1
 *           description: Order of lecture in course
 *         duration:
 *           type: integer
 *           minimum: 0
 *           description: Duration in seconds
 *         isPublished:
 *           type: boolean
 *           description: Whether lecture is published
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     LectureProgress:
 *       type: object
 *       properties:
 *         lectureId:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         progressSeconds:
 *           type: integer
 *           minimum: 0
 *         isCompleted:
 *           type: boolean
 *         lastAccessedAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * tags:
 *   name: Lectures
 *   description: Lecture management operations
 */

/**
 * @swagger
 * /api/lectures/{id}:
 *   get:
 *     summary: Get lecture by ID
 *     tags: [Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lecture ID
 *     responses:
 *       200:
 *         description: Lecture retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     lecture:
 *                       $ref: '#/components/schemas/Lecture'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 * @swagger
 * /api/lectures/{id}:
 *   patch:
 *     summary: Update lecture
 *     tags: [Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lecture ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 255
 *               description:
 *                 type: string
 *               contentType:
 *                 type: string
 *                 enum: [video, document, quiz]
 *               contentUrl:
 *                 type: string
 *                 format: uri
 *               orderIndex:
 *                 type: integer
 *                 minimum: 1
 *               duration:
 *                 type: integer
 *                 minimum: 0
 *     responses:
 *       200:
 *         description: Lecture updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     lecture:
 *                       $ref: '#/components/schemas/Lecture'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 * @swagger
 * /api/lectures/{id}:
 *   delete:
 *     summary: Delete lecture
 *     tags: [Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lecture ID
 *     responses:
 *       204:
 *         description: Lecture deleted successfully
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 * @swagger
 * /api/lectures/{id}/publish:
 *   patch:
 *     summary: Publish lecture
 *     tags: [Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lecture ID
 *     responses:
 *       200:
 *         description: Lecture published successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     lecture:
 *                       $ref: '#/components/schemas/Lecture'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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
 * @swagger
 * /api/lectures/{id}/progress:
 *   post:
 *     summary: Update lecture progress
 *     tags: [Lectures]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Lecture ID
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               progressSeconds:
 *                 type: integer
 *                 minimum: 0
 *                 description: Progress in seconds
 *               isCompleted:
 *                 type: boolean
 *                 description: Whether lecture is completed
 *     responses:
 *       200:
 *         description: Progress updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     progress:
 *                       $ref: '#/components/schemas/LectureProgress'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
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