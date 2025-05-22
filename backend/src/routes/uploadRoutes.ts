import { Request, Response, NextFunction } from 'express';
import express from 'express';
import { param } from 'express-validator';
import upload, { uploadImage, uploadDocument, uploadVideo, uploadAvatar, uploadAssignment } from '../middleware/uploadMiddleware';
import { protect } from '../middleware/authMiddleware';
import { validateRequest } from '../middleware/validateRequest';
import path from 'path';
import fs from 'fs';
import config from '../config';
import AppError from '../utils/appError';

const router = express.Router();

/**
 * @route GET /api/upload/:filename
 * @desc Serve uploaded file
 * @access Public
 */
router.get(
  '/:filename',
  [
    param('filename').notEmpty().withMessage('Filename is required'),
    validateRequest
  ],
    (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(config.uploadDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return next(new AppError('File not found', 404));
      }

      // Set appropriate headers
      const ext = path.extname(filename).toLowerCase();
      let contentType = 'application/octet-stream';

      switch (ext) {
        case '.jpg':
        case '.jpeg':
          contentType = 'image/jpeg';
          break;
        case '.png':
          contentType = 'image/png';
          break;
        case '.gif':
          contentType = 'image/gif';
          break;
        case '.pdf':
          contentType = 'application/pdf';
          break;
        case '.mp4':
          contentType = 'video/mp4';
          break;
        case '.txt':
          contentType = 'text/plain';
          break;
      }

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route GET /api/upload/:subfolder/:filename
 * @desc Serve uploaded file from subfolder
 * @access Public
 */
router.get(
  '/:subfolder/:filename',
  [
    param('subfolder').notEmpty().withMessage('Subfolder is required'),
    param('filename').notEmpty().withMessage('Filename is required'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subfolder, filename } = req.params;
      const filePath = path.join(config.uploadDir, subfolder, filename);

      // Security: prevent directory traversal
      const allowedSubfolders = ['images', 'documents', 'videos', 'avatars', 'assignments'];
      if (!allowedSubfolders.includes(subfolder)) {
        return next(new AppError('Invalid subfolder', 400));
      }

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return next(new AppError('File not found', 404));
      }

      // Serve file
      res.sendFile(path.resolve(filePath));
    } catch (error) {
      next(error);
    }
  }
);

// Protected routes - require authentication
router.use(protect);

/**
 * @route POST /api/upload/single
 * @desc Upload single file (general purpose)
 * @access Private
 */
router.post(
  '/single',
  upload.single('file'),
  (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError('No file uploaded', 400));
      }

      const fileUrl = `/api/upload/${req.file.filename}`;

      res.status(200).json({
        status: 'success',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
          uploadedAt: new Date(),
          uploadedBy: req.user?.id
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/upload/multiple
 * @desc Upload multiple files (general purpose)
 * @access Private
 */
router.post(
  '/multiple',
  upload.array('files', 10), // Max 10 files
  (req, res, next) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return next(new AppError('No files uploaded', 400));
      }

      const files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: `/api/upload/${file.filename}`,
        uploadedAt: new Date(),
        uploadedBy: req.user?.id
      }));

      res.status(200).json({
        status: 'success',
        data: {
          files,
          count: files.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/upload/image
 * @desc Upload image file
 * @access Private
 */
router.post(
  '/image',
  uploadImage.single('image'),
  (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError('No image uploaded', 400));
      }

      const imageUrl = `/api/upload/images/${req.file.filename}`;

      res.status(200).json({
        status: 'success',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: imageUrl,
          uploadedAt: new Date()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/upload/document
 * @desc Upload document file
 * @access Private
 */
router.post(
  '/document',
  uploadDocument.single('document'),
  (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError('No document uploaded', 400));
      }

      const documentUrl = `/api/upload/documents/${req.file.filename}`;

      res.status(200).json({
        status: 'success',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: documentUrl,
          uploadedAt: new Date()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/upload/video
 * @desc Upload video file
 * @access Private
 */
router.post(
  '/video',
  uploadVideo.single('video'),
  (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError('No video uploaded', 400));
      }

      const videoUrl = `/api/upload/videos/${req.file.filename}`;

      res.status(200).json({
        status: 'success',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: videoUrl,
          uploadedAt: new Date()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/upload/avatar
 * @desc Upload avatar image
 * @access Private
 */
router.post(
  '/avatar',
  uploadAvatar.single('avatar'),
  (req, res, next) => {
    try {
      if (!req.file) {
        return next(new AppError('No avatar uploaded', 400));
      }

      const avatarUrl = `/api/upload/avatars/${req.file.filename}`;

      res.status(200).json({
        status: 'success',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          url: avatarUrl,
          uploadedAt: new Date()
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route POST /api/upload/assignment
 * @desc Upload assignment file
 * @access Private
 */
router.post(
  '/assignment',
  uploadAssignment.array('files', 5), // Max 5 assignment files
  (req, res, next) => {
    try {
      if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
        return next(new AppError('No assignment files uploaded', 400));
      }

      const files = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        url: `/api/upload/assignments/${file.filename}`,
        uploadedAt: new Date()
      }));

      res.status(200).json({
        status: 'success',
        data: {
          files,
          count: files.length
        }
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/upload/:filename
 * @desc Delete uploaded file
 * @access Private
 */
router.delete(
  '/:filename',
  [
    param('filename').notEmpty().withMessage('Filename is required'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { filename } = req.params;
      const filePath = path.join(config.uploadDir, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return next(new AppError('File not found', 404));
      }

      // Delete file
      fs.unlinkSync(filePath);

      res.status(200).json({
        status: 'success',
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route DELETE /api/upload/:subfolder/:filename
 * @desc Delete uploaded file from subfolder
 * @access Private
 */
router.delete(
  '/:subfolder/:filename',
  [
    param('subfolder').notEmpty().withMessage('Subfolder is required'),
    param('filename').notEmpty().withMessage('Filename is required'),
    validateRequest
  ],
  (req: Request, res: Response, next: NextFunction) => {
    try {
      const { subfolder, filename } = req.params;
      
      // Security: prevent directory traversal
      const allowedSubfolders = ['images', 'documents', 'videos', 'avatars', 'assignments'];
      if (!allowedSubfolders.includes(subfolder)) {
        return next(new AppError('Invalid subfolder', 400));
      }

      const filePath = path.join(config.uploadDir, subfolder, filename);

      // Check if file exists
      if (!fs.existsSync(filePath)) {
        return next(new AppError('File not found', 404));
      }

      // Delete file
      fs.unlinkSync(filePath);

      res.status(200).json({
        status: 'success',
        message: 'File deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;