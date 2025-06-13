// backend/src/routes/courseRoutes.ts - FIXED COMPLETE VERSION
import express from 'express';
import { body, query, param } from 'express-validator';
import courseController from '../controllers/courseController';
import lectureController from '../controllers/lectureController';
import assignmentController from '../controllers/assignmentController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import validateRequest from '../middleware/validateRequest';
import db from '../db';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Course:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Unique course identifier
 *         title:
 *           type: string
 *           description: Course title
 *           example: "Complete JavaScript Course"
 *         description:
 *           type: string
 *           description: Course description
 *           example: "Learn JavaScript from basics to advanced"
 *         thumbnailUrl:
 *           type: string
 *           format: uri
 *           description: Course thumbnail image URL
 *         teacherId:
 *           type: string
 *           format: uuid
 *           description: Teacher's user ID
 *         price:
 *           type: number
 *           description: Course price in VND
 *           example: 299000
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           description: Course status
 *         level:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *           description: Course difficulty level
 *         category:
 *           type: string
 *           description: Course category name
 *         categoryId:
 *           type: string
 *           format: uuid
 *           description: Category ID
 *         enrollmentCount:
 *           type: number
 *           description: Number of enrolled students
 *         averageRating:
 *           type: number
 *           description: Average course rating
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         teacher:
 *           type: object
 *           properties:
 *             firstName:
 *               type: string
 *             lastName:
 *               type: string
 *             email:
 *               type: string
 * 
 *     CourseStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             totalCourses:
 *               type: number
 *             publishedCourses:
 *               type: number
 *             draftCourses:
 *               type: number
 *             totalEnrollments:
 *               type: number
 *             totalRevenue:
 *               type: number
 *         trends:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *               enrollments:
 *                 type: number
 *               revenue:
 *                 type: number
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Course management operations
 */

/**
 * @swagger
 * /api/courses:
 *   get:
 *     summary: Get all courses with filtering and pagination
 *     tags: [Courses]
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
 *         description: Number of courses per page
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: level
 *         schema:
 *           type: string
 *           enum: [beginner, intermediate, advanced]
 *         description: Filter by difficulty level
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 2
 *         description: Search in title and description
 *       - in: query
 *         name: teacher
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by teacher ID
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           minimum: 0
 *         description: Maximum price filter
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [title, price, created_at, enrollment_count, rating]
 *           default: created_at
 *         description: Sort field
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Courses retrieved successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     courses:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Course'
 *   post:
 *     summary: Create a new course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - price
 *               - level
 *               - category
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: "Complete JavaScript Course"
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *                 example: "Learn JavaScript from basics to advanced concepts"
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *                 example: "https://example.com/thumbnail.jpg"
 *               price:
 *                 type: number
 *                 minimum: 0
 *                 example: 299000
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *                 example: "beginner"
 *               category:
 *                 type: string
 *                 example: "Programming"
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Course created successfully
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
 *                     course:
 *                       $ref: '#/components/schemas/Course'
 *       400:
 *         $ref: '#/components/responses/ValidationError'
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('category')
      .optional()
      .isString()
      .trim()
      .withMessage('Category must be a string'),
    query('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Level must be beginner, intermediate, or advanced'),
    query('search')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search must be between 2 and 100 characters'),
    query('teacher')
      .optional()
      .isUUID()
      .withMessage('Teacher must be a valid UUID'),
    query('minPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum price must be a non-negative number'),
    query('maxPrice')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum price must be a non-negative number'),
    query('sortBy')
      .optional()
      .isIn(['title', 'price', 'created_at', 'enrollment_count', 'rating'])
      .withMessage('Sort by must be one of: title, price, created_at, enrollment_count, rating'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    validateRequest
  ],
  courseController.getAllCourses
);

router.post(
  '/',
  protect,
  restrictTo('teacher', 'admin'),
  [
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('Title must be between 3 and 255 characters')
      .trim(),
    body('description')
      .optional()
      .isString()
      .isLength({ max: 2000 })
      .withMessage('Description must be less than 2000 characters')
      .trim(),
    body('contentType')
      .isIn(['video', 'document', 'quiz'])
      .withMessage('Content type must be video, document, or quiz'),
    body('contentUrl')
      .optional()
      .isURL()
      .withMessage('Content URL must be a valid URL'),
    body('orderIndex')
      .isInt({ min: 1 })
      .withMessage('Order index must be a positive integer'),
    body('duration')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Duration must be a non-negative integer'),
    validateRequest
  ],
  lectureController.createLecture
);

/**
 * @swagger
 * /api/courses/{courseId}/assignments:
 *   get:
 *     summary: Get assignments for a course
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: courseId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Assignments retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   post:
 *     summary: Create a new assignment for course
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *               - title
 *               - description
 *               - maxPoints
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *               dueDate:
 *                 type: string
 *                 format: date-time
 *               maxPoints:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 1000
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       403:
 *         description: Only course owner or admin can create assignments
 */
