import express from 'express';
import { body, param, query } from 'express-validator';
import couponController from '../controllers/couponController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody, parseNumbers, parseBooleans } from '../middleware/validateRequest';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Coupon:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         code:
 *           type: string
 *           description: Unique coupon code
 *         name:
 *           type: string
 *           description: Coupon display name
 *         description:
 *           type: string
 *           description: Coupon description
 *         discountType:
 *           type: string
 *           enum: [percentage, fixed]
 *           description: Type of discount
 *         discountValue:
 *           type: number
 *           description: Discount value (percentage or fixed amount)
 *         minimumAmount:
 *           type: number
 *           description: Minimum order amount required
 *         maximumDiscount:
 *           type: number
 *           description: Maximum discount amount for percentage coupons
 *         usageLimit:
 *           type: number
 *           description: Maximum number of times coupon can be used
 *         usedCount:
 *           type: number
 *           description: Number of times coupon has been used
 *         validFrom:
 *           type: string
 *           format: date-time
 *           description: Coupon valid from date
 *         validUntil:
 *           type: string
 *           format: date-time
 *           description: Coupon valid until date
 *         isActive:
 *           type: boolean
 *           description: Whether coupon is active
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     CouponValidation:
 *       type: object
 *       properties:
 *         coupon:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *             code:
 *               type: string
 *             name:
 *               type: string
 *             discountType:
 *               type: string
 *             discountValue:
 *               type: number
 *         calculation:
 *           type: object
 *           properties:
 *             originalAmount:
 *               type: number
 *             discountAmount:
 *               type: number
 *             finalAmount:
 *               type: number
 *             savings:
 *               type: number
 *             savingsPercentage:
 *               type: number
 * 
 *     CouponStats:
 *       type: object
 *       properties:
 *         summary:
 *           type: object
 *           properties:
 *             totalCoupons:
 *               type: number
 *             activeCoupons:
 *               type: number
 *             expiredCoupons:
 *               type: number
 *             upcomingCoupons:
 *               type: number
 *             totalUsage:
 *               type: number
 *             totalDiscountGiven:
 *               type: number
 */

// All coupon routes require authentication
router.use(protect);

/**
 * @swagger
 * /api/coupons/validate:
 *   post:
 *     summary: Validate a coupon code and calculate discount
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - amount
 *             properties:
 *               code:
 *                 type: string
 *                 example: "SAVE20"
 *                 description: Coupon code to validate
 *               amount:
 *                 type: number
 *                 example: 100000
 *                 description: Order amount in VND
 *     responses:
 *       200:
 *         description: Coupon validation successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/CouponValidation'
 *       400:
 *         description: Invalid coupon or validation failed
 *       401:
 *         $ref: '#/components/responses/UnauthorizedError'
 */
router.post(
  '/validate',
  sanitizeBody,
  parseNumbers(['amount']),
  [
    body('code')
      .notEmpty()
      .withMessage('Coupon code is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Coupon code must be between 3 and 50 characters')
      .trim()
      .toUpperCase(),
    body('amount')
      .isFloat({ min: 0 })
      .withMessage('Amount must be a positive number'),
    validateRequest
  ],
  couponController.validateCoupon
);

