import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import moment from 'moment';
import db from '../db';
import AppError from '../utils/appError';
import logger from '../utils/logger';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

interface CouponRow {
  id: string;
  code: string;
  name: string;
  description?: string;
  discount_type: 'percentage' | 'fixed';
  discount_value: number;
  minimum_amount: number;
  maximum_discount?: number;
  usage_limit?: number;
  used_count: number;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface CouponUsageRow {
  id: string;
  coupon_id: string;
  user_id: string;
  payment_id?: string;
  discount_amount: number;
  used_at: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  order_id?: string;
  payment_amount?: number;
  course_title?: string;
  [key: string]: any;
}

/**
 * Create a new coupon (Admin only)
 * @route POST /api/coupons
 */
export const createCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumAmount = 0,
      maximumDiscount,
      usageLimit,
      validFrom,
      validUntil
    } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if coupon code already exists
    const existingCoupon = await db.query<CouponRow>(
      'SELECT * FROM coupons WHERE UPPER(code) = UPPER($1)',
      [code]
    );

    if (existingCoupon.rows.length > 0) {
      return next(new AppError('Coupon code already exists', 400));
    }

    // Validate dates
    const validFromDate = moment(validFrom);
    const validUntilDate = moment(validUntil);

    if (!validFromDate.isValid() || !validUntilDate.isValid()) {
      return next(new AppError('Invalid date format', 400));
    }

    if (validUntilDate.isBefore(validFromDate)) {
      return next(new AppError('Valid until date must be after valid from date', 400));
    }

    if (validFromDate.isBefore(moment().startOf('day'))) {
      return next(new AppError('Valid from date cannot be in the past', 400));
    }

    // Validate discount value based on type
    if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
      return next(new AppError('Percentage discount must be between 0 and 100', 400));
    }

    if (discountType === 'fixed' && discountValue <= 0) {
      return next(new AppError('Fixed discount must be greater than 0', 400));
    }

    const result = await db.query<CouponRow>(
      `INSERT INTO coupons (
        id, code, name, description, discount_type, discount_value, 
        minimum_amount, maximum_discount, usage_limit, valid_from, 
        valid_until, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) 
      RETURNING *`,
      [
        uuidv4(),
        code.toUpperCase(),
        name,
        description,
        discountType,
        discountValue,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        validFrom,
        validUntil,
        userId
      ]
    );

    const coupon = result.rows[0];

    logger.info('Coupon created successfully', {
      couponId: coupon.id,
      code: coupon.code,
      createdBy: userId
    });

    res.status(201).json({
      status: 'success',
      data: {
        coupon
      }
    });
  } catch (error) {
    logger.error('Create coupon error:', error);
    next(error);
  }
};

/**
 * Get all coupons with filtering and pagination (Admin only)
 * @route GET /api/coupons
 */
export const getAllCoupons = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10', status, search, sortBy = 'created_at', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [limitNum, offset];
    let paramCount = 2;

    // Status filter
    if (status === 'active') {
      whereClause += ' AND c.is_active = true AND c.valid_until > NOW()';
    } else if (status === 'expired') {
      whereClause += ' AND c.valid_until <= NOW()';
    } else if (status === 'inactive') {
      whereClause += ' AND c.is_active = false';
    } else if (status === 'upcoming') {
      whereClause += ' AND c.valid_from > NOW() AND c.is_active = true';
    }

    // Search filter
    if (search) {
      paramCount++;
      whereClause += ` AND (UPPER(c.code) LIKE UPPER($${paramCount}) OR UPPER(c.name) LIKE UPPER($${paramCount}))`;
      params.push(`%${search}%`);
    }

    // Validate and set sorting
    const allowedSortFields = ['code', 'name', 'created_at', 'valid_from', 'valid_until', 'used_count'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const query = `
      SELECT c.*, 
             u.first_name as created_by_name,
             u.last_name as created_by_last_name,
             CASE 
               WHEN c.valid_until <= NOW() THEN 'expired'
               WHEN c.valid_from > NOW() THEN 'upcoming'
               WHEN c.is_active = false THEN 'inactive'
               ELSE 'active'
             END as current_status
      FROM coupons c
      LEFT JOIN users u ON c.created_by = u.id
      ${whereClause}
      ORDER BY c.${sortField} ${sortDirection}
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query<CouponRow>(query, params);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) FROM coupons c ${whereClause}`;
    const countParams = params.slice(2);
    const countResult = await db.query<{ count: string }>(countQuery, countParams);
    const totalCoupons = parseInt(countResult.rows[0]?.count || '0');

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      totalPages: Math.ceil(totalCoupons / limitNum),
      currentPage: pageNum,
      totalItems: totalCoupons,
      data: {
        coupons: result.rows
      }
    });
  } catch (error) {
    logger.error('Get all coupons error:', error);
    next(error);
  }
};

