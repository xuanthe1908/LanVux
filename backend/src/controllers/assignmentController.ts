// src/controllers/assignmentController.ts - PERFECT VERSION
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

interface AssignmentRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date?: string;
  max_points: number;
  teacher_id: string;
  course_title?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

interface SubmissionRow {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_url?: string;
  submission_text?: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_at?: string;
  max_points: number;
  teacher_id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  [key: string]: any;
}

/**
 * Create a new assignment
 * @route POST /api/courses/:courseId/assignments
 */
export const createAssignment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const { title, description, dueDate, maxPoints } = req.body;
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
      return next(new AppError('You do not have permission to create assignments for this course', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to create assignments', 403));
    }

    const result = await db.query<AssignmentRow>(
      `INSERT INTO assignments (course_id, title, description, due_date, max_points) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [courseId, title, description, dueDate || null, maxPoints]
    );

    const assignment = result.rows[0];

    res.status(201).json({
      status: 'success',
      data: {
        assignment
      }
    });
  } catch (error) {
    logger.error('Create assignment error:', error);
    next(error);
  }
};

/**
 * Get assignments for a course
 * @route GET /api/courses/:courseId/assignments
 */
export const getAssignmentsByCourse = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if course exists
    const courseResult = await db.query<CourseRow>('SELECT * FROM courses WHERE id = $1', [courseId]);
    
    if (courseResult.rows.length === 0) {
      return next(new AppError('Course not found', 404));
    }

    const course = courseResult.rows[0];

    // Check permission
    if (req.user?.role === 'student') {
      // Check if enrolled
      const enrollmentResult = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, courseId]
      );

      if (enrollmentResult.rows.length === 0) {
        return next(new AppError('You are not enrolled in this course', 403));
      }
    } else if (req.user?.role === 'teacher' && course.teacher_id !== userId) {
      return next(new AppError('You do not have permission to access assignments for this course', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to access assignments', 403));
    }

    // Get assignments with submission status for students
    let query = `
      SELECT a.*,
             COUNT(s.id) as submission_count
      FROM assignments a
      LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
      WHERE a.course_id = $1
      GROUP BY a.id
      ORDER BY a.created_at DESC
    `;

    // For students, also get their submission status
    if (req.user?.role === 'student') {
      query = `
        SELECT a.*,
               COUNT(s.id) as submission_count,
               us.id as user_submission_id,
               us.submitted_at,
               us.grade,
               us.feedback
        FROM assignments a
        LEFT JOIN assignment_submissions s ON a.id = s.assignment_id
        LEFT JOIN assignment_submissions us ON a.id = us.assignment_id AND us.user_id = $2
        WHERE a.course_id = $1
        GROUP BY a.id, us.id, us.submitted_at, us.grade, us.feedback
        ORDER BY a.created_at DESC
      `;
    }

    const params = req.user?.role === 'student' ? [courseId, userId] : [courseId];
    const result = await db.query<AssignmentRow>(query, params);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        assignments: result.rows
      }
    });
  } catch (error) {
    logger.error('Get assignments by course error:', error);
    next(error);
  }
};

/**
 * Get assignment by ID
 * @route GET /api/assignments/:id
 */
export const getAssignmentById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const result = await db.query<AssignmentRow>(
      `SELECT a.*, c.teacher_id, c.title as course_title
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('Assignment not found', 404));
    }

    const assignment = result.rows[0];

    // Check permission
    if (req.user?.role === 'student') {
      // Check if enrolled
      const enrollmentResult = await db.query(
        'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
        [userId, assignment.course_id]
      );

      if (enrollmentResult.rows.length === 0) {
        return next(new AppError('You are not enrolled in this course', 403));
      }

      // Get user's submission
      const submissionResult = await db.query<SubmissionRow>(
        'SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND user_id = $2',
        [id, userId]
      );

      (assignment as any).user_submission = submissionResult.rows[0] || null;
    } else if (req.user?.role === 'teacher' && assignment.teacher_id !== userId) {
      return next(new AppError('You do not have permission to access this assignment', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to access assignments', 403));
    }

    // For teachers and admins, get all submissions
    if (req.user?.role === 'teacher' || req.user?.role === 'admin') {
      const submissionsResult = await db.query<SubmissionRow>(
        `SELECT s.*, u.first_name, u.last_name, u.email
         FROM assignment_submissions s
         JOIN users u ON s.user_id = u.id
         WHERE s.assignment_id = $1
         ORDER BY s.submitted_at DESC`,
        [id]
      );

      (assignment as any).submissions = submissionsResult.rows;
    }

    res.status(200).json({
      status: 'success',
      data: {
        assignment
      }
    });
  } catch (error) {
    logger.error('Get assignment by ID error:', error);
    next(error);
  }
};

/**
 * Update assignment
 * @route PATCH /api/assignments/:id
 */
