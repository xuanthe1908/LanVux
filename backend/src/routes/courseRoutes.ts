// backend/src/routes/courseRoutes.ts - COMPLETE VERSION WITH SWAGGER
import express from 'express';
import { body, query, param } from 'express-validator';
import courseController from '../controllers/courseController';
import lectureController from '../controllers/lectureController';
import assignmentController from '../controllers/assignmentController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody, parseNumbers, parseBooleans } from '../middleware/validateRequest';
import { courseCreationLimiter } from '../middleware/rateLimitMiddleware';

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
  courseCreationLimiter,
  sanitizeBody,
  parseNumbers(['price']),
  [
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
import { Request, Response, NextFunction } from 'express';

interface CourseEnrollmentsRequest extends Request {
  params: {
    courseId: string;
  };
  query: {
    page?: string;
    limit?: string;
  };
}

router.get(
  '/:courseId/enrollments',
  protect,
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
  async (req: CourseEnrollmentsRequest, res: Response, next: NextFunction): Promise<void> => {
    // Import enrollment controller function
    const enrollmentController = require('../controllers/enrollmentController').default;
    enrollmentController.getCourseEnrollments(req, res, next);
  }
);

export default router;({ min: 10, max: 5000 })
      .withMessage('Description must be between 10 and 5000 characters')
      .trim(),
    body('thumbnailUrl')
      .optional()
      .isURL()
      .withMessage('Thumbnail URL must be a valid URL')
      .isLength({ max: 500 })
      .withMessage('Thumbnail URL must be less than 500 characters'),
    body('price')
      .isFloat({ min: 0 })
      .withMessage('Price must be a non-negative number'),
    body('level')
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Level must be beginner, intermediate, or advanced'),
    body('category')
      .notEmpty()
      .withMessage('Category is required')
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category must be between 2 and 100 characters'),
    body('categoryId')
      .optional()
      .isUUID()
      .withMessage('Category ID must be a valid UUID'),
    validateRequest
  ],
  courseController.createCourse
);

/**
 * @swagger
 * /api/courses/stats:
 *   get:
 *     summary: Get course statistics
 *     tags: [Courses]
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
 *     responses:
 *       200:
 *         description: Course statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CourseStats'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/stats',
  protect,
  restrictTo('teacher', 'admin'),
  [
    query('period')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Period must be between 1 and 365 days'),
    validateRequest
  ],
  courseController.getCourseStats
);

/**
 * @swagger
 * /api/courses/my-courses:
 *   get:
 *     summary: Get current user's courses (for teachers)
 *     tags: [Courses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *     responses:
 *       200:
 *         description: User's courses retrieved successfully
 *       403:
 *         description: Only teachers can access this endpoint
 */
router.get(
  '/my-courses',
  protect,
  restrictTo('teacher'),
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('status')
      .optional()
      .isIn(['draft', 'published', 'archived'])
      .withMessage('Status must be draft, published, or archived'),
    validateRequest
  ],
  courseController.getMyCourses
);