router.get(
  '/:courseId/assignments',
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  assignmentController.getAssignmentsByCourse
);

router.post(
  '/:courseId/assignments',
  protect,
  restrictTo('teacher', 'admin'),
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('Title must be between 3 and 255 characters')
      .trim(),
    body('description')
      .notEmpty()
      .withMessage('Description is required')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Description must be between 10 and 5000 characters')
      .trim(),
    body('dueDate')
      .optional()
      .isISO8601()
      .withMessage('Due date must be a valid ISO 8601 date'),
    body('maxPoints')
      .isInt({ min: 1, max: 1000 })
      .withMessage('Max points must be between 1 and 1000'),
    validateRequest
  ],
  assignmentController.createAssignment
);

/**
 * @swagger
 * /api/courses/{courseId}/enrollments:
 *   get:
 *     summary: Get enrollments for a course (Teacher/Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: courseId
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
 *           default: 10
 *     responses:
 *       200:
 *         description: Course enrollments retrieved successfully
 *       403:
 *         description: Only course owner or admin can view enrollments
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:courseId/enrollments',
  protect,
  restrictTo('teacher', 'admin'),
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    validateRequest
  ],
  async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
      const { courseId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      
      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);
      
      const enrollments = await db.query(
        `SELECT e.*, u.first_name, u.last_name, u.email 
         FROM enrollments e
         JOIN users u ON e.user_id = u.id
         WHERE e.course_id = ?
         ORDER BY e.enrolled_at DESC
         LIMIT ? OFFSET ?`,
        [courseId, parseInt(limit as string), offset]
      );

      const totalResult = await db.query(
        'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?',
        [courseId]
      );
      
      const total = parseInt(totalResult.rows[0]?.count || '0');

      res.status(200).json({
        status: 'success',
        results: enrollments.rows.length,
        totalPages: Math.ceil(total / parseInt(limit as string)),
        currentPage: parseInt(page as string),
        data: {
          enrollments: enrollments.rows
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @swagger
 * /api/courses/{id}/reviews:
 *   get:
 *     summary: Get reviews for a course
 *     tags: [Courses]
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
 *           maximum: 50
 *           default: 10
 *       - in: query
 *         name: rating
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         description: Filter by rating
 *     responses:
 *       200:
 *         description: Course reviews retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id/reviews',
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('rating')
      .optional()
      .isInt({ min: 1, max: 5 })
      .withMessage('Rating must be between 1 and 5'),
    validateRequest
  ],
  courseController.getCourseReviews
);

/**
 * @swagger
 * /api/courses/{id}/status:
 *   patch:
 *     summary: Update course status (Admin only)
 *     tags: [Courses]
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived, suspended]
 *               reason:
 *                 type: string
 *                 description: Reason for status change
 *     responses:
 *       200:
 *         description: Course status updated successfully
 *       403:
 *         description: Only administrators can update course status
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:id/status',
  protect,
  restrictTo('admin'),
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    body('status')
      .isIn(['draft', 'published', 'archived', 'suspended'])
      .withMessage('Status must be draft, published, archived, or suspended'),
    body('reason')
      .optional()
      .isString()
      .trim()
      .isLength({ max: 1000 })
      .withMessage('Reason must be less than 1000 characters'),
    validateRequest
  ],
  courseController.updateCourseStatus
);

/**
 * @swagger
 * /api/courses/bulk:
 *   patch:
 *     summary: Bulk update courses (Admin only)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseIds
 *               - action
 *             properties:
 *               courseIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 50
 *               action:
 *                 type: string
 *                 enum: [publish, archive, change_category]
 *               value:
 *                 type: string
 *                 description: Required for change_category action
 *     responses:
 *       200:
 *         description: Bulk update completed successfully
 *       400:
 *         description: Invalid request parameters
 *       403:
 *         description: Only administrators can perform bulk operations
 */
router.patch(
  '/bulk',
  protect,
  restrictTo('admin'),
  [
    body('courseIds')
      .isArray({ min: 1, max: 50 })
      .withMessage('Course IDs must be an array with 1-50 items'),
    body('courseIds.*')
      .isUUID()
      .withMessage('Each course ID must be a valid UUID'),
    body('action')
      .isIn(['publish', 'archive', 'change_category'])
      .withMessage('Action must be publish, archive, or change_category'),
    body('value')
      .if(body('action').equals('change_category'))
      .notEmpty()
      .withMessage('Value is required for change_category action')
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category value must be between 2 and 100 characters'),
    validateRequest
  ],
  courseController.bulkUpdateCourses
);

// Error handling middleware for course routes
router.use((error: any, req: any, res: any, next: any) => {
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: error.details
    });
  }
  
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      status: 'error',
      message: 'Duplicate entry detected',
      error: 'A course with this title already exists'
    });
  }
  
  next(error);
});

export default router;
      