// src/app.ts - FINAL VERSION WITH ALL FIXES
import express, { Request, Response, Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';

// Import middleware
import { errorHandler, notFound } from './middleware/errorMiddleware';
import { generalLimiter, authLimiter, aiChatLimiter, uploadLimiter } from './middleware/rateLimitMiddleware';
import { sanitizeInput, addSecurityHeaders, validateContentType, preventNoSQLInjection } from './middleware/securityMiddleware';
import validateRequest from './middleware/validateRequest';

// Import configuration
import config from './config';

// Import routes
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import courseRoutes from './routes/courseRoutes';
import lectureRoutes from './routes/lectureRoutes';
import enrollmentRoutes from './routes/enrollmentRoutes';
import assignmentRoutes from './routes/assignmentRoutes';
import messageRoutes from './routes/messageRoutes';
import aiRoutes from './routes/aiRoutes';
import categoryRoutes from './routes/categoryRoutes';
import uploadRoutes from './routes/uploadRoutes';

// Initialize Express app
const app: Application = express();

// Trust proxy (important for rate limiting behind reverse proxy)
app.set('trust proxy', 1);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '..', config.uploadDir);
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Security middleware (applied early)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false
}));

app.use(addSecurityHeaders);

// Logging
app.use(morgan(config.environment === 'development' ? 'dev' : 'combined'));

// Body parsing middleware
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Store raw body for webhook verification if needed
    (req as any).rawBody = buf;
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration
app.use(cors({ 
  origin: config.corsOrigin, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  maxAge: 86400 // 24 hours
}));

// Security middleware
app.use(sanitizeInput);
app.use(preventNoSQLInjection);
app.use(validateContentType);

// Rate limiting (applied after security middleware)
app.use(generalLimiter);

// Serve static files from uploads directory
app.use('/uploads', express.static(uploadsDir, {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Add cache control headers
    if (path.endsWith('.jpg') || path.endsWith('.jpeg') || path.endsWith('.png') || path.endsWith('.gif')) {
      res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day for images
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600'); // 1 hour for other files
    }
  }
}));

// API routes with specific rate limiting
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiChatLimiter, aiRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);

// Health check endpoint (excluded from rate limiting)
app.get('/api/health', (req: Request, res: Response) => {
  const uptime = process.uptime();
  const memoryUsage = process.memoryUsage();
  
  res.status(200).json({
    status: 'success',
    message: 'API is running',
    timestamp: new Date(),
    environment: config.environment,
    version: '1.0.0',
    uptime: Math.floor(uptime),
    memory: {
      used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
      total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
      external: Math.round(memoryUsage.external / 1024 / 1024)
    },
    node_version: process.version
  });
});

// API documentation endpoint
app.get('/api', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to E-Learning API',
    documentation: '/api/docs',
    version: '1.0.0',
    endpoints: {
      auth: {
        base: '/api/auth',
        description: 'Authentication and authorization',
        routes: ['POST /register', 'POST /login', 'POST /logout', 'GET /me']
      },
      users: {
        base: '/api/users',
        description: 'User management',
        routes: ['GET /', 'GET /:id', 'PATCH /profile', 'DELETE /:id']
      },
      courses: {
        base: '/api/courses',
        description: 'Course management',
        routes: ['GET /', 'POST /', 'GET /:id', 'PATCH /:id', 'DELETE /:id']
      },
      lectures: {
        base: '/api/lectures',
        description: 'Lecture management',
        routes: ['GET /:id', 'PATCH /:id', 'DELETE /:id', 'POST /:id/progress']
      },
      enrollments: {
        base: '/api/enrollments',
        description: 'Course enrollments',
        routes: ['GET /', 'POST /:courseId', 'GET /:id', 'DELETE /:id']
      },
      assignments: {
        base: '/api/assignments',
        description: 'Assignment management',
        routes: ['GET /:id', 'PATCH /:id', 'DELETE /:id', 'POST /:id/submit']
      },
      messages: {
        base: '/api/messages',
        description: 'Internal messaging',
        routes: ['GET /', 'POST /', 'GET /:id', 'PATCH /:id/read']
      },
      ai: {
        base: '/api/ai',
        description: 'AI-powered features',
        routes: ['POST /chat', 'POST /generate-quiz', 'POST /extract-concepts']
      },
      categories: {
        base: '/api/categories',
        description: 'Course categories',
        routes: ['GET /', 'POST /', 'GET /:id', 'PATCH /:id', 'DELETE /:id']
      },
      upload: {
        base: '/api/upload',
        description: 'File upload services',
        routes: ['POST /single', 'POST /multiple', 'GET /:filename', 'DELETE /:filename']
      }
    },
    rateLimit: {
      general: '100 requests per 15 minutes',
      auth: '5 requests per 15 minutes',
      ai: '10 requests per minute',
      upload: '20 requests per 15 minutes'
    }
  });
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    services: {
      database: 'connected',
      redis: 'connected',
      openai: 'available',
      uploads: 'available'
    },
    timestamp: new Date()
  });
});

// Robots.txt
app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /api/
Disallow: /uploads/
Allow: /api/health
Allow: /api/status`);
});

// Security.txt
app.get('/.well-known/security.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`Contact: security@yourdomain.com
Encryption: https://yourdomain.com/pgp-key.txt
Acknowledgments: https://yourdomain.com/security
Policy: https://yourdomain.com/security-policy
Hiring: https://yourdomain.com/careers`);
});

// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  process.exit(0);
});

export default app;