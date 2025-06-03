import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import db from '../db';
import AppError from '../utils/appError';
import logger from '../utils/logger';
import vnpayService, { VNPayPaymentData, VNPayReturnData } from '../services/vnpayService';
import config from '../config';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

interface PaymentRow {
  id: string;
  user_id: string;
  course_id: string;
  order_id: string;
  amount: number;
  currency: string;
  payment_method: string;
  payment_status: string;
  transaction_id?: string;
  payment_date?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface CourseRow {
  id: string;
  title: string;
  price: number;
  status: string;
  teacher_id: string;
  [key: string]: any;
}

/**
 * Create payment for course enrollment
 * @route POST /api/payments/create
 */
export const createPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId, bankCode } = req.body;
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    if (!config.payment.enabled) {
      return next(new AppError('Payment service is currently disabled', 503));
    }

    // Check if course exists and is published
    const courseResult = await db.query<CourseRow>(
      'SELECT * FROM courses WHERE id = $1 AND status = $2',
      [courseId, 'published']
    );

    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found or not available for purchase', 404));
    }

    const course = courseResult.rows[0];

    // Check if user is already enrolled
    const enrollmentResult = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (enrollmentResult.rows.length > 0) {
      return next(new AppError('You are already enrolled in this course', 400));
    }

    // Check if there's already a pending payment for this course
    const pendingPaymentResult = await db.query<PaymentRow>(
      'SELECT * FROM payments WHERE user_id = $1 AND course_id = $2 AND payment_status = $3',
      [userId, courseId, 'pending']
    );

    if (pendingPaymentResult.rows.length > 0) {
      return next(new AppError('There is already a pending payment for this course', 400));
    }

    // Generate unique order ID
    const orderId = `ORDER_${Date.now()}_${userId.slice(-8)}`;
    
    // Create payment record
    const paymentResult = await db.query<PaymentRow>(
      `INSERT INTO payments (id, user_id, course_id, order_id, amount, currency, payment_method, payment_status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [uuidv4(), userId, courseId, orderId, course.price, config.payment.currency, 'vnpay', 'pending']
    );

    const payment = paymentResult.rows[0];

    // Create VNPay payment URL
    const paymentData: VNPayPaymentData = {
      orderId,
      amount: course.price,
      orderDescription: `Thanh toan khoa hoc: ${course.title}`,
      orderType: 'billpayment',
      ipAddress,
      bankCode,
      locale: config.payment.locale
    };

    const paymentUrl = vnpayService.createPaymentUrl(paymentData);

    logger.info('Payment created', {
      paymentId: payment.id,
      orderId,
      courseId,
      userId,
      amount: course.price
    });

    res.status(201).json({
      status: 'success',
      data: {
        payment: {
          id: payment.id,
          orderId,
          amount: course.price,
          currency: config.payment.currency,
          paymentUrl
        }
      }
    });
  } catch (error) {
    logger.error('Create payment error:', error);
    next(error);
  }
};

/**
 * Handle VNPay return callback
 * @route GET /api/payments/vnpay-return
 */
export const handleVNPayReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const returnData = req.query as unknown as VNPayReturnData;

    // Verify the return data
    const isValid = vnpayService.verifyReturnUrl(returnData);

    if (!isValid) {
      logger.error('Invalid VNPay return signature', { returnData });
      return next(new AppError('Invalid payment verification', 400));
    }

    const orderId = returnData.vnp_TxnRef;
    const responseCode = returnData.vnp_ResponseCode;
    const transactionId = returnData.vnp_TransactionNo;
    const amount = parseInt(returnData.vnp_Amount) / 100; // Convert from VND cents
    const payDate = returnData.vnp_PayDate;

    // Find payment record
    const paymentResult = await db.query<PaymentRow>(
      'SELECT * FROM payments WHERE order_id = $1',
      [orderId]
    );

    if (paymentResult.rows.length === 0) {
      return next(new AppError('Payment not found', 404));
    }

    const payment = paymentResult.rows[0];
    let paymentStatus = 'failed';
    let enrollmentCreated = false;

    if (responseCode === '00') {
      // Payment successful
      paymentStatus = 'completed';

      // Create enrollment
      try {
        await db.query(
          'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2)',
          [payment.user_id, payment.course_id]
        );
        enrollmentCreated = true;

        logger.info('Course enrollment created after successful payment', {
          paymentId: payment.id,
          userId: payment.user_id,
          courseId: payment.course_id
        });
      } catch (enrollmentError) {
        logger.error('Failed to create enrollment after payment:', enrollmentError);
        // Payment was successful but enrollment failed - need manual intervention
        paymentStatus = 'completed_enrollment_failed';
      }
    } else {
      logger.info('Payment failed', {
        orderId,
        responseCode,
        message: vnpayService.getResponseCodeMessage(responseCode)
      });
    }

    // Update payment record
    await db.query(
      `UPDATE payments 
       SET payment_status = $1, 
           transaction_id = $2, 
           payment_date = $3,
           vnpay_response_code = $4,
           updated_at = NOW()
       WHERE id = $5`,
      [paymentStatus, transactionId, payDate, responseCode, payment.id]
    );

    logger.info('Payment processed', {
      paymentId: payment.id,
      orderId,
      status: paymentStatus,
      enrollmentCreated
    });

    res.status(200).json({
      status: 'success',
      data: {
        payment: {
          id: payment.id,
          orderId,
          status: paymentStatus,
          amount,
          transactionId,
          enrollmentCreated,
          message: vnpayService.getResponseCodeMessage(responseCode)
        }
      }
    });
  } catch (error) {
    logger.error('VNPay return handler error:', error);
    next(error);
  }
};

/**
 * Get payment history for user
 * @route GET /api/payments
 */
export const getPaymentHistory = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = '1', limit = '10', status } = req.query;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE p.user_id = $1';
    const params: any[] = [userId, limitNum, offset];
    let paramCount = 1;

    if (status) {
      paramCount++;
      whereClause += ` AND p.payment_status = ${paramCount}`;
      params.splice(1, 0, status);
    }

    const query = `
      SELECT p.*, 
             c.title as course_title,
             c.thumbnail_url as course_thumbnail
      FROM payments p
      JOIN courses c ON p.course_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
      LIMIT ${paramCount + 1} OFFSET ${paramCount + 2}
    `;

    const result = await db.query<PaymentRow>(query, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM payments p ${whereClause}`;
    const countParams = params.slice(0, paramCount);
    const countResult = await db.query<{ count: string }>(countQuery, countParams);
    const totalPayments = parseInt(countResult.rows[0]?.count || '0');

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      totalPages: Math.ceil(totalPayments / limitNum),
      currentPage: pageNum,
      data: {
        payments: result.rows
      }
    });
  } catch (error) {
    logger.error('Get payment history error:', error);
    next(error);
  }
};

