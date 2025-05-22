import multer from 'multer';
import path from 'path';
import fs from 'fs';
import config from '../config';
import AppError from '../utils/appError';

// Use Express.Request directly to avoid type conflicts
interface MulterRequest extends Express.Request {
  user?: {
    id: string;
    role: "student" | "teacher" | "admin";
  };
}

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), config.uploadDir);
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create subdirectories
const subdirs = ['images', 'documents', 'videos', 'avatars', 'assignments'];
subdirs.forEach(subdir => {
  const subdirPath = path.join(uploadDir, subdir);
  if (!fs.existsSync(subdirPath)) {
    fs.mkdirSync(subdirPath, { recursive: true });
  }
});

// Generate unique filename
const generateFileName = (originalname: string, userId?: string): string => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = path.extname(originalname).toLowerCase();
  const baseName = path.basename(originalname, extension).replace(/[^a-zA-Z0-9]/g, '_');
  
  return `${userId || 'anonymous'}_${baseName}_${timestamp}_${randomString}${extension}`;
};

// Simple file filter
const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Allow common file types
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|mp4|mov|avi|mp3|wav|txt|csv/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new AppError('File type not supported', 400));
  }
};

// Simple storage configuration
const storage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb) => {
    cb(null, uploadDir);
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb) => {
    const userId = (req as MulterRequest).user?.id;
    const filename = generateFileName(file.originalname, userId);
    cb(null, filename);
  }
});

// Create main upload instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: config.maxFileSize || 10 * 1024 * 1024, // 10MB default
    files: 10,
    fields: 20
  },
  fileFilter: fileFilter
});

// Image-specific upload
const imageStorage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb) => {
    cb(null, path.join(uploadDir, 'images'));
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb) => {
    const userId = (req as MulterRequest).user?.id;
    const filename = generateFileName(file.originalname, userId);
    cb(null, filename);
  }
});

const imageFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('image/');

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files are allowed', 400));
  }
};

export const uploadImage = multer({
  storage: imageStorage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5
  },
  fileFilter: imageFilter
});

// Document-specific upload
const documentStorage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb) => {
    cb(null, path.join(uploadDir, 'documents'));
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb) => {
    const userId = (req as MulterRequest).user?.id;
    const filename = generateFileName(file.originalname, userId);
    cb(null, filename);
  }
});

const documentFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /pdf|doc|docx|txt|csv|xls|xlsx|ppt|pptx/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ];

  if (allowedMimes.includes(file.mimetype) && extname) {
    cb(null, true);
  } else {
    cb(new AppError('Only document files are allowed', 400));
  }
};

export const uploadDocument = multer({
  storage: documentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
    files: 5
  },
  fileFilter: documentFilter
});

// Video-specific upload
const videoStorage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb) => {
    cb(null, path.join(uploadDir, 'videos'));
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb) => {
    const userId = (req as MulterRequest).user?.id;
    const filename = generateFileName(file.originalname, userId);
    cb(null, filename);
  }
});

const videoFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /mp4|mov|avi|wmv|flv|webm/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = file.mimetype.startsWith('video/');

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new AppError('Only video files are allowed', 400));
  }
};

export const uploadVideo = multer({
  storage: videoStorage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB
    files: 3
  },
  fileFilter: videoFilter
});

// Avatar-specific upload
const avatarStorage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb) => {
    cb(null, path.join(uploadDir, 'avatars'));
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb) => {
    const userId = (req as MulterRequest).user?.id;
    const filename = generateFileName(file.originalname, userId);
    cb(null, filename);
  }
});

const avatarFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (allowedMimes.includes(file.mimetype) && extname) {
    cb(null, true);
  } else {
    cb(new AppError('Only JPEG, PNG, and WebP images are allowed for avatars', 400));
  }
};

export const uploadAvatar = multer({
  storage: avatarStorage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1
  },
  fileFilter: avatarFilter
});

// Assignment-specific upload
const assignmentStorage = multer.diskStorage({
  destination: (req: Express.Request, file: Express.Multer.File, cb) => {
    cb(null, path.join(uploadDir, 'assignments'));
  },
  filename: (req: Express.Request, file: Express.Multer.File, cb) => {
    const userId = (req as MulterRequest).user?.id;
    const filename = generateFileName(file.originalname, userId);
    cb(null, filename);
  }
});

const assignmentFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /pdf|doc|docx|txt|zip|rar/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const allowedMimes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
    'application/x-zip-compressed',
    'application/x-rar-compressed'
  ];

  if (allowedMimes.includes(file.mimetype) && extname) {
    cb(null, true);
  } else {
    cb(new AppError('Only PDF, DOC, DOCX, TXT, and ZIP files are allowed for assignments', 400));
  }
};

export const uploadAssignment = multer({
  storage: assignmentStorage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
    files: 5
  },
  fileFilter: assignmentFilter
});

// Export default upload instance
export default upload;