/**
 * @swagger
 * /api/coupons/stats:
 *   get:
 *     summary: Get coupon statistics (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: period
 *         schema:
 *           type: integer
 *           default: 30
 *           minimum: 1
 *           maximum: 365
 *         description: Number of days for trend analysis
 *     responses:
 *       200:
 *         description: Coupon statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/CouponStats'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/stats',
  restrictTo('admin'),
  [
    query('period')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('Period must be between 1 and 365 days'),
    validateRequest
  ],
  couponController.getCouponStats
);

/**
 * @swagger
 * /api/coupons/bulk-update:
 *   patch:
 *     summary: Bulk update coupon status (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - couponIds
 *               - action
 *             properties:
 *               couponIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 minItems: 1
 *                 maxItems: 50
 *                 example: ["123e4567-e89b-12d3-a456-426614174000"]
 *               action:
 *                 type: string
 *                 enum: [activate, deactivate, delete]
 *                 example: "activate"
 *     responses:
 *       200:
 *         description: Bulk update completed successfully
 *       400:
 *         description: Invalid request data
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.patch(
  '/bulk-update',
  restrictTo('admin'),
  sanitizeBody,
  [
    body('couponIds')
      .isArray({ min: 1, max: 50 })
      .withMessage('Coupon IDs must be an array with 1-50 items'),
    body('couponIds.*')
      .isUUID()
      .withMessage('Each coupon ID must be a valid UUID'),
    body('action')
      .isIn(['activate', 'deactivate', 'delete'])
      .withMessage('Action must be activate, deactivate, or delete'),
    validateRequest
  ],
  couponController.bulkUpdateCoupons
);

/**
 * @swagger
 * /api/coupons:
 *   get:
 *     summary: Get all coupons with filtering and pagination (Admin only)
 *     tags: [Coupons]
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
 *           enum: [active, expired, inactive, upcoming]
 *         description: Filter by coupon status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *           minLength: 2
 *           maxLength: 100
 *         description: Search by code or name
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [code, name, created_at, valid_from, valid_until, used_count]
 *           default: created_at
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Coupons retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     coupons:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Coupon'
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *   post:
 *     summary: Create a new coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *               - name
 *               - discountType
 *               - discountValue
 *               - validFrom
 *               - validUntil
 *             properties:
 *               code:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 pattern: '^[A-Z0-9]+$'
 *                 example: "SAVE20"
 *                 description: Unique coupon code (uppercase letters and numbers only)
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *                 example: "20% Off All Courses"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 example: "Get 20% discount on all courses"
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *                 example: "percentage"
 *               discountValue:
 *                 type: number
 *                 minimum: 0.01
 *                 example: 20
 *                 description: Percentage (1-100) or fixed amount in VND
 *               minimumAmount:
 *                 type: number
 *                 minimum: 0
 *                 default: 0
 *                 example: 50000
 *                 description: Minimum order amount in VND
 *               maximumDiscount:
 *                 type: number
 *                 minimum: 0
 *                 example: 100000
 *                 description: Maximum discount amount for percentage coupons
 *               usageLimit:
 *                 type: integer
 *                 minimum: 1
 *                 example: 100
 *                 description: Maximum number of uses
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-01-01T00:00:00Z"
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T23:59:59Z"
 *     responses:
 *       201:
 *         description: Coupon created successfully
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
 *                     coupon:
 *                       $ref: '#/components/schemas/Coupon'
 *       400:
 *         description: Validation error or coupon code already exists
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 */
router.get(
  '/',
  restrictTo('admin'),
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
      .isIn(['active', 'expired', 'inactive', 'upcoming'])
      .withMessage('Status must be active, expired, inactive, or upcoming'),
    query('search')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters')
      .trim(),
    query('sortBy')
      .optional()
      .isIn(['code', 'name', 'created_at', 'valid_from', 'valid_until', 'used_count'])
      .withMessage('Sort by must be one of: code, name, created_at, valid_from, valid_until, used_count'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    validateRequest
  ],
  couponController.getAllCoupons
);

