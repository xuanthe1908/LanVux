import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import AppError from '../utils/appError';
import logger from '../utils/logger';
import config from '../config';

// Types and Interfaces
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

interface UserRow {
  id: string;
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  bio?: string;
  phone_number?: string;
  date_of_birth?: string;
  timezone?: string;
  language?: string;
  is_active: boolean;
  email_verified: boolean;
  last_login_at?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface UserStats {
  total_courses?: string;
  completed_courses?: string;
  total_enrollments?: string;
  total_assignments?: string;
  average_score?: string;
  total_students?: string;
  total_revenue?: string;
}

/**
 * Get all users with advanced filtering and pagination (Admin only)
 * @route GET /api/users
 */
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { 
      page = '1', 
      limit = '10', 
      role, 
      search, 
      sortBy = 'created_at', 
      sortOrder = 'desc',
      active,
      verified,
      startDate,
      endDate
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = 'WHERE 1=1';
    const params: any[] = [limitNum, offset];
    let paramCount = 2;

    // Role filter
    if (role && ['student', 'teacher', 'admin'].includes(role as string)) {
      paramCount++;
      whereClause += ` AND role = ?`;
      params.splice(-2, 0, role);
    }

    // Search filter (name, email)
    if (search) {
      paramCount++;
      whereClause += ` AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.splice(-2, 0, searchTerm, searchTerm, searchTerm);
      paramCount += 2; // Added 2 more search params
    }

    // Active status filter
    if (active !== undefined) {
      paramCount++;
      whereClause += ` AND is_active = ?`;
      params.splice(-2, 0, active === 'true');
    }

    // Email verified filter
    if (verified !== undefined) {
      paramCount++;
      whereClause += ` AND email_verified = ?`;
      params.splice(-2, 0, verified === 'true');
    }

    // Date range filter
    if (startDate) {
      paramCount++;
      whereClause += ` AND created_at >= ?`;
      params.splice(-2, 0, startDate);
    }

    if (endDate) {
      paramCount++;
      whereClause += ` AND created_at <= ?`;
      params.splice(-2, 0, endDate);
    }

    // Validate and set sorting
    const allowedSortFields = ['first_name', 'last_name', 'email', 'created_at', 'role', 'last_login_at'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const query = `
      SELECT 
        id, email, role, first_name, last_name, profile_picture, bio, 
        phone_number, is_active, email_verified, last_login_at, created_at,
        CASE 
          WHEN role = 'student' THEN (
            SELECT COUNT(*) FROM enrollments WHERE user_id = users.id
          )
          WHEN role = 'teacher' THEN (
            SELECT COUNT(*) FROM courses WHERE teacher_id = users.id
          )
          ELSE 0
        END as activity_count
      FROM users 
      ${whereClause}
      ORDER BY ${sortField} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    const result = await db.query<UserRow>(query, params);

    // Get total count for pagination
    const countQuery = `SELECT COUNT(*) as count FROM users ${whereClause}`;
    const countParams = params.slice(0, -2); // Remove LIMIT and OFFSET
    const countResult = await db.query<{ count: string }>(countQuery, countParams);
    const totalUsers = parseInt(countResult.rows[0]?.count || '0');

    // Get summary statistics
    const statsResult = await db.query<{
      total_users: string;
      active_users: string;
      verified_users: string;
      students: string;
      teachers: string;
      admins: string;
    }>(
      `SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
         COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
         COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
         COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers,
         COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
       FROM users`
    );

    const stats = statsResult.rows[0];

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      totalItems: totalUsers,
      data: {
        users: result.rows,
        statistics: {
          totalUsers: parseInt(stats.total_users || '0'),
          activeUsers: parseInt(stats.active_users || '0'),
          verifiedUsers: parseInt(stats.verified_users || '0'),
          breakdown: {
            students: parseInt(stats.students || '0'),
            teachers: parseInt(stats.teachers || '0'),
            admins: parseInt(stats.admins || '0')
          }
        }
      }
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};

/**
 * Get user by ID with detailed information
 * @route GET /api/users/:id
 */
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const requestingUserId = req.user?.id;

    // Check permissions
    if (req.user?.role === 'student' && id !== requestingUserId) {
      return next(new AppError('Students can only view their own profile', 403));
    }

    const result = await db.query<UserRow>(
      `SELECT 
         id, email, role, first_name, last_name, profile_picture, bio, 
         phone_number, date_of_birth, timezone, language, is_active, 
         email_verified, last_login_at, created_at, updated_at
       FROM users 
       WHERE id = ?`,
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = result.rows[0];

    // Get additional statistics based on role
    let additionalData = {};

    if (user.role === 'student') {
      const studentStats = await db.query<UserStats>(
        `SELECT 
           COUNT(DISTINCT e.id) as total_enrollments,
           COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.id END) as completed_courses,
           COUNT(DISTINCT a.id) as total_assignments,
           AVG(asub.grade) as average_score
         FROM enrollments e
         LEFT JOIN assignments a ON a.course_id = e.course_id
         LEFT JOIN assignment_submissions asub ON asub.assignment_id = a.id AND asub.user_id = e.user_id
         WHERE e.user_id = ?`,
        [id]
      );

      additionalData = {
        statistics: {
          totalEnrollments: parseInt(studentStats.rows[0]?.total_enrollments || '0'),
          completedCourses: parseInt(studentStats.rows[0]?.completed_courses || '0'),
          totalAssignments: parseInt(studentStats.rows[0]?.total_assignments || '0'),
          averageScore: parseFloat(studentStats.rows[0]?.average_score || '0')
        }
      };
    } else if (user.role === 'teacher') {
      const teacherStats = await db.query<UserStats>(
        `SELECT 
           COUNT(DISTINCT c.id) as total_courses,
           COUNT(DISTINCT e.id) as total_students,
           SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount ELSE 0 END) as total_revenue
         FROM courses c
         LEFT JOIN enrollments e ON e.course_id = c.id
         LEFT JOIN payments p ON p.course_id = c.id
         WHERE c.teacher_id = ?`,
        [id]
      );

      additionalData = {
        statistics: {
          totalCourses: parseInt(teacherStats.rows[0]?.total_courses || '0'),
          totalStudents: parseInt(teacherStats.rows[0]?.total_students || '0'),
          totalRevenue: parseFloat(teacherStats.rows[0]?.total_revenue || '0')
        }
      };
    }

    // Get recent activity
    const recentActivity = await db.query(
      `(SELECT 'enrollment' as type, c.title as description, e.enrolled_at as created_at
        FROM enrollments e
        JOIN courses c ON e.course_id = c.id
        WHERE e.user_id = ?
        ORDER BY e.enrolled_at DESC
        LIMIT 5)
       UNION ALL
       (SELECT 'assignment' as type, a.title as description, asub.submitted_at as created_at
        FROM assignment_submissions asub
        JOIN assignments a ON asub.assignment_id = a.id
        WHERE asub.user_id = ?
        ORDER BY asub.submitted_at DESC
        LIMIT 5)
       ORDER BY created_at DESC
       LIMIT 10`,
      [id, id]
    );

    const userData = {
      ...user,
      ...additionalData,
      recentActivity: recentActivity.rows
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userData
      }
    });
  } catch (error) {
    logger.error('Get user by ID error:', error);
    next(error);
  }
};

