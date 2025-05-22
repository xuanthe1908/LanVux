// src/middleware/validateRequest.ts - FIXED VERSION
import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError } from 'express-validator';
import AppError from '../utils/appError';

interface ValidationErrorFormatted {
  field: string;
  message: string;
  value?: any;
  location?: string;
}

/**
 * Enhanced validation middleware with better error formatting
 */
const validateRequest = (req: Request, res: Response, next: NextFunction): void | Response => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const formattedErrors: ValidationErrorFormatted[] = errors.array().map((error: ValidationError) => {
      return {
        field: error.type === 'field' ? error.path : 'unknown',
        message: error.msg,
        value: error.type === 'field' ? error.value : undefined,
        location: error.type === 'field' ? error.location : undefined
      };
    });

    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: formattedErrors
    });
  }
  
  next();
};

/**
 * Validation middleware that throws AppError instead of returning response
 * Useful for API consistency
 */
const validateAndThrow = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => {
      const field = error.type === 'field' ? error.path : 'unknown';
      return `${field}: ${error.msg}`;
    }).join(', ');

    return next(new AppError(`Validation failed: ${errorMessages}`, 400));
  }
  
  next();
};

/**
 * Check for additional fields not in validation schema
 */
const checkExtraFields = (allowedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body || typeof req.body !== 'object') {
      return next();
    }

    const extraFields = Object.keys(req.body).filter(field => !allowedFields.includes(field));
    
    if (extraFields.length > 0) {
      return next(new AppError(`Unexpected fields: ${extraFields.join(', ')}`, 400));
    }
    
    next();
  };
};

/**
 * Sanitize request body by removing null and undefined values
 */
const sanitizeBody = (req: Request, res: Response, next: NextFunction): void => {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach(key => {
      if (req.body[key] === null || req.body[key] === undefined || req.body[key] === '') {
        delete req.body[key];
      }
      
      // Trim strings
      if (typeof req.body[key] === 'string') {
        req.body[key] = req.body[key].trim();
      }
    });
  }
  
  next();
};

/**
 * Convert string booleans to actual booleans
 */
const parseBooleans = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      fields.forEach(field => {
        if (req.body[field] !== undefined) {
          if (req.body[field] === 'true' || req.body[field] === true) {
            req.body[field] = true;
          } else if (req.body[field] === 'false' || req.body[field] === false) {
            req.body[field] = false;
          }
        }
      });
    }
    
    next();
  };
};

/**
 * Convert string numbers to actual numbers
 */
const parseNumbers = (fields: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (req.body && typeof req.body === 'object') {
      fields.forEach(field => {
        if (req.body[field] !== undefined && req.body[field] !== '') {
          const num = Number(req.body[field]);
          if (!isNaN(num)) {
            req.body[field] = num;
          }
        }
      });
    }
    
    next();
  };
};

/**
 * Validate file upload requirements
 */
const validateFileUpload = (options: {
  required?: boolean;
  maxSize?: number;
  allowedTypes?: string[];
  maxFiles?: number;
}) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const file = req.file;
    const files = req.files as Express.Multer.File[] | undefined;
    
    // Check if file is required
    if (options.required && !file && (!files || files.length === 0)) {
      return next(new AppError('File upload is required', 400));
    }
    
    // Check file count for multiple uploads
    if (files && options.maxFiles && files.length > options.maxFiles) {
      return next(new AppError(`Maximum ${options.maxFiles} files allowed`, 400));
    }
    
    // Validate single file
    if (file) {
      if (options.maxSize && file.size > options.maxSize) {
        return next(new AppError(`File size must be less than ${options.maxSize} bytes`, 400));
      }
      
      if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
        return next(new AppError(`File type ${file.mimetype} not allowed`, 400));
      }
    }
    
    // Validate multiple files
    if (files) {
      for (const file of files) {
        if (options.maxSize && file.size > options.maxSize) {
          return next(new AppError(`File ${file.originalname} is too large`, 400));
        }
        
        if (options.allowedTypes && !options.allowedTypes.includes(file.mimetype)) {
          return next(new AppError(`File type ${file.mimetype} not allowed for ${file.originalname}`, 400));
        }
      }
    }
    
    next();
  };
};

// Export as default and named exports
export default validateRequest;
export {
  validateRequest,
  validateAndThrow,
  checkExtraFields,
  sanitizeBody,
  parseBooleans,
  parseNumbers,
  validateFileUpload
};