router.post(
  '/',
  restrictTo('admin'),
  sanitizeBody,
  parseNumbers(['discountValue', 'minimumAmount', 'maximumDiscount', 'usageLimit']),
  [
    body('code')
      .notEmpty()
      .withMessage('Coupon code is required')
      .isLength({ min: 3, max: 50 })
      .withMessage('Coupon code must be between 3 and 50 characters')
      .matches(/^[A-Z0-9]+$/)
      .withMessage('Coupon code must contain only uppercase letters and numbers')
      .trim(),
    body('name')
      .notEmpty()
      .withMessage('Coupon name is required')
      .isLength({ min: 3, max: 100 })
      .withMessage('Coupon name must be between 3 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
      .trim(),
    body('discountType')
      .isIn(['percentage', 'fixed'])
      .withMessage('Discount type must be percentage or fixed'),
    body('discountValue')
      .isFloat({ min: 0.01 })
      .withMessage('Discount value must be greater than 0')
      .custom((value, { req }) => {
        if (req.body.discountType === 'percentage' && (value <= 0 || value > 100)) {
          throw new Error('Percentage discount must be between 0.01 and 100');
        }
        return true;
      }),
    body('minimumAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum amount must be a non-negative number'),
    body('maximumDiscount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum discount must be a non-negative number')
      .custom((value, { req }) => {
        if (req.body.discountType === 'fixed' && value) {
          throw new Error('Maximum discount is only applicable for percentage coupons');
        }
        return true;
      }),
    body('usageLimit')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Usage limit must be a positive integer'),
    body('validFrom')
      .isISO8601()
      .withMessage('Valid from must be a valid ISO 8601 date'),
    body('validUntil')
      .isISO8601()
      .withMessage('Valid until must be a valid ISO 8601 date')
      .custom((value, { req }) => {
        const validFrom = new Date(req.body.validFrom);
        const validUntil = new Date(value);
        if (validUntil <= validFrom) {
          throw new Error('Valid until date must be after valid from date');
        }
        return true;
      }),
    validateRequest
  ],
  couponController.createCoupon
);

/**
 * @swagger
 * /api/coupons/{id}:
 *   get:
 *     summary: Get coupon by ID with detailed statistics
 *     tags: [Coupons]
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
 *         description: Coupon details retrieved successfully
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
 *                     coupon:
 *                       allOf:
 *                         - $ref: '#/components/schemas/Coupon'
 *                         - type: object
 *                           properties:
 *                             usageStats:
 *                               type: object
 *                               properties:
 *                                 totalUsed:
 *                                   type: number
 *                                 totalDiscountGiven:
 *                                   type: number
 *                                 uniqueUsers:
 *                                   type: number
 *                                 averageDiscount:
 *                                   type: number
 *                                 usageRate:
 *                                   type: number
 *                             usageTrend:
 *                               type: array
 *                               items:
 *                                 type: object
 *                                 properties:
 *                                   date:
 *                                     type: string
 *                                   usageCount:
 *                                     type: number
 *                                   discountAmount:
 *                                     type: number
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   patch:
 *     summary: Update coupon (Admin only)
 *     tags: [Coupons]
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
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               discountType:
 *                 type: string
 *                 enum: [percentage, fixed]
 *               discountValue:
 *                 type: number
 *                 minimum: 0.01
 *               minimumAmount:
 *                 type: number
 *                 minimum: 0
 *               maximumDiscount:
 *                 type: number
 *                 minimum: 0
 *               usageLimit:
 *                 type: integer
 *                 minimum: 1
 *               validFrom:
 *                 type: string
 *                 format: date-time
 *               validUntil:
 *                 type: string
 *                 format: date-time
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Coupon updated successfully
 *       400:
 *         description: Validation error or cannot modify used coupon
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 *   delete:
 *     summary: Delete or deactivate coupon (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: force
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Force delete even if coupon has usage history
 *     responses:
 *       200:
 *         description: Coupon deactivated (has usage history)
 *       204:
 *         description: Coupon deleted permanently
 *       400:
 *         description: Cannot delete coupon with usage history without force flag
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id',
  restrictTo('admin'),
  [
    param('id').isUUID().withMessage('Coupon ID must be a valid UUID'),
    validateRequest
  ],
  couponController.getCouponById
);

router.patch(
  '/:id',
  restrictTo('admin'),
  sanitizeBody,
  parseNumbers(['discountValue', 'minimumAmount', 'maximumDiscount', 'usageLimit']),
  parseBooleans(['isActive']),
  [
    param('id').isUUID().withMessage('Coupon ID must be a valid UUID'),
    body('name')
      .optional()
      .isLength({ min: 3, max: 100 })
      .withMessage('Coupon name must be between 3 and 100 characters')
      .trim(),
    body('description')
      .optional()
      .isString()
      .withMessage('Description must be a string')
      .isLength({ max: 500 })
      .withMessage('Description must be less than 500 characters')
      .trim(),
    body('discountType')
      .optional()
      .isIn(['percentage', 'fixed'])
      .withMessage('Discount type must be percentage or fixed'),
    body('discountValue')
      .optional()
      .isFloat({ min: 0.01 })
      .withMessage('Discount value must be greater than 0')
      .custom((value, { req }) => {
        if (req.body.discountType === 'percentage' && value && (value <= 0 || value > 100)) {
          throw new Error('Percentage discount must be between 0.01 and 100');
        }
        return true;
      }),
    body('minimumAmount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Minimum amount must be a non-negative number'),
    body('maximumDiscount')
      .optional()
      .isFloat({ min: 0 })
      .withMessage('Maximum discount must be a non-negative number'),
    body('usageLimit')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Usage limit must be a positive integer'),
    body('validFrom')
      .optional()
      .isISO8601()
      .withMessage('Valid from must be a valid ISO 8601 date'),
    body('validUntil')
      .optional()
      .isISO8601()
      .withMessage('Valid until must be a valid ISO 8601 date'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('Is active must be a boolean'),
    validateRequest
  ],
  couponController.updateCoupon
);

router.delete(
  '/:id',
  restrictTo('admin'),
  [
    param('id').isUUID().withMessage('Coupon ID must be a valid UUID'),
    query('force')
      .optional()
      .isBoolean()
      .withMessage('Force parameter must be a boolean'),
    validateRequest
  ],
  couponController.deleteCoupon
);

/**
 * @swagger
 * /api/coupons/{id}/usage:
 *   get:
 *     summary: Get coupon usage history with detailed information (Admin only)
 *     tags: [Coupons]
 *     security:
 *       - bearerAuth: []
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
 *           maximum: 100
 *           default: 10
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [used_at, discount_amount, first_name, payment_amount]
 *           default: used_at
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *     responses:
 *       200:
 *         description: Coupon usage history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                 results:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 currentPage:
 *                   type: integer
 *                 totalItems:
 *                   type: integer
 *                 data:
 *                   type: object
 *                   properties:
 *                     usage:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           discountAmount:
 *                             type: number
 *                           usedAt:
 *                             type: string
 *                             format: date-time
 *                           firstName:
 *                             type: string
 *                           lastName:
 *                             type: string
 *                           email:
 *                             type: string
 *                           orderId:
 *                             type: string
 *                           paymentAmount:
 *                             type: number
 *                           courseTitle:
 *                             type: string
 *       403:
 *         $ref: '#/components/responses/ForbiddenError'
 *       404:
 *         $ref: '#/components/responses/NotFoundError'
 */
router.get(
  '/:id/usage',
  restrictTo('admin'),
  [
    param('id').isUUID().withMessage('Coupon ID must be a valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('sortBy')
      .optional()
      .isIn(['used_at', 'discount_amount', 'first_name', 'payment_amount'])
      .withMessage('Sort by must be one of: used_at, discount_amount, first_name, payment_amount'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    validateRequest
  ],
  couponController.getCouponUsage
);

export default router;