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
  title: string;
  description: string;
  thumbnail_url?: string;
  teacher_id: string;
  price: number;
  status: string;
  level: string;
  category: string;
  category_id?: string;
  created_at: string;
  updated_at: string;
  teacher_first_name?: string;
  teacher_last_name?: string;
  teacher_email?: string;
  teacher_bio?: string;
  enrollment_count?: string;
  average_rating?: string;
  review_count?: string;
}

interface LectureRow {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content_type: string;
  content_url?: string;
  order_index: number;
  duration?: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * Create a new course
 * @route POST /api/courses
 */
export const createCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { title, description, thumbnailUrl, price, level, category, categoryId } = req.body;
    const teacherId = req.user?.id;

    if (!teacherId) {
      return next(new AppError('Authentication required', 401));
    }

    // Only teachers and admins can create courses
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to create courses', 403));
    }

    const result = await db.query<CourseRow>(
      `INSERT INTO courses (title, description, thumbnail_url, teacher_id, price, level, category, category_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING *`,
      [title, description, thumbnailUrl, teacherId, price, level, category, categoryId]
    );

    const course = result.rows[0];

    res.status(201).json({
      status: 'success',
      data: {
        course
      }
    });
  } catch (error) {
    logger.error('Create course error:', error);
    next(error);
  }
};

/**
 * Get all courses with pagination and filters
 * @route GET /api/courses
 */
export const getAllCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10', category, level, search, teacher } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = "WHERE c.status = 'published'";
    const params: any[] = [limitNum, offset];
    let paramCount = 2;

    // Add filters
    if (category) {
      paramCount++;
      whereClause += ` AND c.category = $${paramCount}`;
      params.push(category);
    }

    if (level) {
      paramCount++;
      whereClause += ` AND c.level = $${paramCount}`;
      params.push(level);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (c.title ILIKE $${paramCount} OR c.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    if (teacher) {
      paramCount++;
      whereClause += ` AND c.teacher_id = $${paramCount}`;
      params.push(teacher);
    }

    const query = `
      SELECT c.*, 
             u.first_name as teacher_first_name, 
             u.last_name as teacher_last_name,
             COUNT(e.id) as enrollment_count,
             AVG(r.rating) as average_rating
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      ${whereClause}
      GROUP BY c.id, u.first_name, u.last_name
      ORDER BY c.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query<CourseRow>(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(*) 
      FROM courses c 
      ${whereClause.replace(/LIMIT \$1 OFFSET \$2/, '')}
    `;
    const countResult = await db.query<{ count: string }>(countQuery, params.slice(2));
    const totalCourses = parseInt(countResult.rows[0]?.count || '0');

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      totalPages: Math.ceil(totalCourses / limitNum),
      currentPage: pageNum,
      data: {
        courses: result.rows
      }
    });
  } catch (error) {
    logger.error('Get all courses error:', error);
    next(error);
  }
};

/**
 * Get course by ID
 * @route GET /api/courses/:id
 */
export const getCourseById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query<CourseRow>(
      `SELECT c.*, 
              u.first_name as teacher_first_name, 
              u.last_name as teacher_last_name,
              u.email as teacher_email,
              u.bio as teacher_bio,
              COUNT(DISTINCT e.id) as enrollment_count,
              AVG(r.rating) as average_rating,
              COUNT(DISTINCT r.id) as review_count
       FROM courses c
       LEFT JOIN users u ON c.teacher_id = u.id
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       WHERE c.id = $1
       GROUP BY c.id, u.first_name, u.last_name, u.email, u.bio`,
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = result.rows[0];

    // Get course lectures
    const lecturesResult = await db.query<LectureRow>(
      'SELECT * FROM lectures WHERE course_id = $1 AND is_published = true ORDER BY order_index',
      [id]
    );

    const courseWithLectures = {
      ...course,
      lectures: lecturesResult.rows
    };

    res.status(200).json({
      status: 'success',
      data: {
        course: courseWithLectures
      }
    });
  } catch (error) {
    logger.error('Get course by ID error:', error);
    next(error);
  }
};

/**
 * Update course
 * @route PATCH /api/courses/:id
 */
export const updateCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if course exists and user has permission
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = $1', [id]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = courseResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && course.teacher_id !== userId) {
      return next(new AppError('You do not have permission to update this course', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to update courses', 403));
    }

    const { title, description, thumbnailUrl, price, level, category, categoryId } = req.body;

    const result = await db.query<CourseRow>(
      `UPDATE courses 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           thumbnail_url = COALESCE($3, thumbnail_url),
           price = COALESCE($4, price),
           level = COALESCE($5, level),
           category = COALESCE($6, category),
           category_id = COALESCE($7, category_id),
           updated_at = NOW()
       WHERE id = $8
       RETURNING *`,
      [title, description, thumbnailUrl, price, level, category, categoryId, id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        course: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update course error:', error);
    next(error);
  }
};

/**
 * Delete course
 * @route DELETE /api/courses/:id
 */
export const deleteCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if course exists and user has permission
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = $1', [id]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = courseResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && course.teacher_id !== userId) {
      return next(new AppError('You do not have permission to delete this course', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to delete courses', 403));
    }

    await db.query('DELETE FROM courses WHERE id = $1', [id]);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Delete course error:', error);
    next(error);
  }
};

/**
 * Publish course
 * @route PATCH /api/courses/:id/publish
 */
export const publishCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if course exists and user has permission
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = $1', [id]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = courseResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && course.teacher_id !== userId) {
      return next(new AppError('You do not have permission to publish this course', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to publish courses', 403));
    }

    const result = await db.query<CourseRow>(
      `UPDATE courses 
       SET status = 'published', updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        course: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Publish course error:', error);
    next(error);
  }
};

export default {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse
};