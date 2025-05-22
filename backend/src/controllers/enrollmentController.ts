import { Request, Response, NextFunction } from 'express';
import db from '../db';
import AppError from '../utils/appError';
import logger from '../utils/logger';

// Simple, compatible interface
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

// Database result types
interface CourseRow {
  id: string;
  teacher_id: string;
  title: string;
  status: string;
  [key: string]: any;
}

interface EnrollmentRow {
  id: string;
  user_id: string;
  course_id: string;
  progress: number;
  enrolled_at: string;
  completed_at?: string;
  last_accessed_at: string;
  course_title?: string;
  course_description?: string;
  thumbnail_url?: string;
  level?: string;
  category?: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_id?: string;
  [key: string]: any;
}

interface ProgressRow {
  lecture_id: string;
  title: string;
  order_index: number;
  is_completed?: boolean;
  progress_seconds?: number;
  last_accessed_at?: string;
  [key: string]: any;
}

/**
 * Enroll in a course
 * @route POST /api/enrollments/:courseId
 */
export const enrollInCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Only students can enroll in courses
    if (req.user?.role !== 'student') {
      return next(new AppError('Only students can enroll in courses', 403));
    }

    // Check if course exists and is published
    const courseResult = await db.query<CourseRow>(
      'SELECT * FROM courses WHERE id = $1 AND status = $2',
      [courseId, 'published']
    );

    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found or not available for enrollment', 404));
    }

    // Check if already enrolled
    const existingEnrollment = await db.query<EnrollmentRow>(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, courseId]
    );

    if (existingEnrollment.rows.length > 0) {
      return next(new AppError('You are already enrolled in this course', 400));
    }

    // Create enrollment
    const result = await db.query<EnrollmentRow>(
      'INSERT INTO enrollments (user_id, course_id) VALUES ($1, $2) RETURNING *',
      [userId, courseId]
    );

    const enrollment = result.rows[0];

    res.status(201).json({
      status: 'success',
      data: {
        enrollment
      }
    });
  } catch (error) {
    logger.error('Enroll in course error:', error);
    next(error);
  }
};

/**
 * Get user's enrollments
 * @route GET /api/enrollments
 */
export const getUserEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = '1', limit = '10', status } = req.query;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = 'WHERE e.user_id = $1';
    const params: any[] = [userId, limitNum, offset];
    let paramCount = 1;

    // Add status filter
    if (status === 'completed') {
      whereClause += ' AND e.completed_at IS NOT NULL';
    } else if (status === 'in_progress') {
      whereClause += ' AND e.completed_at IS NULL AND e.progress > 0';
    } else if (status === 'not_started') {
      whereClause += ' AND e.progress = 0';
    }

    const query = `
      SELECT e.*, 
             c.title as course_title,
             c.description as course_description,
             c.thumbnail_url,
             c.level,
             c.category,
             u.first_name as teacher_first_name,
             u.last_name as teacher_last_name
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      JOIN users u ON c.teacher_id = u.id
      ${whereClause}
      ORDER BY e.enrolled_at DESC
      LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}
    `;

    const result = await db.query<EnrollmentRow>(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM enrollments e 
      JOIN courses c ON e.course_id = c.id
      ${whereClause}
    `;
    const countResult = await db.query<{ count: string }>(countQuery, [userId]);
    const totalEnrollments = parseInt(countResult.rows[0]?.count || '0');

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      totalPages: Math.ceil(totalEnrollments / limitNum),
      currentPage: pageNum,
      data: {
        enrollments: result.rows
      }
    });
  } catch (error) {
    logger.error('Get user enrollments error:', error);
    next(error);
  }
};

/**
 * Get course enrollments (for teachers and admins)
 * @route GET /api/courses/:courseId/enrollments
 */
export const getCourseEnrollments = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { page = '1', limit = '10' } = req.query;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if course exists and user has permission
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = $1', [courseId]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = courseResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && course.teacher_id !== userId) {
      return next(new AppError('You do not have permission to view enrollments for this course', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to view course enrollments', 403));
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    const query = `
      SELECT e.*, 
             u.first_name,
             u.last_name,
             u.email
      FROM enrollments e
      JOIN users u ON e.user_id = u.id
      WHERE e.course_id = $1
      ORDER BY e.enrolled_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query<EnrollmentRow>(query, [courseId, limitNum, offset]);

    // Get total count for pagination
    const countResult = await db.query<{ count: string }>(
      'SELECT COUNT(*) FROM enrollments WHERE course_id = $1',
      [courseId]
    );
    const totalEnrollments = parseInt(countResult.rows[0]?.count || '0');

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      totalPages: Math.ceil(totalEnrollments / limitNum),
      currentPage: pageNum,
      data: {
        enrollments: result.rows
      }
    });
  } catch (error) {
    logger.error('Get course enrollments error:', error);
    next(error);
  }
};

/**
 * Get enrollment details
 * @route GET /api/enrollments/:enrollmentId
 */