/**
 * Validate and get coupon details
 * @route POST /api/coupons/validate
 */
export const validateCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { code, amount } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    if (!code || !amount) {
      return next(new AppError('Coupon code and amount are required', 400));
    }

    // Find coupon
    const couponResult = await db.query<CouponRow>(
      'SELECT * FROM coupons WHERE UPPER(code) = UPPER($1) AND is_active = true',
      [code]
    );

    if (couponResult.rows.length === 0) {
      return next(new AppError('Invalid or inactive coupon code', 400));
    }

    const coupon = couponResult.rows[0];

    // Check if coupon is still valid (time range)
    const now = moment();
    const validFrom = moment(coupon.valid_from);
    const validUntil = moment(coupon.valid_until);

    if (now.isBefore(validFrom)) {
      return next(new AppError('Coupon is not yet valid', 400));
    }

    if (now.isAfter(validUntil)) {
      return next(new AppError('Coupon has expired', 400));
    }

    // Check usage limit
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return next(new AppError('Coupon usage limit exceeded', 400));
    }

    // Check minimum amount requirement
    if (amount < coupon.minimum_amount) {
      return next(new AppError(`Minimum order amount is ${coupon.minimum_amount.toLocaleString()} VNĐ`, 400));
    }

    // Check if user already used this coupon
    const usageResult = await db.query<CouponUsageRow>(
      'SELECT * FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2',
      [coupon.id, userId]
    );

    if (usageResult.rows.length > 0) {
      return next(new AppError('You have already used this coupon', 400));
    }

    // Calculate discount amount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.floor((amount * coupon.discount_value) / 100);
      // Apply maximum discount limit if specified
      if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
        discountAmount = coupon.maximum_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed order amount
    if (discountAmount > amount) {
      discountAmount = amount;
    }

    const finalAmount = amount - discountAmount;

    res.status(200).json({
      status: 'success',
      data: {
        coupon: {
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discount_type,
          discountValue: coupon.discount_value
        },
        calculation: {
          originalAmount: amount,
          discountAmount,
          finalAmount,
          savings: discountAmount,
          savingsPercentage: Math.round((discountAmount / amount) * 100)
        }
      }
    });
  } catch (error) {
    logger.error('Validate coupon error:', error);
    next(error);
  }
};

/**
 * Get coupon by ID with detailed statistics
 * @route GET /api/coupons/:id
 */
