import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import AppError from '../utils/appError';
import logger from '../utils/logger';

// Types and Interfaces
interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'student' | 'teacher' | 'admin';
  };
}

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
  lecture_count?: string;
  assignment_count?: string;
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

    // Check if course title already exists for this teacher
    const existingCourse = await db.query<CourseRow>(
      'SELECT id FROM courses WHERE teacher_id = ? AND title = ?',
      [teacherId, title]
    );

    if (existingCourse.rows.length > 0) {
      return next(new AppError('You already have a course with this title', 400));
    }

    const courseId = uuidv4();
    const result = await db.query<CourseRow>(
      `INSERT INTO courses (id, title, description, thumbnail_url, teacher_id, price, level, category, category_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft') 
       RETURNING *`,
      [courseId, title, description, thumbnailUrl, teacherId, price, level, category, categoryId]
    );

    const course = result.rows[0];

    logger.info('Course created successfully', {
      courseId: course.id,
      title: course.title,
      teacherId,
      price
    });

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
    const { 
      page = '1', 
      limit = '10', 
      category, 
      level, 
      search, 
      teacher, 
      minPrice, 
      maxPrice,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = "WHERE c.status = 'published'";
    const params: any[] = [limitNum, offset];
    let paramCount = 2;

    // Add filters
    if (category) {
      paramCount++;
      whereClause += ` AND c.category = ?`;
      params.splice(-2, 0, category);
    }

    if (level) {
      paramCount++;
      whereClause += ` AND c.level = ?`;
      params.splice(-2, 0, level);
    }

    if (search) {
      paramCount++;
      whereClause += ` AND (c.title LIKE ? OR c.description LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.splice(-2, 0, searchTerm, searchTerm);
      paramCount++;
    }

    if (teacher) {
      paramCount++;
      whereClause += ` AND c.teacher_id = ?`;
      params.splice(-2, 0, teacher);
    }

    if (minPrice) {
      paramCount++;
      whereClause += ` AND c.price >= ?`;
      params.splice(-2, 0, parseFloat(minPrice as string));
    }

    if (maxPrice) {
      paramCount++;
      whereClause += ` AND c.price <= ?`;
      params.splice(-2, 0, parseFloat(maxPrice as string));
    }

    // Validate and set sorting
    const allowedSortFields = ['title', 'price', 'created_at', 'enrollment_count', 'average_rating'];
    const sortField = allowedSortFields.includes(sortBy as string) ? sortBy : 'created_at';
    const sortDirection = sortOrder === 'asc' ? 'ASC' : 'DESC';

    const query = `
      SELECT c.*, 
             u.first_name as teacher_first_name, 
             u.last_name as teacher_last_name,
             u.email as teacher_email,
             COUNT(DISTINCT e.id) as enrollment_count,
             AVG(r.rating) as average_rating,
             COUNT(DISTINCT r.id) as review_count,
             COUNT(DISTINCT l.id) as lecture_count
      FROM courses c
      LEFT JOIN users u ON c.teacher_id = u.id
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      LEFT JOIN lectures l ON c.id = l.course_id AND l.is_published = true
      ${whereClause}
      GROUP BY c.id, u.first_name, u.last_name, u.email
      ORDER BY ${sortField === 'enrollment_count' ? 'COUNT(DISTINCT e.id)' : 
                 sortField === 'average_rating' ? 'AVG(r.rating)' : 
                 `c.${sortField}`} ${sortDirection}
      LIMIT ? OFFSET ?
    `;

    const result = await db.query<CourseRow>(query, params);

    // Get total count for pagination
    const countQuery = `
      SELECT COUNT(DISTINCT c.id) as count
      FROM courses c 
      LEFT JOIN users u ON c.teacher_id = u.id
      ${whereClause}
    `;
    const countParams = params.slice(0, -2); // Remove LIMIT and OFFSET
    const countResult = await db.query<{ count: string }>(countQuery, countParams);
    const totalCourses = parseInt(countResult.rows[0]?.count || '0');

    // Transform results
    const courses = result.rows.map(course => ({
      ...course,
      enrollmentCount: parseInt(course.enrollment_count || '0'),
      averageRating: parseFloat(course.average_rating || '0'),
      reviewCount: parseInt(course.review_count || '0'),
      lectureCount: parseInt(course.lecture_count || '0'),
      teacher: {
        firstName: course.teacher_first_name,
        lastName: course.teacher_last_name,
        email: course.teacher_email
      }
    }));

    res.status(200).json({
      status: 'success',
      results: courses.length,
      totalPages: Math.ceil(totalCourses / limitNum),
      currentPage: pageNum,
      totalItems: totalCourses,
      data: {
        courses
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
       WHERE c.id = ?
       GROUP BY c.id, u.first_name, u.last_name, u.email, u.bio`,
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = result.rows[0];

    // Check if user has access to unpublished course
    if (course.status !== 'published') {
      if (!req.user || (req.user.role !== 'admin' && course.teacher_id !== req.user.id)) {
        return next(new AppError('Course not found', 404));
      }
    }

    // Get course lectures
    const lecturesResult = await db.query<LectureRow>(
      `SELECT * FROM lectures 
       WHERE course_id = ? ${course.status === 'published' ? 'AND is_published = true' : ''}
       ORDER BY order_index`,
      [id]
    );

    // Get course assignments count
    const assignmentsResult = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM assignments WHERE course_id = ?',
      [id]
    );

    const courseWithDetails = {
      ...course,
      enrollmentCount: parseInt(course.enrollment_count || '0'),
      averageRating: parseFloat(course.average_rating || '0'),
      reviewCount: parseInt(course.review_count || '0'),
      assignmentCount: parseInt(assignmentsResult.rows[0]?.count || '0'),
      teacher: {
        firstName: course.teacher_first_name,
        lastName: course.teacher_last_name,
        email: course.teacher_email,
        bio: course.teacher_bio
      },
      lectures: lecturesResult.rows
    };

    res.status(200).json({
      status: 'success',
      data: {
        course: courseWithDetails
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
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = ?', [id]);
    
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

    // Build dynamic update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (title !== undefined) {
      // Check for duplicate title
      const duplicateResult = await db.query<CourseRow>(
        'SELECT id FROM courses WHERE teacher_id = ? AND title = ? AND id != ?',
        [course.teacher_id, title, id]
      );
      
      if (duplicateResult.rows.length > 0) {
        return next(new AppError('You already have a course with this title', 400));
      }
      
      updateFields.push('title = ?');
      updateValues.push(title);
    }
    
    if (description !== undefined) {
      updateFields.push('description = ?');
      updateValues.push(description);
    }
    
    if (thumbnailUrl !== undefined) {
      updateFields.push('thumbnail_url = ?');
      updateValues.push(thumbnailUrl);
    }
    
    if (price !== undefined) {
      updateFields.push('price = ?');
      updateValues.push(price);
    }
    
    if (level !== undefined) {
      updateFields.push('level = ?');
      updateValues.push(level);
    }
    
    if (category !== undefined) {
      updateFields.push('category = ?');
      updateValues.push(category);
    }
    
    if (categoryId !== undefined) {
      updateFields.push('category_id = ?');
      updateValues.push(categoryId);
    }

    if (updateFields.length === 0) {
      return next(new AppError('No fields to update', 400));
    }

    updateFields.push('updated_at = NOW()');
    updateValues.push(id);

    const query = `UPDATE courses SET ${updateFields.join(', ')} WHERE id = ?`;
    await db.query(query, updateValues);

    // Fetch updated course
    const updatedResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = ?', [id]);

    logger.info('Course updated successfully', {
      courseId: id,
      updatedBy: userId,
      updates: Object.keys(req.body)
    });

    res.status(200).json({
      status: 'success',
      data: {
        course: updatedResult.rows[0]
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
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = ?', [id]);
    
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

    // Check if course has enrollments
    const enrollmentResult = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM enrollments WHERE course_id = ?',
      [id]
    );

    const enrollmentCount = parseInt(enrollmentResult.rows[0]?.count || '0');
    
    if (enrollmentCount > 0) {
      return next(new AppError('Cannot delete course with active enrollments. Archive the course instead.', 400));
    }

    // Delete course and related data in transaction
    await db.transaction(async (connection) => {
      // Delete in correct order due to foreign key constraints
      await connection.query('DELETE FROM assignment_submissions WHERE assignment_id IN (SELECT id FROM assignments WHERE course_id = ?)', [id]);
      await connection.query('DELETE FROM assignments WHERE course_id = ?', [id]);
      await connection.query('DELETE FROM lecture_progress WHERE lecture_id IN (SELECT id FROM lectures WHERE course_id = ?)', [id]);
      await connection.query('DELETE FROM lectures WHERE course_id = ?', [id]);
      await connection.query('DELETE FROM reviews WHERE course_id = ?', [id]);
      await connection.query('DELETE FROM payments WHERE course_id = ?', [id]);
      await connection.query('DELETE FROM courses WHERE id = ?', [id]);
    });

    logger.info('Course deleted successfully', {
      courseId: id,
      courseTitle: course.title,
      deletedBy: userId
    });

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
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = ?', [id]);
    
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

    // Validate course is ready for publishing
    const lectureResult = await db.query<{ count: string }>(
      'SELECT COUNT(*) as count FROM lectures WHERE course_id = ? AND is_published = true',
      [id]
    );

    const lectureCount = parseInt(lectureResult.rows[0]?.count || '0');
    
    if (lectureCount === 0) {
      return next(new AppError('Course must have at least one published lecture before it can be published', 400));
    }

    if (!course.description || course.description.length < 50) {
      return next(new AppError('Course must have a detailed description (at least 50 characters) before it can be published', 400));
    }

    const result = await db.query<CourseRow>(
      `UPDATE courses 
       SET status = 'published', updated_at = NOW()
       WHERE id = ?
       RETURNING *`,
      [id]
    );

    logger.info('Course published successfully', {
      courseId: id,
      courseTitle: course.title,
      publishedBy: userId
    });

    res.status(200).json({
      status: 'success',
      message: 'Course published successfully',
      data: {
        course: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Publish course error:', error);
    next(error);
  }
};

/**
 * Archive course
 * @route PATCH /api/courses/:id/archive
 */
export const archiveCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if course exists and user has permission
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = ?', [id]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = courseResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && course.teacher_id !== userId) {
      return next(new AppError('You do not have permission to archive this course', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to archive courses', 403));
    }

    const result = await db.query<CourseRow>(
      `UPDATE courses 
       SET status = 'archived', updated_at = NOW()
       WHERE id = ?
       RETURNING *`,
      [id]
    );

    logger.info('Course archived successfully', {
      courseId: id,
      courseTitle: course.title,
      archivedBy: userId
    });

    res.status(200).json({
      status: 'success',
      message: 'Course archived successfully',
      data: {
        course: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Archive course error:', error);
    next(error);
  }
};

/**
 * Get current user's courses (for teachers)
 * @route GET /api/courses/my-courses
 */
export const getMyCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = '1', limit = '10', status } = req.query;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user?.role !== 'teacher') {
      return next(new AppError('Only teachers can access this endpoint', 403));
    }

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    let whereClause = 'WHERE c.teacher_id = ?';
    const params: any[] = [userId, limitNum, offset];

    if (status && ['draft', 'published', 'archived'].includes(status as string)) {
      whereClause += ' AND c.status = ?';
      params.splice(1, 0, status);
    }

    const query = `
      SELECT c.*, 
             COUNT(DISTINCT e.id) as enrollment_count,
             COUNT(DISTINCT l.id) as lecture_count,
             COUNT(DISTINCT a.id) as assignment_count,
             AVG(r.rating) as average_rating
      FROM courses c
      LEFT JOIN enrollments e ON c.id = e.course_id
      LEFT JOIN lectures l ON c.id = l.course_id
      LEFT JOIN assignments a ON c.id = a.course_id
      LEFT JOIN reviews r ON c.id = r.course_id
      ${whereClause}
      GROUP BY c.id
      ORDER BY c.updated_at DESC
      LIMIT ? OFFSET ?
    `;

    const result = await db.query<CourseRow>(query, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM courses c ${whereClause}`;
    const countParams = params.slice(0, -2);
    const countResult = await db.query<{ count: string }>(countQuery, countParams);
    const totalCourses = parseInt(countResult.rows[0]?.count || '0');

    const courses = result.rows.map(course => ({
      ...course,
      enrollmentCount: parseInt(course.enrollment_count || '0'),
      lectureCount: parseInt(course.lecture_count || '0'),
      assignmentCount: parseInt(course.assignment_count || '0'),
      averageRating: parseFloat(course.average_rating || '0')
    }));

    res.status(200).json({
      status: 'success',
      results: courses.length,
      totalPages: Math.ceil(totalCourses / limitNum),
      currentPage: pageNum,
      data: {
        courses
      }
    });
  } catch (error) {
    logger.error('Get my courses error:', error);
    next(error);
  }
};

/**
 * Duplicate course
 * @route POST /api/courses/:id/duplicate
 */
export const duplicateCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { newTitle, includeLectures = true, includeAssignments = true } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if original course exists and user has permission
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = ?', [id]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const originalCourse = courseResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && originalCourse.teacher_id !== userId) {
      return next(new AppError('You do not have permission to duplicate this course', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to duplicate courses', 403));
    }

    // Check if new title already exists
    const duplicateTitle = await db.query<CourseRow>(
      'SELECT id FROM courses WHERE teacher_id = ? AND title = ?',
      [userId, newTitle]
    );

    if (duplicateTitle.rows.length > 0) {
      return next(new AppError('You already have a course with this title', 400));
    }

    // Create new course
    const newCourseId = uuidv4();
    const newCourse = await db.query<CourseRow>(
      `INSERT INTO courses (id, title, description, thumbnail_url, teacher_id, price, level, category, category_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft')
       RETURNING *`,
      [
        newCourseId,
        newTitle,
        originalCourse.description,
        originalCourse.thumbnail_url,
        userId, // Always assign to current user
        originalCourse.price,
        originalCourse.level,
        originalCourse.category,
        originalCourse.category_id
      ]
    );

    // Duplicate lectures if requested
    if (includeLectures) {
      const lectures = await db.query<LectureRow>(
        'SELECT * FROM lectures WHERE course_id = ? ORDER BY order_index',
        [id]
      );

      for (const lecture of lectures.rows) {
        const newLectureId = uuidv4();
        await db.query(
          `INSERT INTO lectures (id, course_id, title, description, content_type, content_url, order_index, duration, is_published)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, false)`,
          [
            newLectureId,
            newCourseId,
            lecture.title,
            lecture.description,
            lecture.content_type,
            lecture.content_url,
            lecture.order_index,
            lecture.duration
          ]
        );
      }
    }

    // Duplicate assignments if requested
    if (includeAssignments) {
      const assignments = await db.query(
        'SELECT * FROM assignments WHERE course_id = ? ORDER BY created_at',
        [id]
      );

      for (const assignment of assignments.rows) {
        const newAssignmentId = uuidv4();
        await db.query(
          `INSERT INTO assignments (id, course_id, title, description, due_date, max_points)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            newAssignmentId,
            newCourseId,
            assignment.title,
            assignment.description,
            assignment.due_date,
            assignment.max_points
          ]
        );
      }
    }

    logger.info('Course duplicated successfully', {
      originalCourseId: id,
      newCourseId,
      newTitle,
      duplicatedBy: userId,
      includeLectures,
      includeAssignments
    });

    res.status(201).json({
      status: 'success',
      message: 'Course duplicated successfully',
      data: {
        course: newCourse.rows[0]
      }
    });
  } catch (error) {
    logger.error('Duplicate course error:', error);
    next(error);
  }
};

/**
 * Get course statistics (for teachers and admins)
 * @route GET /api/courses/stats
 */
export const getCourseStats = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { period = '30' } = req.query;
    const periodDays = parseInt(period as string);

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to view course statistics', 403));
    }

    let whereClause = '';
    const params: any[] = [];

    // For teachers, only show stats for their courses
    if (req.user?.role === 'teacher') {
      whereClause = 'WHERE c.teacher_id = ?';
      params.push(userId);
    }

    // Overall course statistics
    const courseStats = await db.query<{
      total_courses: string;
      published_courses: string;
      draft_courses: string;
      archived_courses: string;
      total_enrollments: string;
      total_revenue: string;
      average_rating: string;
      total_lectures: string;
      total_assignments: string;
    }>(
      `SELECT 
         COUNT(DISTINCT c.id) as total_courses,
         COUNT(DISTINCT CASE WHEN c.status = 'published' THEN c.id END) as published_courses,
         COUNT(DISTINCT CASE WHEN c.status = 'draft' THEN c.id END) as draft_courses,
         COUNT(DISTINCT CASE WHEN c.status = 'archived' THEN c.id END) as archived_courses,
         COUNT(DISTINCT e.id) as total_enrollments,
         COALESCE(SUM(CASE WHEN p.payment_status = 'completed' THEN p.amount END), 0) as total_revenue,
         COALESCE(AVG(r.rating), 0) as average_rating,
         COUNT(DISTINCT l.id) as total_lectures,
         COUNT(DISTINCT a.id) as total_assignments
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN payments p ON c.id = p.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       LEFT JOIN lectures l ON c.id = l.course_id
       LEFT JOIN assignments a ON c.id = a.course_id
       ${whereClause}`,
      params
    );

    // Course creation trends
    const creationTrends = await db.query<{
      date: string;
      course_count: string;
      published_count: string;
    }>(
      `SELECT 
         DATE(c.created_at) as date,
         COUNT(c.id) as course_count,
         COUNT(CASE WHEN c.status = 'published' THEN c.id END) as published_count
       FROM courses c
       WHERE c.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ${whereClause ? 'AND c.teacher_id = ?' : ''}
       GROUP BY DATE(c.created_at)
       ORDER BY date DESC`,
      whereClause ? [periodDays, userId] : [periodDays]
    );

    // Enrollment trends
    const enrollmentTrends = await db.query<{
      date: string;
      enrollment_count: string;
      revenue: string;
    }>(
      `SELECT 
         DATE(e.enrolled_at) as date,
         COUNT(e.id) as enrollment_count,
         COALESCE(SUM(p.amount), 0) as revenue
       FROM enrollments e
       JOIN courses c ON e.course_id = c.id
       LEFT JOIN payments p ON e.course_id = p.course_id AND e.user_id = p.user_id AND p.payment_status = 'completed'
       WHERE e.enrolled_at >= DATE_SUB(NOW(), INTERVAL ? DAY) ${whereClause ? 'AND c.teacher_id = ?' : ''}
       GROUP BY DATE(e.enrolled_at)
       ORDER BY date DESC`,
      whereClause ? [periodDays, userId] : [periodDays]
    );

    // Top performing courses
    const topCourses = await db.query<{
      course_id: string;
      course_title: string;
      enrollment_count: string;
      revenue: string;
      average_rating: string;
      completion_rate: string;
    }>(
      `SELECT 
         c.id as course_id,
         c.title as course_title,
         COUNT(DISTINCT e.id) as enrollment_count,
         COALESCE(SUM(p.amount), 0) as revenue,
         COALESCE(AVG(r.rating), 0) as average_rating,
         CASE 
           WHEN COUNT(DISTINCT e.id) > 0 THEN 
             ROUND((COUNT(DISTINCT CASE WHEN e.completed_at IS NOT NULL THEN e.id END) * 100.0 / COUNT(DISTINCT e.id)), 2)
           ELSE 0 
         END as completion_rate
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN payments p ON c.id = p.course_id AND p.payment_status = 'completed'
       LEFT JOIN reviews r ON c.id = r.course_id
       ${whereClause}
       GROUP BY c.id, c.title
       ORDER BY enrollment_count DESC, revenue DESC
       LIMIT 10`,
      params
    );

    // Category performance
    const categoryStats = await db.query<{
      category: string;
      course_count: string;
      enrollment_count: string;
      average_rating: string;
    }>(
      `SELECT 
         c.category,
         COUNT(DISTINCT c.id) as course_count,
         COUNT(DISTINCT e.id) as enrollment_count,
         COALESCE(AVG(r.rating), 0) as average_rating
       FROM courses c
       LEFT JOIN enrollments e ON c.id = e.course_id
       LEFT JOIN reviews r ON c.id = r.course_id
       ${whereClause}
       GROUP BY c.category
       ORDER BY enrollment_count DESC`,
      params
    );

    const stats = courseStats.rows[0];

    res.status(200).json({
      status: 'success',
      data: {
        summary: {
          totalCourses: parseInt(stats.total_courses || '0'),
          publishedCourses: parseInt(stats.published_courses || '0'),
          draftCourses: parseInt(stats.draft_courses || '0'),
          archivedCourses: parseInt(stats.archived_courses || '0'),
          totalEnrollments: parseInt(stats.total_enrollments || '0'),
          totalRevenue: parseFloat(stats.total_revenue || '0'),
          averageRating: parseFloat(stats.average_rating || '0'),
          totalLectures: parseInt(stats.total_lectures || '0'),
          totalAssignments: parseInt(stats.total_assignments || '0')
        },
        trends: {
          courseCreation: creationTrends.rows.map(row => ({
            date: row.date,
            courseCount: parseInt(row.course_count),
            publishedCount: parseInt(row.published_count)
          })),
          enrollments: enrollmentTrends.rows.map(row => ({
            date: row.date,
            enrollmentCount: parseInt(row.enrollment_count),
            revenue: parseFloat(row.revenue)
          }))
        },
        topCourses: topCourses.rows.map(row => ({
          courseId: row.course_id,
          courseTitle: row.course_title,
          enrollmentCount: parseInt(row.enrollment_count),
          revenue: parseFloat(row.revenue),
          averageRating: parseFloat(row.average_rating),
          completionRate: parseFloat(row.completion_rate)
        })),
        categoryPerformance: categoryStats.rows.map(row => ({
          category: row.category,
          courseCount: parseInt(row.course_count),
          enrollmentCount: parseInt(row.enrollment_count),
          averageRating: parseFloat(row.average_rating)
        })),
        period: `${periodDays} days`
      }
    });
  } catch (error) {
    logger.error('Get course stats error:', error);
    next(error);
  }
};