/**
 * Update user profile
 * @route PATCH /api/users/profile
 */
export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { 
      firstName, 
      lastName, 
      bio, 
      profilePicture, 
      phoneNumber, 
      dateOfBirth, 
      timezone, 
      language 
    } = req.body;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(lastName);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    if (profilePicture !== undefined) {
      updateFields.push('profile_picture = ?');
      updateValues.push(profilePicture);
    }
    if (phoneNumber !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(phoneNumber);
    }
    if (dateOfBirth !== undefined) {
      updateFields.push('date_of_birth = ?');
      updateValues.push(dateOfBirth);
    }
    if (timezone !== undefined) {
      updateFields.push('timezone = ?');
      updateValues.push(timezone);
    }
    if (language !== undefined) {
      updateFields.push('language = ?');
      updateValues.push(language);
    }

    if (updateFields.length === 0) {
      return next(new AppError('No fields to update', 400));
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(userId);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await db.query(query, updateValues);

    // Fetch updated user data
    const result = await db.query<UserRow>(
      `SELECT 
         id, email, role, first_name, last_name, profile_picture, bio, 
         phone_number, date_of_birth, timezone, language, updated_at
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    logger.info('User profile updated', { userId, updatedFields: Object.keys(req.body) });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
};

/**
 * Create new user (Admin only)
 * @route POST /api/users
 */
export const createUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role = 'student', active = true } = req.body;

    // Check if user already exists
    const existingUser = await db.query<UserRow>('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser.rows.length > 0) {
      return next(new AppError('User with this email already exists', 400));
    }

    // Hash password
    const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    // Create user
    await db.query(
      `INSERT INTO users (id, email, password, first_name, last_name, role, is_active) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [userId, email, hashedPassword, firstName, lastName, role, active]
    );

    // Fetch created user (without password)
    const result = await db.query<UserRow>(
      `SELECT 
         id, email, role, first_name, last_name, is_active, email_verified, created_at
       FROM users 
       WHERE id = ?`,
      [userId]
    );

    logger.info('User created by admin', { 
      createdUserId: userId, 
      adminId: req.user?.id,
      role 
    });

    res.status(201).json({
      status: 'success',
      message: 'User created successfully',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Create user error:', error);
    next(error);
  }
};

/**
 * Update user by ID (Admin only)
 * @route PATCH /api/users/:id
 */
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { 
      firstName, 
      lastName, 
      role, 
      active, 
      emailVerified,
      bio,
      phoneNumber 
    } = req.body;

    // Check if user exists
    const userExists = await db.query<UserRow>('SELECT id, role FROM users WHERE id = ?', [id]);
    if (userExists.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    // Prevent changing admin role unless requester is admin
    const currentUser = userExists.rows[0];
    if (currentUser.role === 'admin' && role !== 'admin' && req.user?.role !== 'admin') {
      return next(new AppError('Cannot modify admin user role', 403));
    }

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (firstName !== undefined) {
      updateFields.push('first_name = ?');
      updateValues.push(firstName);
    }
    if (lastName !== undefined) {
      updateFields.push('last_name = ?');
      updateValues.push(lastName);
    }
    if (role !== undefined) {
      updateFields.push('role = ?');
      updateValues.push(role);
    }
    if (active !== undefined) {
      updateFields.push('is_active = ?');
      updateValues.push(active);
    }
    if (emailVerified !== undefined) {
      updateFields.push('email_verified = ?');
      updateValues.push(emailVerified);
    }
    if (bio !== undefined) {
      updateFields.push('bio = ?');
      updateValues.push(bio);
    }
    if (phoneNumber !== undefined) {
      updateFields.push('phone_number = ?');
      updateValues.push(phoneNumber);
    }

    if (updateFields.length === 0) {
      return next(new AppError('No fields to update', 400));
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    const query = `
      UPDATE users 
      SET ${updateFields.join(', ')}
      WHERE id = ?
    `;

    await db.query(query, updateValues);

    // Fetch updated user
    const result = await db.query<UserRow>(
      `SELECT 
         id, email, role, first_name, last_name, is_active, email_verified, 
         bio, phone_number, updated_at
       FROM users 
       WHERE id = ?`,
      [id]
    );

    logger.info('User updated by admin', { 
      updatedUserId: id, 
      adminId: req.user?.id,
      changes: Object.keys(req.body)
    });

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: {
        user: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update user error:', error);
    next(error);
  }
};

/**
 * Delete user (Admin only)
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { force = false } = req.query;

    // Check if user exists
    const userResult = await db.query<UserRow>('SELECT * FROM users WHERE id = ?', [id]);
    if (userResult.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = userResult.rows[0];

    // Prevent deleting admin users unless forced
    if (user.role === 'admin' && !force) {
      return next(new AppError('Cannot delete admin user without force flag', 403));
    }

    // Check for dependencies
    const dependencies = await db.query(
      `SELECT 
         (SELECT COUNT(*) FROM courses WHERE teacher_id = ?) as courses_count,
         (SELECT COUNT(*) FROM enrollments WHERE user_id = ?) as enrollments_count,
         (SELECT COUNT(*) FROM assignment_submissions WHERE user_id = ?) as submissions_count`,
      [id, id, id]
    );

    const deps = dependencies.rows[0];
    const hasDependencies = 
      parseInt(deps.courses_count) > 0 || 
      parseInt(deps.enrollments_count) > 0 || 
      parseInt(deps.submissions_count) > 0;

    if (hasDependencies && !force) {
      return next(new AppError(
        'User has associated data (courses, enrollments, submissions). Use force=true to delete anyway.', 
        400
      ));
    }

    // Perform deletion in transaction
    await db.transaction(async (connection) => {
      // Delete user's data in correct order (foreign key constraints)
      await connection.query('DELETE FROM assignment_submissions WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM lecture_progress WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM enrollments WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM messages WHERE sender_id = ? OR recipient_id = ?', [id, id]);
      await connection.query('DELETE FROM ai_chat_history WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM coupon_usage WHERE user_id = ?', [id]);
      await connection.query('DELETE FROM payments WHERE user_id = ?', [id]);
      
      // Delete courses if user is a teacher
      if (user.role === 'teacher') {
        const userCoursesResult = await connection.query('SELECT id FROM courses WHERE teacher_id = ?', [id]);
        // Ensure userCoursesResult has a 'rows' property, or fallback to an empty array
        const userCourses = (userCoursesResult as { rows?: any[] }).rows ?? [];
        for (const course of userCourses) {
          // Delete course-related data
          await connection.query('DELETE FROM assignments WHERE course_id = ?', [course.id]);
          await connection.query('DELETE FROM lectures WHERE course_id = ?', [course.id]);
          await connection.query('DELETE FROM courses WHERE id = ?', [course.id]);
        }
      }
      
      // Finally delete the user
      await connection.query('DELETE FROM users WHERE id = ?', [id]);
    });

    logger.info('User deleted', { 
      deletedUserId: id, 
      deletedUserEmail: user.email,
      adminId: req.user?.id,
      forced: !!force
    });

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

/**
 * Get user statistics (Admin, Teachers for their students)
 * @route GET /api/users/stats
 */
export const getUserStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { period = '30', role: roleFilter } = req.query;
    const periodDays = parseInt(period as string);

    let whereClause = '';
    const params: any[] = [];

    // For teachers, only show stats for their students
    if (req.user?.role === 'teacher') {
      whereClause = `WHERE u.id IN (
        SELECT DISTINCT e.user_id 
        FROM enrollments e 
        JOIN courses c ON e.course_id = c.id 
        WHERE c.teacher_id = ?
      )`;
      params.push(req.user.id);
    }

    // Role filter
    if (roleFilter && ['student', 'teacher', 'admin'].includes(roleFilter as string)) {
      whereClause += whereClause ? ' AND ' : 'WHERE ';
      whereClause += 'u.role = ?';
      params.push(roleFilter);
    }

    // Overall statistics
    const overallStats = await db.query<{
      total_users: string;
      active_users: string;
      verified_users: string;
      new_users_period: string;
      students: string;
      teachers: string;
      admins: string;
    }>(
      `SELECT 
         COUNT(*) as total_users,
         COUNT(CASE WHEN is_active = true THEN 1 END) as active_users,
         COUNT(CASE WHEN email_verified = true THEN 1 END) as verified_users,
         COUNT(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) THEN 1 END) as new_users_period,
         COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
         COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers,
         COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
       FROM users u ${whereClause}`,
      [periodDays, ...params]
    );

    // Registration trends
    const registrationTrends = await db.query(
      `SELECT 
         DATE(created_at) as date,
         COUNT(*) as registrations,
         COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
         COUNT(CASE WHEN role = 'teacher' THEN 1 END) as teachers
       FROM users u
       WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ${whereClause.replace('WHERE', 'AND')}
       GROUP BY DATE(created_at)
       ORDER BY date DESC`,
      [periodDays, ...params]
    );

    // Activity statistics
    const activityStats = await db.query(
      `SELECT 
         COUNT(DISTINCT u.id) as active_users,
         COUNT(DISTINCT CASE WHEN u.last_login_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN u.id END) as weekly_active,
         COUNT(DISTINCT CASE WHEN u.last_login_at >= DATE_SUB(NOW(), INTERVAL 1 DAY) THEN u.id END) as daily_active
       FROM users u ${whereClause}`,
      params
    );

    const stats = overallStats.rows[0];
    const activity = activityStats.rows[0];

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalUsers: parseInt(stats.total_users || '0'),
          activeUsers: parseInt(stats.active_users || '0'),
          verifiedUsers: parseInt(stats.verified_users || '0'),
          newUsersInPeriod: parseInt(stats.new_users_period || '0'),
          breakdown: {
            students: parseInt(stats.students || '0'),
            teachers: parseInt(stats.teachers || '0'),
            admins: parseInt(stats.admins || '0')
          }
        },
        activity: {
          totalActive: parseInt(activity.active_users || '0'),
          weeklyActive: parseInt(activity.weekly_active || '0'),
          dailyActive: parseInt(activity.daily_active || '0')
        },
        trends: registrationTrends.rows.map(row => ({
          date: row.date,
          registrations: parseInt(row.registrations),
          students: parseInt(row.students),
          teachers: parseInt(row.teachers)
        })),
        period: `${periodDays} days`
      }
    });
  } catch (error) {
    logger.error('Get user stats error:', error);
    next(error);
  }
};

