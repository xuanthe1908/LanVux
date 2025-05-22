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
interface UserRow {
  id: string;
  email: string;
  password: string;
  role: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
  [key: string]: any;
}

/**
 * Get all users (admin only)
 * @route GET /api/users
 */
export const getAllUsers = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { page = '1', limit = '10', role, search } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;
    
    let whereClause = '';
    const params: any[] = [limitNum, offset];
    let paramCount = 2;

    if (role) {
      paramCount++;
      whereClause += `WHERE role = $${paramCount}`;
      params.push(role);
    }

    if (search) {
      paramCount++;
      const searchClause = `(first_name ILIKE $${paramCount} OR last_name ILIKE $${paramCount} OR email ILIKE $${paramCount})`;
      whereClause = whereClause ? `${whereClause} AND ${searchClause}` : `WHERE ${searchClause}`;
      params.push(`%${search}%`);
    }

    const query = `
      SELECT id, email, role, first_name, last_name, profile_picture, bio, created_at
      FROM users
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const result = await db.query<UserRow>(query, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM users ${whereClause}`;
    const countResult = await db.query<{ count: string }>(countQuery, params.slice(2));
    const totalUsers = parseInt(countResult.rows[0]?.count || '0');

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      totalPages: Math.ceil(totalUsers / limitNum),
      currentPage: pageNum,
      data: {
        users: result.rows
      }
    });
  } catch (error) {
    logger.error('Get all users error:', error);
    next(error);
  }
};

/**
 * Get user by ID
 * @route GET /api/users/:id
 */
export const getUserById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    const result = await db.query<UserRow>(
      'SELECT id, email, role, first_name, last_name, profile_picture, bio, created_at FROM users WHERE id = $1',
      [id]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      status: 'success',
      data: {
        user: result.rows[0]
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
    const { firstName, lastName, bio, profilePicture } = req.body;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const result = await db.query<UserRow>(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           bio = COALESCE($3, bio),
           profile_picture = COALESCE($4, profile_picture),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, role, first_name, last_name, profile_picture, bio`,
      [firstName, lastName, bio, profilePicture, userId]
    );

    res.status(200).json({
      status: 'success',
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
 * Delete user (admin only)
 * @route DELETE /api/users/:id
 */
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user exists
    const userResult = await db.query<UserRow>('SELECT * FROM users WHERE id = $1', [id]);
    
    if (userResult.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    await db.query('DELETE FROM users WHERE id = $1', [id]);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Delete user error:', error);
    next(error);
  }
};

export default {
  getAllUsers,
  getUserById,
  updateProfile,
  deleteUser
};