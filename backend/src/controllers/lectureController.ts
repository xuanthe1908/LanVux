// src/controllers/lectureController.ts - PERFECT VERSION
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
  teacher_id?: string;
  course_status?: string;
  is_completed?: boolean;
  progress_seconds?: number;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface ProgressRow {
  id: string;
  user_id: string;
  lecture_id: string;
  is_completed: boolean;
  progress_seconds: number;
  last_accessed_at: string;
  [key: string]: any;
}

/**
 * Create a new lecture
 * @route POST /api/courses/:courseId/lectures
 */
export const createLecture = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description, contentType, contentUrl, orderIndex, duration } = req.body;
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
      return next(new AppError('You do not have permission to add lectures to this course', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to create lectures', 403));
    }

    const result = await db.query<LectureRow>(
      `INSERT INTO lectures (course_id, title, description, content_type, content_url, order_index, duration) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [courseId, title, description, contentType, contentUrl, orderIndex, duration]
    );

    const lecture = result.rows[0];

    res.status(201).json({
      status: 'success',
      data: {
        lecture
      }
    });
  } catch (error) {
    logger.error('Create lecture error:', error);
    next(error);
  }
};

/**
 * Get lectures for a course
 * @route GET /api/courses/:courseId/lectures
 */
export const getLecturesByCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    // Check if course exists
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = $1', [courseId]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = courseResult.rows[0];

    // For published courses, check if user is enrolled (for students)
    if (course.status === 'published' && req.user?.role === 'student') {
      const enrollmentResult = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );

      if (enrollmentResult.rows.length === 0) {
        return next(new AppError('You are not enrolled in this course', 403));
      }
    }

    // For draft courses, only teacher and admin can access
    if (course.status === 'draft') {
      if (req.user?.role === 'teacher' && course.teacher_id !== userId) {
        return next(new AppError('You do not have permission to access this course', 403));
      } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
        return next(new AppError('You do not have permission to access this course', 403));
      }
    }

    // Get lectures with progress for the user
    let query = `
      SELECT l.*, 
             lp.is_completed,
             lp.progress_seconds
      FROM lectures l
      LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $2
      WHERE l.course_id = $1
    `;

    // For students, only show published lectures
    if (req.user?.role === 'student') {
      query += ' AND l.is_published = true';
    }

    query += ' ORDER BY l.order_index';

    const result = await db.query<LectureRow>(query, [courseId, userId]);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        lectures: result.rows
      }
    });
  } catch (error) {
    logger.error('Get lectures by course error:', error);
    next(error);
  }
};

/**
 * Get lecture by ID
 * @route GET /api/lectures/:id
 */
export const getLectureById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const result = await db.query<LectureRow>(
      `SELECT l.*, c.teacher_id, c.status as course_status,
              lp.is_completed, lp.progress_seconds
       FROM lectures l
       JOIN courses c ON l.course_id = c.id
       LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $2
       WHERE l.id = $1`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Lecture not found', 404));
    }

    const lecture = result.rows[0];

    // Check access permissions
    if (req.user?.role === 'student') {
      // Check if enrolled and lecture is published
      const enrollmentResult = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, lecture.course_id]
      );

      if (enrollmentResult.rows.length === 0) {
        return next(new AppError('You are not enrolled in this course', 403));
      }

      if (!lecture.is_published) {
        return next(new AppError('This lecture is not yet published', 403));
      }
    } else if (req.user?.role === 'teacher' && lecture.teacher_id !== userId) {
      return next(new AppError('You do not have permission to access this lecture', 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        lecture
      }
    });
  } catch (error) {
    logger.error('Get lecture by ID error:', error);
    next(error);
  }
};

/**
 * Update lecture
 * @route PATCH /api/lectures/:id
 */
export const updateLecture = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if lecture exists and user has permission
    const lectureResult = await db.query<LectureRow>(
      'SELECT l.*, c.teacher_id FROM lectures l JOIN courses c ON l.course_id = c.id WHERE l.id = $1',
      [id]
    );
    
    if (lectureResult.rows.length === 0) {
      return next(new AppError('Lecture not found', 404));
    }

    const lecture = lectureResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && lecture.teacher_id !== userId) {
      return next(new AppError('You do not have permission to update this lecture', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to update lectures', 403));
    }

    const { title, description, contentType, contentUrl, orderIndex, duration } = req.body;

    const result = await db.query<LectureRow>(
      `UPDATE lectures 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           content_type = COALESCE($3, content_type),
           content_url = COALESCE($4, content_url),
           order_index = COALESCE($5, order_index),
           duration = COALESCE($6, duration),
           updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [title, description, contentType, contentUrl, orderIndex, duration, id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        lecture: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update lecture error:', error);
    next(error);
  }
};

/**
 * Delete lecture
 * @route DELETE /api/lectures/:id
 */
export const deleteLecture = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if lecture exists and user has permission
    const lectureResult = await db.query<LectureRow>(
      'SELECT l.*, c.teacher_id FROM lectures l JOIN courses c ON l.course_id = c.id WHERE l.id = $1',
      [id]
    );
    
    if (lectureResult.rows.length === 0) {
      return next(new AppError('Lecture not found', 404));
    }

    const lecture = lectureResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && lecture.teacher_id !== userId) {
      return next(new AppError('You do not have permission to delete this lecture', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to delete lectures', 403));
    }

    await db.query('DELETE FROM lectures WHERE id = $1', [id]);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Delete lecture error:', error);
    next(error);
  }
};