export const getEnrollmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const result = await db.query<EnrollmentRow>(
      `SELECT e.*, 
              c.title as course_title,
              c.description as course_description,
              c.thumbnail_url,
              c.level,
              c.category,
              c.teacher_id,
              u.first_name as teacher_first_name,
              u.last_name as teacher_last_name
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       JOIN users u ON c.teacher_id = u.id
       WHERE e.id = $1`,
      [enrollmentId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Enrollment not found', 404));
    }

    const enrollment = result.rows[0];

    // Check permission
    if (req.user?.role === 'student' && enrollment.user_id !== userId) {
      return next(new AppError('You do not have permission to view this enrollment', 403));
    } else if (req.user?.role === 'teacher' && enrollment.teacher_id !== userId) {
      return next(new AppError('You do not have permission to view this enrollment', 403));
    } else if (req.user?.role !== 'student' && req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to view enrollments', 403));
    }

    // Get lecture progress for this enrollment
    const progressResult = await db.query<ProgressRow>(
      `SELECT lp.*, l.title as lecture_title, l.order_index
       FROM lecture_progress lp
       JOIN lectures l ON lp.lecture_id = l.id
       WHERE lp.user_id = $1 AND l.course_id = $2
       ORDER BY l.order_index`,
      [enrollment.user_id, enrollment.course_id]
    );

    const enrollmentWithProgress = {
      ...enrollment,
      lecture_progress: progressResult.rows
    };

    res.status(200).json({
      status: 'success',
      data: {
        enrollment: enrollmentWithProgress
      }
    });
  } catch (error) {
    logger.error('Get enrollment by ID error:', error);
    next(error);
  }
};

/**
 * Unenroll from course
 * @route DELETE /api/enrollments/:enrollmentId
 */
export const unenrollFromCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { enrollmentId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if enrollment exists
    const enrollmentResult = await db.query<EnrollmentRow>(
      'SELECT * FROM enrollments WHERE id = $1',
      [enrollmentId]
    );

    if (enrollmentResult.rows.length === 0) {
      return next(new AppError('Enrollment not found', 404));
    }

    const enrollment = enrollmentResult.rows[0];

    // Check permission
    if (req.user?.role === 'student' && enrollment.user_id !== userId) {
      return next(new AppError('You can only unenroll from your own courses', 403));
    } else if (req.user?.role !== 'student' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to unenroll users', 403));
    }

    // Delete enrollment (this will cascade delete lecture progress)
    await db.query('DELETE FROM enrollments WHERE id = $1', [enrollmentId]);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Unenroll from course error:', error);
    next(error);
  }
};

/**
 * Get enrollment statistics (for admins and teachers)
 * @route GET /api/enrollments/stats
 */
export const getEnrollmentStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to view enrollment statistics', 403));
    }

    let whereClause = '';
    const params: any[] = [];

    // For teachers, only show stats for their courses
    if (req.user?.role === 'teacher') {
      whereClause = 'WHERE c.teacher_id = $1';
      params.push(userId);
    }

    const statsResult = await db.query<{
      total_enrollments: string;
      completed_enrollments: string;
      in_progress_enrollments: string;
      not_started_enrollments: string;
      average_progress: string;
    }>(
      `SELECT 
         COUNT(e.id) as total_enrollments,
         COUNT(CASE WHEN e.completed_at IS NOT NULL THEN 1 END) as completed_enrollments,
         COUNT(CASE WHEN e.progress > 0 AND e.completed_at IS NULL THEN 1 END) as in_progress_enrollments,
         COUNT(CASE WHEN e.progress = 0 THEN 1 END) as not_started_enrollments,
         AVG(e.progress) as average_progress
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       ${whereClause}`,
      params
    );

    const stats = statsResult.rows[0];

    // Get enrollment trends (last 7 days)
    const trendsResult = await db.query<{
      date: string;
      enrollments: string;
    }>(
      `SELECT 
         DATE(e.enrolled_at) as date,
         COUNT(e.id) as enrollments
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       WHERE e.enrolled_at >= NOW() - INTERVAL '7 days' ${whereClause ? 'AND c.teacher_id = $1' : ''}
       GROUP BY DATE(e.enrolled_at)
       ORDER BY date`,
      req.user?.role === 'teacher' ? [userId] : []
    );

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          total_enrollments: parseInt(stats.total_enrollments || '0'),
          completed_enrollments: parseInt(stats.completed_enrollments || '0'),
          in_progress_enrollments: parseInt(stats.in_progress_enrollments || '0'),
          not_started_enrollments: parseInt(stats.not_started_enrollments || '0'),
          average_progress: parseFloat(stats.average_progress || '0').toFixed(2)
        },
        trends: trendsResult.rows.map(row => ({
          date: row.date,
          enrollments: parseInt(row.enrollments)
        }))
      }
    });
  } catch (error) {
    logger.error('Get enrollment stats error:', error);
    next(error);
  }
};

export default {
  enrollInCourse,
  getUserEnrollments,
  getCourseEnrollments,
  getEnrollmentById,
  unenrollFromCourse,
  getEnrollmentStats
};