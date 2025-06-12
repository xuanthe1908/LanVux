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
import { setupSwagger } from './config/swagger'; // ADD THIS IMPORT

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
import couponRoutes from './routes/couponRouters';
import paymentRoutes from './routes/paymentRouters';

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

// Setup Swagger documentation - ADD THIS LINE
setupSwagger(app);

// API routes with specific rate limiting
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/lectures', lectureRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/ai', aiChatLimiter, aiRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadLimiter, uploadRoutes);
app.use('/api/coupons', couponRoutes);
app.use('/api/payments', paymentRoutes);

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
    node_version: process.version,
    features: {
      payment: config.payment.enabled,
      ai: !!config.openaiApiKey,
      vnpay: !!(config.vnpay.tmnCode && config.vnpay.hashSecret),
      redis: !!config.redisUrl
    }
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
        routes: ['POST /register', 'POST /login', 'POST /logout', 'GET /me', 'PATCH /change-password']
      },
      users: {
        base: '/api/users',
        description: 'User management',
        routes: ['GET /', 'GET /:id', 'PATCH /profile', 'DELETE /:id', 'GET /stats']
      },
      courses: {
        base: '/api/courses',
        description: 'Course management',
        routes: ['GET /', 'POST /', 'GET /:id', 'PATCH /:id', 'DELETE /:id', 'PATCH /:id/publish']
      },
      lectures: {
        base: '/api/lectures',
        description: 'Lecture management',
        routes: ['GET /:id', 'PATCH /:id', 'DELETE /:id', 'POST /:id/progress', 'PATCH /:id/publish']
      },
      enrollments: {
        base: '/api/enrollments',
        description: 'Course enrollments',
        routes: ['GET /', 'POST /:courseId', 'GET /:id', 'DELETE /:id', 'GET /stats']
      },
      assignments: {
        base: '/api/assignments',
        description: 'Assignment management',
        routes: ['GET /:id', 'PATCH /:id', 'DELETE /:id', 'POST /:id/submit', 'PATCH /submissions/:id/grade']
      },
      messages: {
        base: '/api/messages',
        description: 'Internal messaging',
        routes: ['GET /', 'POST /', 'GET /:id', 'PATCH /:id/read', 'POST /:id/reply']
      },
      ai: {
        base: '/api/ai',
        description: 'AI-powered features',
        routes: ['POST /chat', 'POST /generate-quiz', 'POST /extract-concepts', 'POST /generate-feedback']
      },
      categories: {
        base: '/api/categories',
        description: 'Course categories',
        routes: ['GET /', 'POST /', 'GET /:id', 'PATCH /:id', 'DELETE /:id', 'POST /bulk']
      },
      coupons: {
        base: '/api/coupons',
        description: 'Coupon and discount management',
        routes: ['GET /', 'POST /', 'GET /:id', 'PATCH /:id', 'DELETE /:id', 'POST /validate', 'GET /stats']
      },
      payments: {
        base: '/api/payments',
        description: 'Payment processing and management',
        routes: ['POST /create', 'GET /', 'GET /:id', 'GET /vnpay-return', 'GET /stats', 'GET /methods']
      },
      upload: {
        base: '/api/upload',
        description: 'File upload services',
        routes: ['POST /single', 'POST /multiple', 'POST /image', 'POST /document', 'POST /video']
      }
    },
    rateLimit: {
      general: '100 requests per 15 minutes',
      auth: '5 requests per 15 minutes',
      ai: '10 requests per minute',
      upload: '20 requests per 15 minutes'
    },
    features: {
      authentication: 'JWT-based authentication with refresh tokens',
      authorization: 'Role-based access control (student, teacher, admin)',
      fileUpload: 'Multi-format file upload with validation',
      payment: 'VNPay integration for course payments',
      coupons: 'Discount coupon system',
      aiIntegration: 'OpenAI-powered chat and content generation',
      messaging: 'Internal messaging system',
      progress: 'Course and lecture progress tracking',
      assignments: 'Assignment submission and grading',
      categories: 'Course categorization system'
    }
  });
});

// API status endpoint
app.get('/api/status', (req: Request, res: Response) => {
  const services: { [key: string]: string } = {
    database: 'connected',
    uploads: 'available'
  };

  // Check Redis connection
  try {
    services.redis = config.redisUrl ? 'connected' : 'not_configured';
  } catch {
    services.redis = 'disconnected';
  }

  // Check OpenAI
  services.openai = config.openaiApiKey ? 'available' : 'not_configured';

  // Check Payment
  services.payment = config.payment.enabled ? 'enabled' : 'disabled';
  services.vnpay = (config.vnpay.tmnCode && config.vnpay.hashSecret) ? 'configured' : 'not_configured';

  res.status(200).json({
    status: 'success',
    services,
    timestamp: new Date(),
    environment: config.environment
  });
});

// Swagger documentation info
app.get('/api/docs-info', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'success',
    message: 'API Documentation Information',
    documentation: {
      swagger: '/api/docs',
      postman: '/api/docs.json',
      openapi: '3.0.0'
    },
    authentication: {
      type: 'Bearer Token',
      header: 'Authorization: Bearer <token>',
      example: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    },
    testing: {
      baseUrl: config.swagger.serverUrl,
      healthCheck: '/api/health',
      status: '/api/status'
    }
  });
});

// Robots.txt
app.get('/robots.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`User-agent: *
Disallow: /api/
Disallow: /uploads/
Allow: /api/health
Allow: /api/status
Allow: /api/docs`);
});

// Security.txt
app.get('/.well-known/security.txt', (req: Request, res: Response) => {
  res.type('text/plain');
  res.send(`Contact: security@elearning.com
Encryption: https://elearning.com/pgp-key.txt
Acknowledgments: https://elearning.com/security
Policy: https://elearning.com/security-policy
Hiring: https://elearning.com/careers
Expires: 2025-12-31T23:59:59Z`);
});

// Favicon
app.get('/favicon.ico', (req: Request, res: Response) => {
  res.status(204).end();
});

// Sitemap for public routes
app.get('/sitemap.xml', (req: Request, res: Response) => {
  res.type('application/xml');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${config.swagger.serverUrl}/api</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${config.swagger.serverUrl}/api/docs</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${config.swagger.serverUrl}/api/health</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>`);
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

// Handle uncaught exceptions
process.on('uncaughtException', (err: Error) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

export default app;