/**
 * Update user status (activate/deactivate)
 * @route PATCH /api/users/:id/status
 */
export const updateUserStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { active, reason } = req.body;

    // Check if user exists
    const userResult = await db.query<UserRow>('SELECT id, role, is_active FROM users WHERE id = ?', [id]);
    if (userResult.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = userResult.rows[0];

    // Prevent deactivating admin users
    if (user.role === 'admin' && active === false) {
      return next(new AppError('Cannot deactivate admin users', 403));
    }

    await db.query(
      'UPDATE users SET is_active = ?, updated_at = NOW() WHERE id = ?',
      [active, id]
    );

    logger.info('User status updated', {
      userId: id,
      newStatus: active ? 'active' : 'inactive',
      reason,
      updatedBy: req.user?.id
    });

    res.status(200).json({
      status: 'success',
      message: `User ${active ? 'activated' : 'deactivated'} successfully`,
      data: {
        userId: id,
        active,
        reason
      }
    });
  } catch (error) {
    logger.error('Update user status error:', error);
    next(error);
  }
};

/**
 * Reset user password (Admin only)
 * @route POST /api/users/:id/reset-password
 */
export const resetUserPassword = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { newPassword, notifyUser = false } = req.body;

    // Check if user exists
    const userResult = await db.query<UserRow>('SELECT id, email FROM users WHERE id = ?', [id]);
    if (userResult.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = userResult.rows[0];

    // Hash new password
    const salt = await bcrypt.genSalt(config.bcryptSaltRounds);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await db.query(
      'UPDATE users SET password = ?, updated_at = NOW() WHERE id = ?',
      [hashedPassword, id]
    );

    logger.info('User password reset by admin', {
      userId: id,
      userEmail: user.email,
      adminId: req.user?.id,
      notifyUser
    });

    res.status(200).json({
      status: 'success',
      message: 'Password reset successfully',
      data: {
        userId: id,
        notificationSent: notifyUser
      }
    });
  } catch (error) {
    logger.error('Reset user password error:', error);
    next(error);
  }
};

