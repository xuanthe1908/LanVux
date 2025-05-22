// src/controllers/messageController.ts
import { Request, Response, NextFunction } from 'express';
import db from '../db';
import AppError from '../utils/appError';
import logger from '../utils/logger';
import { UserRole } from '@/types';

export interface MessageRequest extends Request {
  body: {
    recipientId: string;
    courseId?: string;
    subject: string;
    content: string;
  };
}

/**
 * Send a message
 * @route POST /api/messages
 */
export const sendMessage = async (req: MessageRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { recipientId, courseId, subject, content } = req.body;
    const senderId = req.user?.id;

    if (!senderId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if recipient exists
    const recipientResult = await db.query('SELECT * FROM users WHERE id = $1', [recipientId]);
    
    if (recipientResult.rows.length === 0) {
      return next(new AppError('Recipient not found', 404));
    }

    // If courseId is provided, check if both users have access to the course
    if (courseId) {
      const courseResult = await db.query('SELECT * FROM courses WHERE id = $1', [courseId]);
      
      if (courseResult.rows.length === 0) {
        return next(new AppError('Course not found', 404));
      }
    }

    const result = await db.query(
      `INSERT INTO messages (sender_id, recipient_id, course_id, subject, content) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [senderId, recipientId, courseId, subject, content]
    );

    res.status(201).json({
      status: 'success',
      data: {
        message: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Send message error:', error);
    next(error);
  }
};

/**
 * Get user's messages
 * @route GET /api/messages
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: UserRole;
  };
}

export const getUserMessages = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { page = '1', limit = '10', type = 'all' } = req.query as any;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);
    let whereClause = '';

    if (type === 'sent') {
      whereClause = 'WHERE m.sender_id = $1';
    } else if (type === 'received') {
      whereClause = 'WHERE m.recipient_id = $1';
    } else {
      whereClause = 'WHERE (m.sender_id = $1 OR m.recipient_id = $1)';
    }

    const query = `
      SELECT m.*, 
             s.first_name as sender_first_name,
             s.last_name as sender_last_name,
             r.first_name as recipient_first_name,
             r.last_name as recipient_last_name,
             c.title as course_title
      FROM messages m
      JOIN users s ON m.sender_id = s.id
      JOIN users r ON m.recipient_id = r.id
      LEFT JOIN courses c ON m.course_id = c.id
      ${whereClause}
      ORDER BY m.created_at DESC
      LIMIT $2 OFFSET $3
    `;

    const result = await db.query(query, [userId, parseInt(limit), offset]);

    res.status(200).json({
      status: 'success',
      results: result.rows.length,
      data: {
        messages: result.rows
      }
    });
  } catch (error) {
    logger.error('Get user messages error:', error);
    next(error);
  }
};

export const markMessageAsRead = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('Authentication required', 401));
    }

    // Check if message exists and user is the recipient
    const messageResult = await db.query('SELECT * FROM messages WHERE id = $1', [id]);
    
    if (messageResult.rows.length === 0) {
      return next(new AppError('Message not found', 404));
    }

    const message = messageResult.rows[0] as { recipient_id: string };

    if (message.recipient_id !== userId) {
      return next(new AppError('You can only mark your own messages as read', 403));
    }

    const result = await db.query(
      'UPDATE messages SET read_at = NOW() WHERE id = $1 RETURNING *',
      [id]
    );

    res.status(200).json({
      status: 'success',
      data: {
        message: result.rows[0]
      }
    });
  } catch (error) {
    logger.error('Mark message as read error:', error);
    next(error);
  }
};

export default {
  sendMessage,
  getUserMessages,
  markMessageAsRead
};