/**
 * Get payment details by ID
 * @route GET /api/payments/:id
 */
export const getPaymentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const result = await db.query<PaymentRow>(
      `SELECT p.*, 
              c.title as course_title,
              c.description as course_description,
              c.thumbnail_url as course_thumbnail,
              u.first_name,
              u.last_name,
              u.email
       FROM payments p
       JOIN courses c ON p.course_id = c.id
       JOIN users u ON p.user_id = u.id
       WHERE p.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Payment not found', 404));
    }

    const payment = result.rows[0];

    // Check permission - users can only view their own payments, admins can view all
    if (req.user?.role !== 'admin' && payment.user_id !== userId) {
      return next(new AppError('You do not have permission to view this payment', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        payment
      }
    });
  } catch (error) {
    logger.error('Get payment by ID error:', error);
    next(error);
  }
};

/**
 * Query payment status from VNPay
 * @route POST /api/payments/:id/query
 */
export const queryPaymentStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const ipAddress = req.ip || req.connection.remoteAddress || '127.0.0.1';

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Find payment record
    const paymentResult = await db.query<PaymentRow>(
      'SELECT * FROM payments WHERE id = $1',
      [id]
    );

    if (paymentResult.rows.length === 0) {
      return next(new AppError('Payment not found', 404));
    }

    const payment = paymentResult.rows[0];

    // Check permission
    if (req.user?.role !== 'admin' && payment.user_id !== userId) {
      return next(new AppError('You do not have permission to query this payment', 403));
    }

    // Query VNPay for payment status
    const queryResult = await vnpayService.queryPayment({
      orderId: payment.order_id,
      transDate: moment(payment.created_at).format('YYYYMMDDHHmmss'),
      ipAddress
    });

    logger.info('Payment status queried', {
      paymentId: payment.id,
      orderId: payment.order_id,
      queryResult
    });

    res.status(200).json({
      status: 'success',
      data: {
        payment: {
          id: payment.id,
          orderId: payment.order_id,
          currentStatus: payment.payment_status,
          queryResult
        }
      }
    });
  } catch (error) {
    logger.error('Query payment status error:', error);
    next(error);
  }
};

/**
 * Get payment statistics (Admin only)
 * @route GET /api/payments/stats
 */
export const getPaymentStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user?.role !== 'admin') {
      return next(new AppError('Only admins can view payment statistics', 403));
    }

    // Get overall statistics
    const statsResult = await db.query<{
      total_payments: string;
      successful_payments: string;
      failed_payments: string;
      pending_payments: string;
      total_revenue: string;
      average_payment: string;
    }>(
      `SELECT 
         COUNT(*) as total_payments,
         COUNT(CASE WHEN payment_status = 'completed' THEN 1 END) as successful_payments,
         COUNT(CASE WHEN payment_status = 'failed' THEN 1 END) as failed_payments,
         COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_payments,
         SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as total_revenue,
         AVG(CASE WHEN payment_status = 'completed' THEN amount END) as average_payment
       FROM payments`
    );

    // Get payment trends (last 30 days)
    const trendsResult = await db.query<{
      date: string;
      payment_count: string;
      revenue: string;
    }>(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as payment_count,
         SUM(CASE WHEN payment_status = 'completed' THEN amount ELSE 0 END) as revenue
       FROM payments 
       WHERE created_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(created_at)
       ORDER BY date`
    );

    // Get top courses by revenue
    const topCoursesResult = await db.query<{
      course_id: string;
      course_title: string;
      payment_count: string;
      total_revenue: string;
    }>(
      `SELECT 
         p.course_id,
         c.title as course_title,
         COUNT(p.id) as payment_count,
         SUM(p.amount) as total_revenue
       FROM payments p
       JOIN courses c ON p.course_id = c.id
       WHERE p.payment_status = 'completed'
       GROUP BY p.course_id, c.title
       ORDER BY total_revenue DESC
       LIMIT 10`
    );

    const stats = statsResult.rows[0];

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalPayments: parseInt(stats.total_payments || '0'),
          successfulPayments: parseInt(stats.successful_payments || '0'),
          failedPayments: parseInt(stats.failed_payments || '0'),
          pendingPayments: parseInt(stats.pending_payments || '0'),
          totalRevenue: parseFloat(stats.total_revenue || '0'),
          averagePayment: parseFloat(stats.average_payment || '0')
        },
        trends: trendsResult.rows.map(row => ({
          date: row.date,
          paymentCount: parseInt(row.payment_count),
          revenue: parseFloat(row.revenue)
        })),
        topCourses: topCoursesResult.rows.map(row => ({
          courseId: row.course_id,
          courseTitle: row.course_title,
          paymentCount: parseInt(row.payment_count),
          totalRevenue: parseFloat(row.total_revenue)
        }))
      }
    });
  } catch (error) {
    logger.error('Get payment stats error:', error);
    next(error);
  }
};

/**
 * Get available payment methods
 * @route GET /api/payments/methods
 */
export const getPaymentMethods = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const methods = vnpayService.getPaymentMethods();

    res.status(200).json({
      status: 'success',
      data: {
        methods,
        currency: config.payment.currency,
        enabled: config.payment.enabled
      }
    });
  } catch (error) {
    logger.error('Get payment methods error:', error);
    next(error);
  }
};

export default {
  createPayment,
  handleVNPayReturn,
  getPaymentHistory,
  getPaymentById,
  queryPaymentStatus,
  getPaymentStats,
  getPaymentMethods
};