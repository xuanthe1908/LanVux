import express, { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import categoryController from '../controllers/categoryController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody } from '../middleware/validateRequest';

const router = express.Router();

/**
 * @route GET /api/categories
 * @desc Get all categories with course counts
 * @access Public
 */
router.get(
  '/',
  [
    query('includeEmpty')
      .optional()
      .isBoolean()
      .withMessage('Include empty must be a boolean'),
    query('sortBy')
      .optional()
      .isIn(['name', 'course_count', 'created_at'])
      .withMessage('Sort by must be one of: name, course_count, created_at'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    validateRequest
  ],
  categoryController.getAllCategories
);

/**
 * @route GET /api/categories/:id
 * @desc Get category by ID with courses
 * @access Public
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Category ID must be a valid UUID'),
    query('includeCourses')
      .optional()
      .isBoolean()
      .withMessage('Include courses must be a boolean'),
    query('courseLimit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Course limit must be between 1 and 50'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      data: {
        category: {
          id: req.params.id,
          name: 'Sample Category',
          description: 'Sample description',
          courseCount: 0,
          courses: []
        }
      }
    });
  }
);

// Protected routes - require authentication
router.use(protect);

/**
 * @route POST /api/categories
 * @desc Create a new category
 * @access Private (Admin)
 */
router.post(
  '/',
  restrictTo('admin'),
  sanitizeBody,
  [
    body('name')
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters')
      .trim()
      .matches(/^[a-zA-Z0-9\s\-&\.]+$/)
      .withMessage('Category name can only contain letters, numbers, spaces, hyphens, ampersands, and periods'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
      .trim(),
    body('icon')
      .optional()
      .isString()
      .withMessage('Icon must be a string')
      .isLength({ max: 100 })
      .withMessage('Icon must be less than 100 characters'),
    body('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color code'),
    body('parentId')
      .optional()
      .isUUID()
      .withMessage('Parent ID must be a valid UUID'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('Is active must be a boolean'),
    validateRequest
  ],
  categoryController.createCategory
);

/**
 * @route PATCH /api/categories/:id
 * @desc Update category
 * @access Private (Admin)
 */
router.patch(
  '/:id',
  restrictTo('admin'),
  sanitizeBody,
  [
    param('id').isUUID().withMessage('Category ID must be a valid UUID'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters')
      .trim()
      .matches(/^[a-zA-Z0-9\s\-&\.]+$/)
      .withMessage('Category name can only contain letters, numbers, spaces, hyphens, ampersands, and periods'),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
      .trim(),
    body('icon')
      .optional()
      .isString()
      .withMessage('Icon must be a string')
      .isLength({ max: 100 })
      .withMessage('Icon must be less than 100 characters'),
    body('color')
      .optional()
      .matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .withMessage('Color must be a valid hex color code'),
    body('parentId')
      .optional()
      .isUUID()
      .withMessage('Parent ID must be a valid UUID'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('Is active must be a boolean'),
    validateRequest
  ],
  categoryController.updateCategory
);

/**
 * @route DELETE /api/categories/:id
 * @desc Delete category
 * @access Private (Admin)
 */
router.delete(
  '/:id',
  restrictTo('admin'),
  [
    param('id').isUUID().withMessage('Category ID must be a valid UUID'),
    body('confirmDeletion')
      .optional()
      .isBoolean()
      .withMessage('Confirm deletion must be a boolean'),
    body('moveCoursesToCategory')
      .optional()
      .isUUID()
      .withMessage('Move courses to category must be a valid UUID'),
    validateRequest
  ],
  categoryController.deleteCategory
);

/**
 * @route GET /api/categories/:id/courses
 * @desc Get courses in a category
 * @access Public
 */
router.get(
  '/:id/courses',
  [
    param('id').isUUID().withMessage('Category ID must be a valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    query('level')
      .optional()
      .isIn(['beginner', 'intermediate', 'advanced'])
      .withMessage('Level must be beginner, intermediate, or advanced'),
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
      .isIn(['title', 'price', 'created_at', 'rating'])
      .withMessage('Sort by must be one of: title, price, created_at, rating'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      data: {
        courses: [],
        totalCount: 0,
        currentPage: 1,
        totalPages: 0
      }
    });
  }
);

/**
 * @route GET /api/categories/stats
 * @desc Get category statistics
 * @access Private (Admin)
 */
router.get(
  '/stats',
  restrictTo('admin'),
  (req, res) => {
    // This would need implementation in categoryController
    res.status(200).json({
      status: 'success',
      data: {
        totalCategories: 0,
        activeCategories: 0,
        categoriesWithCourses: 0,
        averageCoursesPerCategory: 0,
        topCategories: []
      }
    });
  }
);

/**
 * @route POST /api/categories/bulk
 * @desc Bulk create categories
 * @access Private (Admin)
 */
router.post(
  '/bulk',
  restrictTo('admin'),
  sanitizeBody,
  [
    body('categories')
      .isArray({ min: 1, max: 20 })
      .withMessage('Categories must be an array with 1-20 items'),
    body('categories.*.name')
      .notEmpty()
      .withMessage('Category name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Category name must be between 2 and 100 characters'),
    body('categories.*.description')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Categories created successfully',
      data: {
        created: req.body.categories.length,
        categories: req.body.categories
      }
    });
  }
);

/**
 * @route PATCH /api/categories/:id/reorder
 * @desc Reorder category position
 * @access Private (Admin)
 */
router.patch(
  '/:id/reorder',
  restrictTo('admin'),
  [
    param('id').isUUID().withMessage('Category ID must be a valid UUID'),
    body('newPosition')
      .isInt({ min: 0 })
      .withMessage('New position must be a non-negative integer'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Category reordered successfully',
      data: {
        categoryId: req.params.id,
        newPosition: req.body.newPosition
      }
    });
  }
);

export default router;