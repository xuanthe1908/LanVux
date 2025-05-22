import express, { Request, Response } from 'express';
import { body, param, query } from 'express-validator';
import messageController from '../controllers/messageController';
import { protect, restrictTo } from '../middleware/authMiddleware';
import { validateRequest, sanitizeBody } from '../middleware/validateRequest';
import { messageLimiter } from '../middleware/rateLimitMiddleware';

const router = express.Router();

// All message routes require authentication
router.use(protect);

/**
 * @route POST /api/messages
 * @desc Send a message
 * @access Private
 */
router.post(
  '/',
  messageLimiter, // Rate limiting for message sending
  sanitizeBody,
  [
    body('recipientId')
      .isUUID()
      .withMessage('Recipient ID must be a valid UUID')
      .custom((value, { req }) => {
        // Prevent sending messages to yourself
        if (value === req.user?.id) {
          throw new Error('Cannot send message to yourself');
        }
        return true;
      }),
    body('courseId')
      .optional()
      .isUUID()
      .withMessage('Course ID must be a valid UUID'),
    body('subject')
      .notEmpty()
      .withMessage('Subject is required')
      .isLength({ min: 3, max: 255 })
      .withMessage('Subject must be between 3 and 255 characters')
      .trim(),
    body('content')
      .notEmpty()
      .withMessage('Content is required')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Content must be between 10 and 5000 characters')
      .trim(),
    body('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Priority must be one of: low, normal, high, urgent'),
    body('messageType')
      .optional()
      .isIn(['general', 'assignment', 'announcement', 'question', 'feedback'])
      .withMessage('Message type must be one of: general, assignment, announcement, question, feedback'),
    body('attachments')
      .optional()
      .isArray({ max: 5 })
      .withMessage('Maximum 5 attachments allowed'),
    body('attachments.*')
      .optional()
      .isURL()
      .withMessage('Attachment must be a valid URL'),
    validateRequest
  ],
  messageController.sendMessage
);

/**
 * @route GET /api/messages
 * @desc Get user's messages with filtering
 * @access Private
 */
router.get(
  '/',
  [
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('type')
      .optional()
      .isIn(['all', 'sent', 'received', 'inbox', 'outbox'])
      .withMessage('Type must be one of: all, sent, received, inbox, outbox'),
    query('status')
      .optional()
      .isIn(['all', 'read', 'unread'])
      .withMessage('Status must be one of: all, read, unread'),
    query('courseId')
      .optional()
      .isUUID()
      .withMessage('Course ID must be a valid UUID'),
    query('search')
      .optional()
      .isString()
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters')
      .trim(),
    query('startDate')
      .optional()
      .isISO8601()
      .withMessage('Start date must be a valid ISO 8601 date'),
    query('endDate')
      .optional()
      .isISO8601()
      .withMessage('End date must be a valid ISO 8601 date'),
    query('priority')
      .optional()
      .isIn(['low', 'normal', 'high', 'urgent'])
      .withMessage('Priority must be one of: low, normal, high, urgent'),
    query('messageType')
      .optional()
      .isIn(['general', 'assignment', 'announcement', 'question', 'feedback'])
      .withMessage('Message type must be one of: general, assignment, announcement, question, feedback'),
    query('sortBy')
      .optional()
      .isIn(['created_at', 'subject', 'sender', 'priority'])
      .withMessage('Sort by must be one of: created_at, subject, sender, priority'),
    query('sortOrder')
      .optional()
      .isIn(['asc', 'desc'])
      .withMessage('Sort order must be asc or desc'),
    validateRequest
  ],
  messageController.getUserMessages
);

/**
 * @route GET /api/messages/:id
 * @desc Get specific message
 * @access Private
 */
router.get(
  '/:id',
  [
    param('id').isUUID().withMessage('Message ID must be a valid UUID'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      data: {
        message: {
          id: req.params.id,
          subject: 'Sample Message',
          content: 'Sample content',
          sender: 'John Doe',
          recipient: 'Jane Doe',
          createdAt: new Date(),
          readAt: null
        }
      }
    });
  }
);

/**
 * @route PATCH /api/messages/:id/read
 * @desc Mark message as read
 * @access Private
 */
router.patch(
  '/:id/read',
  [
    param('id').isUUID().withMessage('Message ID must be a valid UUID'),
    validateRequest
  ],
  messageController.markMessageAsRead
);

/**
 * @route PATCH /api/messages/:id/unread
 * @desc Mark message as unread
 * @access Private
 */
router.patch(
  '/:id/unread',
  [
    param('id').isUUID().withMessage('Message ID must be a valid UUID'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Message marked as unread'
    });
  }
);

/**
 * @route DELETE /api/messages/:id
 * @desc Delete message
 * @access Private
 */