/**
 * Get course reviews
 * @route GET /api/courses/:id/reviews
 */
export const getCourseReviews = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { page = '1', limit = '10', rating } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Check if course exists
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = ?', [id]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    let whereClause = 'WHERE r.course_id = ?';
    const params: any[] = [id, limitNum, offset];

    if (rating) {
      whereClause += ' AND r.rating = ?';
      params.splice(1, 0, parseInt(rating as string));
    }

    const query = `
      SELECT r.*, 
             u.first_name,
             u.last_name,
             u.profile_picture
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
      LIMIT ? OFFSET ?
    `;

    const result = await db.query(query, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) as count FROM reviews r ${whereClause}`;
    const countParams = params.slice(0, -2);
    const countResult = await db.query<{ count: string }>(countQuery, countParams);
    const totalReviews = parseInt(countResult.rows[0]?.count || '0');

    // Get rating distribution
    const ratingDistribution = await db.query<{
      rating: string;
      count: string;
    }>(
      `SELECT rating, COUNT(*) as count
       FROM reviews 
       WHERE course_id = ?
       GROUP BY rating
       ORDER BY rating DESC`,
      [id]
    );

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      totalPages: Math.ceil(totalReviews / limitNum),
      currentPage: pageNum,
      data: {
        reviews: result.rows,
        distribution: ratingDistribution.rows.map(row => ({
          rating: parseInt(row.rating),
          count: parseInt(row.count)
        }))
      }
    });
  } catch (error) {
    logger.error('Get course reviews error:', error);
    next(error);
  }
};

/**
 * Update course status (for admins)
 * @route PATCH /api/courses/:id/status
 */
export const updateCourseStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can update course status', 403));
    }

    const validStatuses = ['draft', 'published', 'archived', 'suspended'];
    if (!validStatuses.includes(status)) {
      return next(new AppError('Invalid status', 400));
    }

    // Check if course exists
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = ?', [id]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = courseResult.rows[0];

    const result = await db.query<CourseRow>(
      `UPDATE courses 
       SET status = ?, updated_at = NOW()
       WHERE id = ?
       RETURNING *`,
      [status, id]
    );

    logger.info('Course status updated by admin', {
      courseId: id,
      courseTitle: course.title,
      oldStatus: course.status,
      newStatus: status,
      reason,
      updatedBy: userId
    });

    res.status(200).json({
      status: 'success',
      message: 'Course status updated successfully',
      data: {
        course: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update course status error:', error);
    next(error);
  }
};

/**
 * Bulk update courses (for admins)
 * @route PATCH /api/courses/bulk
 */
export const bulkUpdateCourses = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseIds, action, value } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    if (req.user?.role !== 'admin') {
      return next(new AppError('Only administrators can perform bulk operations', 403));
    }

    if (!Array.isArray(courseIds) || courseIds.length === 0) {
      return next(new AppError('Course IDs array is required', 400));
    }

    if (courseIds.length > 50) {
      return next(new AppError('Cannot update more than 50 courses at once', 400));
    }

    let query = '';
    let params: any[] = [];
    let successMessage = '';

    switch (action) {
      case 'publish':
        query = 'UPDATE courses SET status = "published", updated_at = NOW() WHERE id IN (?) AND status = "draft"';
        params = [courseIds];
        successMessage = 'Courses published successfully';
        break;
      
      case 'archive':
        query = 'UPDATE courses SET status = "archived", updated_at = NOW() WHERE id IN (?)';
        params = [courseIds];
        successMessage = 'Courses archived successfully';
        break;
      
      case 'change_category':
        if (!value) {
          return next(new AppError('Category value is required', 400));
        }
        query = 'UPDATE courses SET category = ?, updated_at = NOW() WHERE id IN (?)';
        params = [value, courseIds];
        successMessage = `Courses moved to ${value} category successfully`;
        break;
      
      default:
        return next(new AppError('Invalid action', 400));
    }

    const result = await db.query(query, params);

    logger.info('Bulk course update', {
      action,
      courseIds,
      value,
      affectedRows: result.rowCount,
      adminId: userId
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
    logger.error('Bulk update courses error:', error);
    next(error);
  }
};

// Export all controller functions
export default {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  publishCourse,
  archiveCourse,
  getMyCourses,
  duplicateCourse,
  getCourseStats,
  getCourseReviews,
  updateCourseStatus,
  bulkUpdateCourses
};