export const getCouponById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query<CouponRow>(
      `SELECT c.*, 
              u.first_name as created_by_name,
              u.last_name as created_by_last_name,
              CASE 
                WHEN c.valid_until <= NOW() THEN 'expired'
                WHEN c.valid_from > NOW() THEN 'upcoming'
                WHEN c.is_active = false THEN 'inactive'
                ELSE 'active'
              END as current_status
       FROM coupons c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Coupon not found', 404));
    }

    const coupon = result.rows[0];

    // Get detailed usage statistics
    const usageStatsResult = await db.query<{
      total_used: string;
      total_discount_given: string;
      unique_users: string;
      avg_discount: string;
      last_used: string;
    }>(
      `SELECT 
         COUNT(*) as total_used,
         COALESCE(SUM(discount_amount), 0) as total_discount_given,
         COUNT(DISTINCT user_id) as unique_users,
         COALESCE(AVG(discount_amount), 0) as avg_discount,
         MAX(used_at) as last_used
       FROM coupon_usage 
       WHERE coupon_id = $1`,
      [id]
    );

    const usageStats = usageStatsResult.rows[0];

    // Get usage trend (last 30 days)
    const trendResult = await db.query<{
      date: string;
      usage_count: string;
      discount_amount: string;
    }>(
      `SELECT 
         DATE(used_at) as date,
         COUNT(*) as usage_count,
         SUM(discount_amount) as discount_amount
       FROM coupon_usage 
       WHERE coupon_id = $1 AND used_at >= NOW() - INTERVAL '30 days'
       GROUP BY DATE(used_at)
       ORDER BY date`,
      [id]
    );

    const couponWithStats = {
      ...coupon,
      usageStats: {
        totalUsed: parseInt(usageStats.total_used || '0'),
        totalDiscountGiven: parseFloat(usageStats.total_discount_given || '0'),
        uniqueUsers: parseInt(usageStats.unique_users || '0'),
        averageDiscount: parseFloat(usageStats.avg_discount || '0'),
        lastUsed: usageStats.last_used,
        usageRate: coupon.usage_limit ? 
          Math.round((parseInt(usageStats.total_used || '0') / coupon.usage_limit) * 100) : 
          null
      },
      usageTrend: trendResult.rows.map(row => ({
        date: row.date,
        usageCount: parseInt(row.usage_count),
        discountAmount: parseFloat(row.discount_amount)
      }))
    };

    res.status(200).json({
      status: 'success',
      data: {
        coupon: couponWithStats
      }
    });
  } catch (error) {
    logger.error('Get coupon by ID error:', error);
    next(error);
  }
};

/**
 * Update coupon
 * @route PATCH /api/coupons/:id
 */
export const updateCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      name,
      description,
      discountType,
      discountValue,
      minimumAmount,
      maximumDiscount,
      usageLimit,
      validFrom,
      validUntil,
      isActive
    } = req.body;

    // Check if coupon exists
    const couponResult = await db.query<CouponRow>('SELECT * FROM coupons WHERE id = $1', [id]);

    if (couponResult.rows.length === 0) {
      return next(new AppError('Coupon not found', 404));
    }

    const existingCoupon = couponResult.rows[0];

    // Check if coupon has been used and prevent certain changes
    if (existingCoupon.used_count > 0) {
      if (discountType && discountType !== existingCoupon.discount_type) {
        return next(new AppError('Cannot change discount type for a coupon that has been used', 400));
      }
      if (discountValue && discountValue !== existingCoupon.discount_value) {
        return next(new AppError('Cannot change discount value for a coupon that has been used', 400));
      }
    }

    // Validate dates if provided
    if (validFrom && validUntil) {
      const validFromDate = moment(validFrom);
      const validUntilDate = moment(validUntil);

      if (!validFromDate.isValid() || !validUntilDate.isValid()) {
        return next(new AppError('Invalid date format', 400));
      }

      if (validUntilDate.isBefore(validFromDate)) {
        return next(new AppError('Valid until date must be after valid from date', 400));
      }
    }

    // Validate discount value if provided
    if (discountType && discountValue) {
      if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
        return next(new AppError('Percentage discount must be between 0 and 100', 400));
      }
      if (discountType === 'fixed' && discountValue <= 0) {
        return next(new AppError('Fixed discount must be greater than 0', 400));
      }
    }

    const result = await db.query<CouponRow>(
      `UPDATE coupons 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           discount_type = COALESCE($3, discount_type),
           discount_value = COALESCE($4, discount_value),
           minimum_amount = COALESCE($5, minimum_amount),
           maximum_discount = COALESCE($6, maximum_discount),
           usage_limit = COALESCE($7, usage_limit),
           valid_from = COALESCE($8, valid_from),
           valid_until = COALESCE($9, valid_until),
           is_active = COALESCE($10, is_active),
           updated_at = NOW()
       WHERE id = $11
       RETURNING *`,
      [
        name,
        description,
        discountType,
        discountValue,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        validFrom,
        validUntil,
        isActive,
        id
      ]
    );

    logger.info('Coupon updated successfully', {
      couponId: id,
      updatedBy: req.user?.id,
      changes: req.body
    });

    res.status(200).json({
      status: 'success',
      data: {
        coupon: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update coupon error:', error);
    next(error);
  }
};

/**
 * Delete coupon (soft delete by deactivating)
 * @route DELETE /api/coupons/:id
 */
export const deleteCoupon = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    // Check if coupon exists
    const couponResult = await db.query<CouponRow>('SELECT * FROM coupons WHERE id = $1', [id]);

    if (couponResult.rows.length === 0) {
      return next(new AppError('Coupon not found', 404));
    }

    const coupon = couponResult.rows[0];

    // Check if coupon has been used
    const usageResult = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = $1',
      [id]
    );

    const usageCount = parseInt(usageResult.rows[0].count);

    if (usageCount > 0 && force !== 'true') {
      // Soft delete: deactivate instead of actual deletion
      await db.query(
        'UPDATE coupons SET is_active = false, updated_at = NOW() WHERE id = $1',
        [id]
      );

      logger.info('Coupon deactivated (soft delete)', {
        couponId: id,
        code: coupon.code,
        usageCount,
        deactivatedBy: req.user?.id
      });

      res.status(200).json({
        status: 'success',
        message: 'Coupon has been deactivated due to existing usage history'
      });
      return;
    }

    // Hard delete if no usage or force flag is set
    await db.query('DELETE FROM coupons WHERE id = $1', [id]);

    logger.info('Coupon deleted permanently', {
      couponId: id,
      code: coupon.code,
      deletedBy: req.user?.id,
      forced: force === 'true'
    });

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Delete coupon error:', error);
    next(error);
  }
};

/**
 * Get coupon usage history with detailed information
 * @route GET /api/coupons/:id/usage
 */
export const getCouponUsage = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10', sortBy = 'used_at', sortOrder = 'desc' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Check if coupon exists
    const couponResult = await db.query<CouponRow>('SELECT * FROM coupons WHERE id = $1', [id]);

    if (couponResult.rows.length === 0) {
      return next(new AppError('Coupon not found', 404));
    }

    // Validate sorting
    const allowedSortFields = ['used_at', 'discount_amount', 'first_name', 'payment_amount'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'used_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const result = await db.query<CouponUsageRow>(
      `SELECT cu.*, 
              u.first_name,
              u.last_name,
              u.email,
              p.order_id,
              p.amount as payment_amount,
              p.payment_status,
              c.title as course_title,
              c.thumbnail_url as course_thumbnail
       FROM coupon_usage cu
       JOIN users u ON cu.user_id = u.id
       LEFT JOIN payments p ON cu.payment_id = p.id
       LEFT JOIN courses c ON p.course_id = c.id
       WHERE cu.coupon_id = $1
       ORDER BY ${sortField} ${sortDirection}
       LIMIT $2 OFFSET $3`,
      [id, limitNum, offset]
    );

    // Get total count
    const countResult = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM coupon_usage WHERE coupon_id = $1',
      [id]
    );
    const totalUsage = parseInt(countResult.rows[0]?.count || '0');

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      totalPages: Math.ceil(totalUsage / limitNum),
      currentPage: pageNum,
      totalItems: totalUsage,
      data: {
        usage: result.rows
      }
    });
  } catch (error) {
    logger.error('Get coupon usage error:', error);
    next(error);
  }
};

/**
 * Get comprehensive coupon statistics (Admin only)
 * @route GET /api/coupons/stats
 */
export const getCouponStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = '30' } = req.query;
    const periodDays = parseInt(period as string);

    // Overall statistics
    const statsResult = await db.query<{
      total_coupons: string;
      active_coupons: string;
      expired_coupons: string;
      upcoming_coupons: string;
      inactive_coupons: string;
      total_usage: string;
      total_discount_given: string;
      average_discount: string;
      unique_users: string;
    }>(
      `SELECT 
         COUNT(*) as total_coupons,
         COUNT(CASE WHEN is_active = true AND valid_until > NOW() AND valid_from <= NOW() THEN 1 END) as active_coupons,
         COUNT(CASE WHEN valid_until <= NOW() THEN 1 END) as expired_coupons,
         COUNT(CASE WHEN valid_from > NOW() AND is_active = true THEN 1 END) as upcoming_coupons,
         COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_coupons,
         (SELECT COUNT(*) FROM coupon_usage) as total_usage,
         (SELECT COALESCE(SUM(discount_amount), 0) FROM coupon_usage) as total_discount_given,
         (SELECT COALESCE(AVG(discount_amount), 0) FROM coupon_usage) as average_discount,
         (SELECT COUNT(DISTINCT user_id) FROM coupon_usage) as unique_users
       FROM coupons`
    );

    // Top performing coupons by usage
    const topCouponsResult = await db.query<{
      coupon_id: string;
      code: string;
      name: string;
      discount_type: string;
      discount_value: string;
      usage_count: string;
      total_discount: string;
      unique_users: string;
      conversion_rate: string;
    }>(
      `SELECT 
         c.id as coupon_id,
         c.code,
         c.name,
         c.discount_type,
         c.discount_value,
         COUNT(cu.id) as usage_count,
         COALESCE(SUM(cu.discount_amount), 0) as total_discount,
         COUNT(DISTINCT cu.user_id) as unique_users,
         CASE 
           WHEN c.usage_limit > 0 THEN ROUND((COUNT(cu.id)::decimal / c.usage_limit) * 100, 2)
           ELSE NULL
         END as conversion_rate
       FROM coupons c
       LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
       GROUP BY c.id, c.code, c.name, c.discount_type, c.discount_value, c.usage_limit
       ORDER BY usage_count DESC
       LIMIT 10`
    );

    // Usage trends for specified period
    const trendsResult = await db.query<{
      date: string;
      usage_count: string;
      discount_amount: string;
      unique_users: string;
    }>(
      `SELECT 
         DATE(used_at) as date,
         COUNT(*) as usage_count,
         SUM(discount_amount) as discount_amount,
         COUNT(DISTINCT user_id) as unique_users
       FROM coupon_usage 
       WHERE used_at >= NOW() - INTERVAL '${periodDays} days'
       GROUP BY DATE(used_at)
       ORDER BY date`
    );

    // Discount type distribution
    const typeDistributionResult = await db.query<{
      discount_type: string;
      coupon_count: string;
      total_usage: string;
      total_discount: string;
    }>(
      `SELECT 
         c.discount_type,
         COUNT(DISTINCT c.id) as coupon_count,
         COUNT(cu.id) as total_usage,
         COALESCE(SUM(cu.discount_amount), 0) as total_discount
       FROM coupons c
       LEFT JOIN coupon_usage cu ON c.id = cu.coupon_id
       GROUP BY c.discount_type`
    );

    const stats = statsResult.rows[0];

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalCoupons: parseInt(stats.total_coupons || '0'),
          activeCoupons: parseInt(stats.active_coupons || '0'),
          expiredCoupons: parseInt(stats.expired_coupons || '0'),
          upcomingCoupons: parseInt(stats.upcoming_coupons || '0'),
          inactiveCoupons: parseInt(stats.inactive_coupons || '0'),
          totalUsage: parseInt(stats.total_usage || '0'),
          totalDiscountGiven: parseFloat(stats.total_discount_given || '0'),
          averageDiscount: parseFloat(stats.average_discount || '0'),
          uniqueUsers: parseInt(stats.unique_users || '0')
        },
        topCoupons: topCouponsResult.rows.map(row => ({
          couponId: row.coupon_id,
          code: row.code,
          name: row.name,
          discountType: row.discount_type,
          discountValue: parseFloat(row.discount_value),
          usageCount: parseInt(row.usage_count || '0'),
          totalDiscount: parseFloat(row.total_discount || '0'),
          uniqueUsers: parseInt(row.unique_users || '0'),
          conversionRate: row.conversion_rate ? parseFloat(row.conversion_rate) : null
        })),
        trends: trendsResult.rows.map(row => ({
          date: row.date,
          usageCount: parseInt(row.usage_count),
          discountAmount: parseFloat(row.discount_amount),
          uniqueUsers: parseInt(row.unique_users)
        })),
        typeDistribution: typeDistributionResult.rows.map(row => ({
          type: row.discount_type,
          couponCount: parseInt(row.coupon_count),
          totalUsage: parseInt(row.total_usage || '0'),
          totalDiscount: parseFloat(row.total_discount || '0')
        })),
        period: `${periodDays} days`
      }
    });
  } catch (error) {
    logger.error('Get coupon stats error:', error);
    next(error);
  }
};

/**
 * Apply coupon to payment (internal function used by payment controller)
 */
export const applyCouponToPayment = async (
  couponId: string,
  userId: string,
  paymentId: string,
  originalAmount: number
): Promise<{ discountAmount: number; finalAmount: number }> => {
  try {
    // Get coupon details
    const couponResult = await db.query<CouponRow>(
      'SELECT * FROM coupons WHERE id = $1 AND is_active = true',
      [couponId]
    );

    if (couponResult.rows.length === 0) {
      throw new Error('Invalid coupon');
    }

    const coupon = couponResult.rows[0];

    // Validate coupon is still usable
    const now = moment();
    if (now.isBefore(moment(coupon.valid_from)) || now.isAfter(moment(coupon.valid_until))) {
      throw new Error('Coupon is not valid at this time');
    }

    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      throw new Error('Coupon usage limit exceeded');
    }

    if (originalAmount < coupon.minimum_amount) {
      throw new Error('Order amount does not meet coupon minimum requirement');
    }

    // Check if user already used this coupon
    const usageCheck = await db.query(
      'SELECT * FROM coupon_usage WHERE coupon_id = $1 AND user_id = $2',
      [couponId, userId]
    );

    if (usageCheck.rows.length > 0) {
      throw new Error('User has already used this coupon');
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discount_type === 'percentage') {
      discountAmount = Math.floor((originalAmount * coupon.discount_value) / 100);
      if (coupon.maximum_discount && discountAmount > coupon.maximum_discount) {
        discountAmount = coupon.maximum_discount;
      }
    } else {
      discountAmount = coupon.discount_value;
    }

    // Ensure discount doesn't exceed order amount
    if (discountAmount > originalAmount) {
      discountAmount = originalAmount;
    }

    const finalAmount = originalAmount - discountAmount;

    // Use transaction for atomic operations
    await db.transaction(async (client) => {
      // Record coupon usage
      await client.query(
        'INSERT INTO coupon_usage (id, coupon_id, user_id, payment_id, discount_amount) VALUES ($1, $2, $3, $4, $5)',
        [uuidv4(), couponId, userId, paymentId, discountAmount]
      );

      // Update coupon used count
      await client.query(
        'UPDATE coupons SET used_count = used_count + 1 WHERE id = $1',
        [couponId]
      );
    });

    logger.info('Coupon applied to payment successfully', {
      couponId,
      paymentId,
      userId,
      originalAmount,
      discountAmount,
      finalAmount
    });

    return { discountAmount, finalAmount };
  } catch (error) {
    logger.error('Apply coupon to payment error:', error);
    throw error;
  }
};

/**
 * Bulk update coupon status
 * @route PATCH /api/coupons/bulk-update
 */
export const bulkUpdateCoupons = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { couponIds, action } = req.body;

    if (!couponIds || !Array.isArray(couponIds) || couponIds.length === 0) {
      return next(new AppError('Coupon IDs array is required', 400));
    }

    if (!['activate', 'deactivate', 'delete'].includes(action)) {
      return next(new AppError('Invalid action. Must be activate, deactivate, or delete', 400));
    }

    let query = '';
    let successMessage = '';

    switch (action) {
      case 'activate':
        query = 'UPDATE coupons SET is_active = true, updated_at = NOW() WHERE id = ANY($1)';
        successMessage = 'Coupons activated successfully';
        break;
      case 'deactivate':
        query = 'UPDATE coupons SET is_active = false, updated_at = NOW() WHERE id = ANY($1)';
        successMessage = 'Coupons deactivated successfully';
        break;
      case 'delete':
        // Check if any coupons have usage
        const usageCheck = await db.query(
          'SELECT coupon_id FROM coupon_usage WHERE coupon_id = ANY($1) GROUP BY coupon_id',
          [couponIds]
        );
        
        if (usageCheck.rows.length > 0) {
          const usedCouponIds = usageCheck.rows.map(row => row.coupon_id);
          return next(new AppError(`Cannot delete coupons that have been used: ${usedCouponIds.join(', ')}`, 400));
        }
        
        query = 'DELETE FROM coupons WHERE id = ANY($1)';
        successMessage = 'Coupons deleted successfully';
        break;
    }

    const result = await db.query(query, [couponIds]);

    logger.info('Bulk coupon update completed', {
      action,
      couponIds,
      affectedRows: result.rowCount,
      updatedBy: req.user?.id
    });

    res.status(200).json({
      status: 'success',
      message: successMessage,
      data: {
        affectedCount: result.rowCount
      }
    });
  } catch (error) {
    logger.error('Bulk update coupons error:', error);
    next(error);
  }
};

export default {
  createCoupon,
  getAllCoupons,
  validateCoupon,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  getCouponUsage,
  getCouponStats,
  applyCouponToPayment,
  bulkUpdateCoupons
};