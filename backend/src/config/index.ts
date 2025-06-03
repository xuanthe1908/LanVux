import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface Config {
  environment: string;
  port: number;
  databaseUrl: string;
  redisUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  openaiApiKey: string;
  openaiModel: string;
  corsOrigin: string;
  uploadDir: string;
  maxFileSize: number;
  defaultPageSize: number;
  maxPageSize: number;
  logLevel: string;
  cookieSecret: string;
  rateLimit: {
    windowMs: number;
    max: number;
  };
  vnpay: {
    tmnCode: string;
    hashSecret: string;
    url: string;
    returnUrl: string;
    apiUrl: string;
  };
  payment: {
    enabled: boolean;
    currency: string;
    locale: string;
  };
  swagger: {
    title: string;
    description: string;
    version: string;
    serverUrl: string;
  };
}

const config: Config = {
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  
  // Database
  databaseUrl: process.env.DATABASE_URL || '',
  
  // Redis
  redisUrl: process.env.REDIS_URL || '',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'zTLVqLz4aXsYWEbGmE3ZpJ2snKUa0jNt',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || '5MmTDJmCRueB9Kt7VxWApFni3jLGN0oK',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo',
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // File Storage
  uploadDir: process.env.UPLOAD_DIR || 'uploads/',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  
  // Pagination
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Session
  cookieSecret: process.env.COOKIE_SECRET || 'your_cookie_secret',
  
  // Rate Limiting
  rateLimit: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  },

  // VNPay Configuration
  vnpay: {
    tmnCode: process.env.VNPAY_TMN_CODE || '',
    hashSecret: process.env.VNPAY_HASH_SECRET || '',
    url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
    returnUrl: process.env.VNPAY_RETURN_URL || 'http://localhost:3000/payment/vnpay-return',
    apiUrl: process.env.VNPAY_API_URL || 'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction'
  },

  // Payment Configuration
  payment: {
    enabled: process.env.PAYMENT_ENABLED === 'true',
    currency: process.env.PAYMENT_CURRENCY || 'VND',
    locale: process.env.PAYMENT_LOCALE || 'vn'
  },

  // Swagger Configuration
  swagger: {
    title: process.env.SWAGGER_TITLE || 'E-Learning API',
    description: process.env.SWAGGER_DESCRIPTION || 'API documentation for E-Learning platform',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    serverUrl: process.env.SWAGGER_SERVER_URL || 'http://localhost:4000'
  }
};

// Validate required configuration
if (!config.databaseUrl) {
  throw new Error('DATABASE_URL is required');
}

if (!config.openaiApiKey && config.environment !== 'test') {
  console.warn('Warning: OPENAI_API_KEY is not set. AI features will not work.');
}

if (!config.vnpay.tmnCode || !config.vnpay.hashSecret) {
  console.warn('Warning: VNPay configuration is incomplete. Payment features will not work.');
}

export default config;