export const updateAssignment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if assignment exists and user has permission
    const assignmentResult = await db.query<AssignmentRow>(
      'SELECT a.*, c.teacher_id FROM assignments a JOIN courses c ON a.course_id = c.id WHERE a.id = $1',
      [id]
    );
    
    if (assignmentResult.rows.length === 0) {
      return next(new AppError('Assignment not found', 404));
    }

    const assignment = assignmentResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && assignment.teacher_id !== userId) {
      return next(new AppError('You do not have permission to update this assignment', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to update assignments', 403));
    }

    const { title, description, dueDate, maxPoints } = req.body;

    const result = await db.query<AssignmentRow>(
      `UPDATE assignments 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           due_date = COALESCE($3, due_date),
           max_points = COALESCE($4, max_points),
           updated_at = NOW()
       WHERE id = $5
       RETURNING *`,
      [title, description, dueDate, maxPoints, id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        assignment: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update assignment error:', error);
    next(error);
  }
};

/**
 * Delete assignment
 * @route DELETE /api/assignments/:id
 */
export const deleteAssignment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if assignment exists and user has permission
    const assignmentResult = await db.query<AssignmentRow>(
      'SELECT a.*, c.teacher_id FROM assignments a JOIN courses c ON a.course_id = c.id WHERE a.id = $1',
      [id]
    );
    
    if (assignmentResult.rows.length === 0) {
      return next(new AppError('Assignment not found', 404));
    }

    const assignment = assignmentResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && assignment.teacher_id !== userId) {
      return next(new AppError('You do not have permission to delete this assignment', 403));
    } else if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to delete assignments', 403));
    }

    await db.query('DELETE FROM assignments WHERE id = $1', [id]);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Delete assignment error:', error);
    next(error);
  }
};

/**
 * Submit assignment
 * @route POST /api/assignments/:id/submit
 */
export const submitAssignment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { submissionUrl, submissionText } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Only students can submit assignments
    if (req.user?.role !== 'student') {
      return next(new AppError('Only students can submit assignments', 403));
    }

    // Check if assignment exists and user is enrolled
    const assignmentResult = await db.query<AssignmentRow>(
      `SELECT a.*, c.id as course_id
       FROM assignments a
       JOIN courses c ON a.course_id = c.id
       WHERE a.id = $1`,
      [id]
    );

    if (assignmentResult.rows.length === 0) {
      return next(new AppError('Assignment not found', 404));
    }

    const assignment = assignmentResult.rows[0];

    // Check enrollment
    const enrollmentResult = await db.query(
      'SELECT * FROM enrollments WHERE user_id = $1 AND course_id = $2',
      [userId, assignment.course_id]
    );

    if (enrollmentResult.rows.length === 0) {
      return next(new AppError('You are not enrolled in this course', 403));
    }

    // Check if assignment is past due date
    if (assignment.due_date && new Date() > new Date(assignment.due_date)) {
      return next(new AppError('Assignment submission deadline has passed', 400));
    }

    // Check if already submitted
    const existingSubmission = await db.query<SubmissionRow>(
      'SELECT * FROM assignment_submissions WHERE assignment_id = $1 AND user_id = $2',
      [id, userId]
    );

    if (existingSubmission.rows.length > 0) {
      // Update existing submission
      const result = await db.query<SubmissionRow>(
        `UPDATE assignment_submissions 
         SET submission_url = $1,
             submission_text = $2,
             submitted_at = NOW()
         WHERE assignment_id = $3 AND user_id = $4
         RETURNING *`,
        [submissionUrl, submissionText, id, userId]
      );

      res.status(200).json({
        status: 'success',
        message: 'Assignment resubmitted successfully',
        data: {
          submission: result.rows[0]
        }
      });
    } else {
      // Create new submission
      const result = await db.query<SubmissionRow>(
        `INSERT INTO assignment_submissions (assignment_id, user_id, submission_url, submission_text) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
        [id, userId, submissionUrl, submissionText]
      );

      res.status(201).json({
        status: 'success',
        message: 'Assignment submitted successfully',
        data: {
          submission: result.rows[0]
        }
      });
    }
  } catch (error) {
    logger.error('Submit assignment error:', error);
    next(error);
  }
};

/**
 * Grade assignment submission
 * @route PATCH /api/submissions/:submissionId/grade
 */
export const gradeSubmission = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Only teachers and admins can grade submissions
    if (req.user?.role !== 'teacher' && req.user?.role !== 'admin') {
      return next(new AppError('You do not have permission to grade submissions', 403));
    }

    // Check if submission exists and user has permission
    const submissionResult = await db.query<SubmissionRow>(
      `SELECT s.*, a.max_points, c.teacher_id
       FROM assignment_submissions s
       JOIN assignments a ON s.assignment_id = a.id
       JOIN courses c ON a.course_id = c.id
       WHERE s.id = $1`,
      [submissionId]
    );

    if (submissionResult.rows.length === 0) {
      return next(new AppError('Submission not found', 404));
    }

    const submission = submissionResult.rows[0];

    // Check permission
    if (req.user?.role === 'teacher' && submission.teacher_id !== userId) {
      return next(new AppError('You do not have permission to grade this submission', 403));
    }

    // Validate grade
    if (grade > submission.max_points) {
      return next(new AppError(`Grade cannot exceed maximum points (${submission.max_points})`, 400));
    }

    const result = await db.query<SubmissionRow>(
      `UPDATE assignment_submissions 
       SET grade = $1,
           feedback = $2,
           graded_at = NOW()
       WHERE id = $3
       RETURNING *`,
      [grade, feedback, submissionId]
    );

    res.status(200).json({
      status: 'success',
      data: {
        submission: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Grade submission error:', error);
    next(error);
  }
};

export default {
  createAssignment,
  getAssignmentsByCourse,
  getAssignmentById,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  gradeSubmission
};