/**
 * Publish lecture
 * @route PATCH /api/lectures/:id/publish
 */
export const publishLecture = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if lecture exists and user has permission
    const lectureResult = await db.query<LectureRow>(
      'SELECT l.*, c.teacher_id FROM lectures l JOIN courses c ON l.course_id = c.id WHERE l.id = $1',
      [id]
    );
    
    if (lectureResult.rows.length === 0) {
      return next(new AppError('Lecture not found', 404));
    }

    const lecture = lectureResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && lecture.teacher_id !== userId) {
      return next(new AppError('You do not have permission to publish this lecture', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to publish lectures', 403));
    }

    const result = await db.query<LectureRow>(
      `UPDATE lectures 
       SET is_published = true, updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        lecture: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Publish lecture error:', error);
    next(error);
  }
};

/**
 * Update lecture progress
 * @route POST /api/lectures/:id/progress
 */
export const updateLectureProgress = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { progressSeconds, isCompleted } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Only students can update progress
    if (req.user?.role !== 'student') {
      return next(new AppError('Only students can update lecture progress', 403));
    }

    // Check if lecture exists and user is enrolled
    const lectureResult = await db.query<LectureRow>(
      `SELECT l.*, c.id as course_id
       FROM lectures l
       JOIN courses c ON l.course_id = c.id
       WHERE l.id = $1 AND l.is_published = true`,
      [id]
    );

    if (lectureResult.rows.length === 0) {
      return next(new AppError('Lecture not found or not published', 404));
    }

    const lecture = lectureResult.rows[0];

    // Check enrollment
    const enrollmentResult = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, lecture.course_id]
    );

    if (enrollmentResult.rows.length === 0) {
      return next(new AppError('You are not enrolled in this course', 403));
    }

    // Update or insert lecture progress
    const result = await db.query<ProgressRow>(
      `INSERT INTO lecture_progress (user_id, lecture_id, is_completed, progress_seconds, last_accessed_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id, lecture_id)
       DO UPDATE SET 
         is_completed = $3,
         progress_seconds = $4,
         last_accessed_at = NOW()
       RETURNING *`,
      [userId, id, isCompleted || false, progressSeconds || 0]
    );

    // Update course enrollment progress
    await updateCourseProgress(userId, lecture.course_id as string);

    res.status(200).json({
      status: 'success',
      data: {
        progress: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update lecture progress error:', error);
    next(error);
  }
};

/**
 * Helper function to update course progress
 */
const updateCourseProgress = async (userId: string, courseId: string): Promise<void> => {
  try {
    // Get total lectures count and completed lectures count
    const progressResult = await db.query<{
      total_lectures: string;
      completed_lectures: string;
    }>(
      `SELECT 
         COUNT(l.id) as total_lectures,
         COUNT(CASE WHEN lp.is_completed = true THEN 1 END) as completed_lectures
       FROM lectures l
       LEFT JOIN lecture_progress lp ON l.id = lp.lecture_id AND lp.user_id = $1
       WHERE l.course_id = $2 AND l.is_published = true`,
      [userId, courseId]
    );

    const totalLectures = parseInt(progressResult.rows[0]?.total_lectures || '0');
    const completedLectures = parseInt(progressResult.rows[0]?.completed_lectures || '0');
    const progress = totalLectures > 0 ? Math.round((completedLectures / totalLectures) * 100) : 0;

    // Update enrollment progress
    await db.query(
      `UPDATE enrollments 
       SET progress = $1, 
           last_accessed_at = NOW(),
           completed_at = CASE WHEN $1 = 100 THEN NOW() ELSE NULL END
       WHERE user_id = $2 AND course_id = $3`,
      [progress, userId, courseId]
    );
  } catch (error) {
    logger.error('Update course progress error:', error);
  }
};

export default {
  createLecture,
  getLecturesByCourse,
  getLectureById,
  updateLecture,
  deleteLecture,
  publishLecture,
  updateLectureProgress
};