/**
 * Bulk update users (Admin only)
 * @route PATCH /api/users/bulk
 */
export const bulkUpdateUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { userIds, action, value } = req.body;

    if (!Array.isArray(userIds) || userIds.length === 0) {
      return next(new AppError('User IDs array is required', 400));
    }

    if (userIds.length > 100) {
      return next(new AppError('Cannot update more than 100 users at once', 400));
    }

    let query = '';
    let params: any[] = [];
    let successMessage = '';

    switch (action) {
      case 'activate':
        query = 'UPDATE users SET is_active = true, updated_at = NOW() WHERE id IN (?)';
        params = [userIds];
        successMessage = 'Users activated successfully';
        break;
      
      case 'deactivate':
        // Prevent deactivating admins
        const adminCheck = await db.query(
          'SELECT COUNT(*) as count FROM users WHERE id IN (?) AND role = "admin"',
          [userIds]
        );
        if (parseInt(adminCheck.rows[0].count) > 0) {
          return next(new AppError('Cannot deactivate admin users', 400));
        }
        
        query = 'UPDATE users SET is_active = false, updated_at = NOW() WHERE id IN (?)';
        params = [userIds];
        successMessage = 'Users deactivated successfully';
        break;
      
      case 'verify_email':
        query = 'UPDATE users SET email_verified = true, updated_at = NOW() WHERE id IN (?)';
        params = [userIds];
        successMessage = 'Users email verified successfully';
        break;
      
      case 'change_role':
        if (!['student', 'teacher'].includes(value)) {
          return next(new AppError('Invalid role value', 400));
        }
        
        // Prevent changing admin roles
        const adminRoleCheck = await db.query(
          'SELECT COUNT(*) as count FROM users WHERE id IN (?) AND role = "admin"',
          [userIds]
        );
        if (parseInt(adminRoleCheck.rows[0].count) > 0) {
          return next(new AppError('Cannot change admin user roles', 400));
        }
        
        query = 'UPDATE users SET role = ?, updated_at = NOW() WHERE id IN (?)';
        params = [value, userIds];
        successMessage = `Users role changed to ${value} successfully`;
        break;
      
      default:
        return next(new AppError('Invalid action', 400));
    }

    const result = await db.query(query, params);

    logger.info('Bulk user update', {
      action,
      userIds,
      value,
      affectedRows: result.rowCount,
      adminId: req.user?.id
    });

    res.status(200).json({
      status: 'success',
      message: successMessage,
      data: {
        affectedCount: result.rowCount,
        action,
        value
      }
    });
  } catch (error) {
    logger.error('Bulk update users error:', error);
    next(error);
  }
};

