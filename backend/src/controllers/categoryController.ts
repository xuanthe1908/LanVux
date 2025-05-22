// src/controllers/categoryController.ts
import { Request, Response, NextFunction } from 'express';
import db from '../db';
import AppError from '../utils/appError';
import logger from '../utils/logger';

interface CategoryRequest extends Request {
  body: {
    name: string;
    description?: string;
  };
}

/**
 * Get all categories
 * @route GET /api/categories
 */
export const getAllCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await db.query(
      `SELECT c.*, COUNT(co.id) as course_count
       FROM categories c
       LEFT JOIN courses co ON c.id = co.category_id
       GROUP BY c.id
       ORDER BY c.name`
    );

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        categories: result.rows
      }
    });
  } catch (error) {
    logger.error('Get all categories error:', error);
    next(error);
  }
};

/**
 * Create category
 * @route POST /api/categories
 */
export const createCategory = async (req: CategoryRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description } = req.body;

    // Check if category already exists
    const existingCategory = await db.query('SELECT * FROM categories WHERE name = $1', [name]);
    
    if (existingCategory.rows.length > 0) {
      return next(new AppError('Category with this name already exists', 400));
    }

    const result = await db.query(
      'INSERT INTO categories (name, description) VALUES ($1, $2) RETURNING *',
      [name, description]
    );

    res.status(201).json({
      status: 'success',
      data: {
        category: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Create category error:', error);
    next(error);
  }
};

/**
 * Update category
 * @route PATCH /api/categories/:id
 */
export const updateCategory = async (req: CategoryRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Check if category exists
    const categoryResult = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    
    if (categoryResult.rows.length === 0) {
      return next(new AppError('Category not found', 404));
    }

    // Check if name already exists (if updating name)
    if (name) {
      const existingCategory = await db.query('SELECT * FROM categories WHERE name = $1 AND id != $2', [name, id]);
      
      if (existingCategory.rows.length > 0) {
        return next(new AppError('Category with this name already exists', 400));
      }
    }

    const result = await db.query(
      `UPDATE categories 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description)
       WHERE id = $3
       RETURNING *`,
      [name, description, id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        category: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Update category error:', error);
    next(error);
  }
};

/**
 * Delete category
 * @route DELETE /api/categories/:id
 */
export const deleteCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if category exists
    const categoryResult = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    
    if (categoryResult.rows.length === 0) {
      return next(new AppError('Category not found', 404));
    }

    // Check if category has courses
    const coursesResult = await db.query('SELECT COUNT(*) FROM courses WHERE category_id = $1', [id]);
    const courseCount = parseInt((coursesResult.rows[0] as { count: string }).count);

    if (courseCount > 0) {
      return next(new AppError('Cannot delete category that has courses. Please reassign or delete courses first.', 400));
    }

    await db.query('DELETE FROM categories WHERE id = $1', [id]);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    logger.error('Delete category error:', error);
    next(error);
  }
};

export default {
  getAllCategories,
  createCategory,
  updateCategory,
  deleteCategory
};