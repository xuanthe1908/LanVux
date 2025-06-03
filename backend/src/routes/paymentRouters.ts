import express from 'express';
import { body, param, query } from 'express-validator';
import paymentController from '../controllers/paymentController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody } from '../middleware/validateRequest';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Payment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         userId:
 *           type: string
 *           format: uuid
 *         courseId:
 *           type: string
 *           format: uuid
 *         orderId:
 *           type: string
 *         amount:
 *           type: number
 *         currency:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         paymentStatus:
 *           type: string
 *           enum: [pending, completed, failed, cancelled, refunded]
 *         transactionId:
 *           type: string
 *         paymentDate:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 * 
 *     PaymentMethods:
 *       type: object
 *       properties:
 *         code:
 *           type: string
 *         name:
 *           type: string
 * 
 *     PaymentStats:
 *       type: object
 *       properties:
 *         totalPayments:
 *           type: number
 *         successfulPayments:
 *           type: number
 *         failedPayments:
 *           type: number
 *         pendingPayments:
 *           type: number
 *         totalRevenue:
 *           type: number
 *         averagePayment:
 *           type: number
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/payments/methods:
 *   get:
 *     summary: Get available payment methods
 *     tags: [Payments]
 *     responses:
 *       200:
 *         description: List of available payment methods
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
 *                     methods:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/PaymentMethods'
 *                     currency:
 *                       type: string
 *                     enabled:
 *                       type: boolean
 */
router.get(
  '/methods',
  paymentController.getPaymentMethods
);

/**
 * @swagger
 * /api/payments/vnpay-return:
 *   get:
 *     summary: Handle VNPay payment return callback
 *     tags: [Payments]
 *     parameters:
 *       - in: query
 *         name: vnp_Amount
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_BankCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_ResponseCode
 *         schema:
 *           type: string
 *       - in: query
 *         name: vnp_TxnRef
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment processing result
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
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         orderId:
 *                           type: string
 *                         status:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         enrollmentCreated:
 *                           type: boolean
 */
router.get(
  '/vnpay-return',
  paymentController.handleVNPayReturn
);

// Protected routes - require authentication
router.use(protect);

/**
 * @swagger
 * /api/payments/create:
 *   post:
 *     summary: Create a new payment for course enrollment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - courseId
 *             properties:
 *               courseId:
 *                 type: string
 *                 format: uuid
 *               bankCode:
 *                 type: string
 *                 description: Optional bank code for direct bank payment
 *     responses:
 *       201:
 *         description: Payment created successfully
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
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         orderId:
 *                           type: string
 *                         amount:
 *                           type: number
 *                         currency:
 *                           type: string
 *                         paymentUrl:
 *                           type: string
 *       400:
 *         description: Bad request (already enrolled, pending payment exists)
 *       404:
 *         description: Course not found
 */
router.post(
  '/create',
  sanitizeBody,
  [
    body('courseId')
      .isUUID()
      .withMessage('Course ID must be a valid UUID'),
    body('bankCode')
      .optional()
      .isString()
      .isLength({ min: 2, max: 20 })
      .withMessage('Bank code must be between 2 and 20 characters'),
    validateRequest
  ],
  paymentController.createPayment
);

/**
 * @swagger
 * /api/payments:
 *   get:
 *     summary: Get payment history for the authenticated user
 *     tags: [Payments]
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
 *           enum: [pending, completed, failed, cancelled, refunded]
 *     responses:
 *       200:
 *         description: Payment history retrieved successfully
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
 *                 data:
 *                   type: object
 *                   properties:
 *                     payments:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Payment'
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
    query('status')
      .optional()
      .isIn(['pending', 'completed', 'failed', 'cancelled', 'refunded'])
      .withMessage('Status must be one of: pending, completed, failed, cancelled, refunded'),
    validateRequest
  ],
  paymentController.getPaymentHistory
);

/**
 * @swagger
 * /api/payments/stats:
 *   get:
 *     summary: Get payment statistics (Admin only)
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment statistics retrieved successfully
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
 *                     summary:
 *                       $ref: '#/components/schemas/PaymentStats'
 *                     trends:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                           paymentCount:
 *                             type: number
 *                           revenue:
 *                             type: number
 *                     topCourses:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           courseId:
 *                             type: string
 *                           courseTitle:
 *                             type: string
 *                           paymentCount:
 *                             type: number
 *                           totalRevenue:
 *                             type: number
 *       403:
 *         description: Access denied - Admin only
 */
router.get(
  '/stats',
  restrictTo('admin'),
  paymentController.getPaymentStats
);

/**
 * @swagger
 * /api/payments/{id}:
 *   get:
 *     summary: Get payment details by ID
 *     tags: [Payments]
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
 *         description: Payment details retrieved successfully
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
 *                     payment:
 *                       $ref: '#/components/schemas/Payment'
 *       403:
 *         description: Access denied
 *       404:
 *         description: Payment not found
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Payment ID must be a valid UUID'),
    validateRequest
  ],
  paymentController.getPaymentById
);

/**
 * @swagger
 * /api/payments/{id}/query:
 *   post:
 *     summary: Query payment status from VNPay
 *     tags: [Payments]
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
 *         description: Payment status queried successfully
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
 *                     payment:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                         orderId:
 *                           type: string
 *                         currentStatus:
 *                           type: string
 *                         queryResult:
 *                           type: object
 *       403:
 *         description: Access denied
 *       404:
 *         description: Payment not found
 */
router.post(
  '/:id/query',
  [
    param('id').isUUID().withMessage('Payment ID must be a valid UUID'),
    validateRequest
  ],
  paymentController.queryPaymentStatus
);

export default router;