/**
 * Export users data (Admin only)
 * @route GET /api/users/export
 */
export const exportUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { format = 'json', role, active, verified } = req.query;

    let whereClause = 'WHERE 1=1';
    const params: any[] = [];

    // Add filters
    if (role && ['student', 'teacher', 'admin'].includes(role as string)) {
      whereClause += ' AND role = ?';
      params.push(role);
    }

    if (active !== undefined) {
      whereClause += ' AND is_active = ?';
      params.push(active === 'true');
    }

    if (verified !== undefined) {
      whereClause += ' AND email_verified = ?';
      params.push(verified === 'true');
    }

    const result = await db.query<UserRow>(
      `SELECT 
         id, email, role, first_name, last_name, phone_number, 
         is_active, email_verified, created_at, last_login_at
       FROM users 
       ${whereClause}
       ORDER BY created_at DESC`,
      params
    );

    const users = result.rows;

    if (format === 'csv') {
      // Generate CSV
      const csvHeaders = ['ID', 'Email', 'Role', 'First Name', 'Last Name', 'Phone', 'Active', 'Verified', 'Created At', 'Last Login'];
      const csvRows = users.map(user => [
        user.id,
        user.email,
        user.role,
        user.first_name,
        user.last_name,
        user.phone_number || '',
        user.is_active ? 'Yes' : 'No',
        user.email_verified ? 'Yes' : 'No',
        user.created_at,
        user.last_login_at || 'Never'
      ]);

      const csvContent = [csvHeaders, ...csvRows]
        .map(row => row.map(field => `"${field}"`).join(','))
        .join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="users_export_${new Date().toISOString().split('T')[0]}.csv"`);
      
      res.status(200).send(csvContent);
      return;
    }

    // Default JSON format
    res.status(200).json({
      status: 'success',
      exportedAt: new Date(),
      totalRecords: users.length,
      filters: { role, active, verified },
      data: {
        users
      }
    });
  } catch (error) {
    logger.error('Export users error:', error);
    next(error);
  }
};

/**
 * Get user activity log
 * @route GET /api/users/:id/activity
 */
export const getUserActivity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '20', type } = req.query;

    // Check permissions
    if (req.user?.role !== 'admin' && id !== req.user?.id) {
      return next(new AppError('You can only view your own activity log', 403));
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Get activity from multiple sources
    let activities: any[] = [];

    // Enrollments
    const enrollments = await db.query(
      `SELECT 
         'enrollment' as type,
         c.title as description,
         e.enrolled_at as created_at,
         'Enrolled in course' as action,
         c.id as reference_id
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ?`,
      [id]
    );

    // Assignment submissions
    const submissions = await db.query(
      `SELECT 
         'assignment_submission' as type,
         CONCAT('Submitted: ', a.title) as description,
         asub.submitted_at as created_at,
         'Assignment submitted' as action,
         a.id as reference_id
       FROM assignment_submissions asub
       JOIN assignments a ON asub.assignment_id = a.id
       WHERE asub.user_id = ?`,
      [id]
    );

    // Course completions
    const completions = await db.query(
      `SELECT 
         'course_completion' as type,
         CONCAT('Completed: ', c.title) as description,
         e.completed_at as created_at,
         'Course completed' as action,
         c.id as reference_id
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.user_id = ? AND e.completed_at IS NOT NULL`,
      [id]
    );

    // Messages sent
    const messages = await db.query(
      `SELECT 
         'message_sent' as type,
         CONCAT('Message: ', LEFT(m.subject, 50)) as description,
         m.created_at,
         'Message sent' as action,
         m.id as reference_id
       FROM messages m
       WHERE m.sender_id = ?`,
      [id]
    );

    // Combine all activities
    activities = [
      ...enrollments.rows,
      ...submissions.rows,
      ...completions.rows,
      ...messages.rows
    ];

    // Filter by type if specified
    if (type) {
      activities = activities.filter(activity => activity.type === type);
    }

    // Sort by date (newest first)
    activities.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    // Paginate
    const totalActivities = activities.length;
    const paginatedActivities = activities.slice(offset, offset + limitNum);

    res.status(200).json({
      status: 'success',
      results: paginatedActivities.length,
      totalPages: Math.ceil(totalActivities / limitNum),
      currentPage: pageNum,
      totalItems: totalActivities,
      data: {
        activities: paginatedActivities
      }
    });
  } catch (error) {
    logger.error('Get user activity error:', error);
    next(error);
  }
};

/**
 * Send notification to user (Admin only)
 * @route POST /api/users/:id/notify
 */
export const sendNotificationToUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { type, message, title, priority = 'normal' } = req.body;

    // Check if user exists
    const userResult = await db.query<UserRow>('SELECT id, email, first_name FROM users WHERE id = ?', [id]);
    if (userResult.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = userResult.rows[0];

    // Create notification record (assuming you have a notifications table)
    const notificationId = uuidv4();
    await db.query(
      `INSERT INTO notifications (id, user_id, type, title, message, priority, created_at) 
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [notificationId, id, type, title, message, priority]
    );

    logger.info('Notification sent to user', {
      notificationId,
      userId: id,
      userEmail: user.email,
      type,
      priority,
      sentBy: req.user?.id
    });

    res.status(200).json({
      status: 'success',
      message: 'Notification sent successfully',
      data: {
        notificationId,
        recipient: {
          id: user.id,
          email: user.email,
          name: user.first_name
        },
        type,
        priority
      }
    });
  } catch (error) {
    logger.error('Send notification error:', error);
    next(error);
  }
};

// Export all controller functions
export default {
  getAllUsers,
  getUserById,
  updateProfile,
  createUser,
  updateUser,
  deleteUser,
  getUserStats,
  updateUserStatus,
  resetUserPassword,
  bulkUpdateUsers,
  exportUsers,
  getUserActivity,
  sendNotificationToUser
};