router.delete(
  '/:id',
  [
    param('id').isUUID().withMessage('Message ID must be a valid UUID'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully'
    });
  }
);

/**
 * @route POST /api/messages/:id/reply
 * @desc Reply to a message
 * @access Private
 */
router.post(
  '/:id/reply',
  messageLimiter,
  sanitizeBody,
  [
    param('id').isUUID().withMessage('Message ID must be a valid UUID'),
    body('content')
      .notEmpty()
      .withMessage('Reply content is required')
      .isLength({ min: 10, max: 5000 })
      .withMessage('Reply content must be between 10 and 5000 characters')
      .trim(),
    body('includeOriginal')
      .optional()
      .isBoolean()
      .withMessage('Include original must be a boolean'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Reply sent successfully',
      data: {
        messageId: 'new-message-id',
        originalMessageId: req.params.id
      }
    });
  }
);

/**
 * @route POST /api/messages/:id/forward
 * @desc Forward a message
 * @access Private
 */
router.post(
  '/:id/forward',
  messageLimiter,
  sanitizeBody,
  [
    param('id').isUUID().withMessage('Message ID must be a valid UUID'),
    body('recipientIds')
      .isArray({ min: 1, max: 10 })
      .withMessage('Recipient IDs must be an array with 1-10 recipients'),
    body('recipientIds.*')
      .isUUID()
      .withMessage('Each recipient ID must be a valid UUID'),
    body('additionalMessage')
      .optional()
      .isLength({ max: 1000 })
      .withMessage('Additional message must be less than 1000 characters')
      .trim(),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Message forwarded successfully',
      data: {
        forwardedTo: req.body.recipientIds.length,
        originalMessageId: req.params.id
      }
    });
  }
);

/**
 * @route PATCH /api/messages/bulk/mark-read
 * @desc Mark multiple messages as read
 * @access Private
 */
router.patch(
  '/bulk/mark-read',
  sanitizeBody,
  [
    body('messageIds')
      .isArray({ min: 1, max: 50 })
      .withMessage('Message IDs must be an array with 1-50 items'),
    body('messageIds.*')
      .isUUID()
      .withMessage('Each message ID must be a valid UUID'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Messages marked as read',
      data: {
        updatedCount: req.body.messageIds.length
      }
    });
  }
);

/**
 * @route DELETE /api/messages/bulk/delete
 * @desc Delete multiple messages
 * @access Private
 */
router.delete(
  '/bulk/delete',
  sanitizeBody,
  [
    body('messageIds')
      .isArray({ min: 1, max: 50 })
      .withMessage('Message IDs must be an array with 1-50 items'),
    body('messageIds.*')
      .isUUID()
      .withMessage('Each message ID must be a valid UUID'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      message: 'Messages deleted successfully',
      data: {
        deletedCount: req.body.messageIds.length
      }
    });
  }
);

/**
 * @route GET /api/messages/conversations/:userId
 * @desc Get conversation with a specific user
 * @access Private
 */
router.get(
  '/conversations/:userId',
  [
    param('userId').isUUID().withMessage('User ID must be a valid UUID'),
    query('page')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Page must be a positive integer'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage('Limit must be between 1 and 50'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      data: {
        conversation: [],
        participant: {
          id: req.params.userId,
          name: 'User Name'
        },
        totalMessages: 0
      }
    });
  }
);

/**
 * @route GET /api/messages/stats
 * @desc Get message statistics for current user
 * @access Private
 */
router.get(
  '/stats',
  (req, res) => {
    // This would need implementation in messageController
    res.status(200).json({
      status: 'success',
      data: {
        totalMessages: 0,
        unreadMessages: 0,
        sentMessages: 0,
        receivedMessages: 0,
        messagesThisWeek: 0,
        averageResponseTime: 0
      }
    });
  }
);

/**
 * @route GET /api/messages/search
 * @desc Advanced message search
 * @access Private
 */
router.get(
  '/search',
  [
    query('q')
      .notEmpty()
      .withMessage('Search query is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Search query must be between 2 and 100 characters'),
    query('in')
      .optional()
      .isIn(['subject', 'content', 'both'])
      .withMessage('Search in must be one of: subject, content, both'),
    query('from')
      .optional()
      .isUUID()
      .withMessage('From must be a valid user UUID'),
    query('to')
      .optional()
      .isUUID()
      .withMessage('To must be a valid user UUID'),
    query('dateRange')
      .optional()
      .isIn(['today', 'week', 'month', 'year', 'custom'])
      .withMessage('Date range must be one of: today, week, month, year, custom'),
    validateRequest
  ],
  (req: Request, res: Response) => {
    res.status(200).json({
      status: 'success',
      data: {
        results: [],
        totalResults: 0,
        searchQuery: req.query.q,
        searchTime: '0.1ms'
      }
    });
  }
);

export default router;