/**
 * @swagger
 * /api/courses/{id}:
 *   get:
 *     summary: Get course by ID
 *     tags: [Courses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Course ID
 *     responses:
 *       200:
 *         description: Course details retrieved successfully
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
 *                       allOf:
 *                         - $ref: '#/components/schemas/Course'
 *                         - type: object
 *                           properties:
 *                             lectures:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   id:
 *                                     type: string
 *                                   title:
 *                                     type: string
 *                                   orderIndex:
 *                                     type: number
 *                                   duration:
 *                                     type: number
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   patch:
 *     summary: Update course
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
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 minLength: 10
 *                 maxLength: 5000
 *               thumbnailUrl:
 *                 type: string
 *                 format: uri
 *               price:
 *                 type: number
 *                 minimum: 0
 *               level:
 *                 type: string
 *                 enum: [beginner, intermediate, advanced]
 *               category:
 *                 type: string
 *               categoryId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Course updated successfully
 *       403:
 *         description: Only course owner or admin can update
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete course
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
 *     responses:
 *       204:
 *         description: Course deleted successfully
 *       403:
 *         description: Only course owner or admin can delete
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  courseController.getCourseById
);

router.patch(
  '/:id',
  protect,
  sanitizeBody,
  parseNumbers(['price']),
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    body('title')
      .optional()
      .isLength({ min: 3, max: 255 })
      .withMessage('Title must be between 3 and 255 characters')
      .trim(),
    body('description')
      .optional()
      .isLength({ min: 10, max: 5000 })
      .withMessage('Description must be between 10 and 5000 characters')
      .trim(),
    body('thumbnailUrl')
      .optional()
      .isURL()
      .withMessage('Thumbnail URL must be a valid URL')
      .isLength({ max: 500 })
      .withMessage('Thumbnail URL must be less than 500 characters'),
    body('price')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Price must be a non-negative number'),
    body('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Level must be beginner, intermediate, or advanced'),
    body('category')
      .optional()
      .isString()
      .trim()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category must be between 2 and 100 characters'),
    body('categoryId')
      .optional()
      .isUUID()
      .withMessage('Category ID must be a valid UUID'),
    validateRequest
  ],
  courseController.updateCourse
);

router.delete(
  '/:id',
  protect,
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  courseController.deleteCourse
);

/**
 * @swagger
 * /api/courses/{id}/publish:
 *   patch:
 *     summary: Publish course
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
 *     responses:
 *       200:
 *         description: Course published successfully
 *       403:
 *         description: Only course owner or admin can publish
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:id/publish',
  protect,
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  courseController.publishCourse
);

/**
 * @swagger
 * /api/courses/{id}/archive:
 *   patch:
 *     summary: Archive course
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
 *     responses:
 *       200:
 *         description: Course archived successfully
 *       403:
 *         description: Only course owner or admin can archive
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.patch(
  '/:id/archive',
  protect,
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  courseController.archiveCourse
);

/**
 * @swagger
 * /api/courses/{id}/duplicate:
 *   post:
 *     summary: Duplicate course
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
 *               - newTitle
 *             properties:
 *               newTitle:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *                 example: "Copy of Complete JavaScript Course"
 *               includeLectures:
 *                 type: boolean
 *                 default: true
 *               includeAssignments:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Course duplicated successfully
 *       403:
 *         description: Only course owner or admin can duplicate
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.post(
  '/:id/duplicate',
  protect,
  restrictTo('teacher', 'admin'),
  sanitizeBody,
  parseBooleans(['includeLectures', 'includeAssignments']),
  [
    param('id').isUUID().withMessage('Course ID must be a valid UUID'),
    body('newTitle')
      .notEmpty()
      .withMessage('New title is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('New title must be between 3 and 255 characters')
      .trim(),
    body('includeLectures')
      .optional()
      .isBoolean()
      .withMessage('Include lectures must be a boolean'),
    body('includeAssignments')
      .optional()
      .isBoolean()
      .withMessage('Include assignments must be a boolean'),
    validateRequest
  ],
  courseController.duplicateCourse
);

// ===== LECTURE ROUTES FOR COURSES =====

/**
 * @swagger
 * /api/courses/{courseId}/lectures:
 *   get:
 *     summary: Get lectures for a course
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
 *         description: Lectures retrieved successfully
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   post:
 *     summary: Create a new lecture for course
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
 *               - contentType
 *               - orderIndex
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 255
 *               description:
 *                 type: string
 *                 maxLength: 2000
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
 *       201:
 *         description: Lecture created successfully
 *       403:
 *         description: Only course owner or admin can create lectures
 */
router.get(
  '/:courseId/lectures',
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
    validateRequest
  ],
  lectureController.getLecturesByCourse
);

router.post(
  '/:courseId/lectures',
  protect,
  sanitizeBody,
  parseNumbers(['orderIndex', 'duration']),
  [
    param('courseId').isUUID().withMessage('Course ID must be a valid UUID'),
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

// ===== ASSIGNMENT ROUTES FOR COURSES =====

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
  sanitizeBody,
  parseNumbers(['maxPoints']),
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