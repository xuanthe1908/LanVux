// src/config/index.ts - Updated for MySQL
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

interface Config {
  environment: string;
  port: number;
  databaseUrl: string;
  database: {
    host: string;
    port: number;
    user: string;
    password: string;
    name: string;
    poolMin: number;
    poolMax: number;
    timeout: number;
    acquireTimeout: number;
  };
  redisUrl: string;
  jwtSecret: string;
  jwtRefreshSecret: string;
  jwtExpiresIn: string;
  jwtRefreshExpiresIn: string;
  openaiApiKey: string;
  openaiModel: string;
  openaiMaxTokens: number;
  corsOrigin: string;
  uploadDir: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  defaultPageSize: number;
  maxPageSize: number;
  logLevel: string;
  cookieSecret: string;
  bcryptSaltRounds: number;
  rateLimit: {
    windowMs: number;
    max: number;
    authMax: number;
    aiMax: number;
    uploadMax: number;
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
  email: {
    from: string;
    serviceApiKey: string;
  };
  storage: {
    type: string;
    path: string;
    maxFileSize: number;
  };
  cache: {
    enabled: boolean;
    ttl: number;
    maxItems: number;
  };
  features: {
    aiEnabled: boolean;
    paymentsEnabled: boolean;
    notificationsEnabled: boolean;
    emailVerificationEnabled: boolean;
    twoFactorAuthEnabled: boolean;
  };
}

const config: Config = {
  environment: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  
  // Database URL (MySQL)
  databaseUrl: process.env.DATABASE_URL || 'mysql://root:@localhost:3306/e_learning',
  
  // Individual MySQL settings (fallback)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    name: process.env.DB_NAME || 'e_learning',
    poolMin: parseInt(process.env.DATABASE_POOL_MIN || '2', 10),
    poolMax: parseInt(process.env.DATABASE_POOL_MAX || '10', 10),
    timeout: parseInt(process.env.DATABASE_TIMEOUT || '60000', 10),
    acquireTimeout: parseInt(process.env.DATABASE_ACQUIRE_TIMEOUT || '60000', 10),
  },
  
  // Redis
  redisUrl: process.env.REDIS_URL || 'redis://localhost:6379',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET || 'your_super_secure_jwt_secret_key_change_this_in_production',
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET || 'your_refresh_token_secret_change_this_in_production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1d',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  // OpenAI
  openaiApiKey: process.env.OPENAI_API_KEY || '',
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4-turbo',
  openaiMaxTokens: parseInt(process.env.OPENAI_MAX_TOKENS || '1024', 10),
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // File Storage
  uploadDir: process.env.UPLOAD_DIR || 'uploads/',
  maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10), // 10MB
  allowedFileTypes: (process.env.ALLOWED_FILE_TYPES || 'jpeg,jpg,png,gif,pdf,doc,docx,mp4,mov,avi,mp3,wav').split(','),
  
  // Pagination
  defaultPageSize: parseInt(process.env.DEFAULT_PAGE_SIZE || '10', 10),
  maxPageSize: parseInt(process.env.MAX_PAGE_SIZE || '100', 10),
  
  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  
  // Security
  cookieSecret: process.env.COOKIE_SECRET || 'your_cookie_secret_change_this_in_production',
  bcryptSaltRounds: parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10),
  
  // Rate Limiting
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '1000', 100),
    authMax: parseInt(process.env.AUTH_RATE_LIMIT_MAX || '5', 10),
    aiMax: parseInt(process.env.AI_RATE_LIMIT_MAX || '10', 10),
    uploadMax: parseInt(process.env.UPLOAD_RATE_LIMIT_MAX || '20', 10),
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
    description: process.env.SWAGGER_DESCRIPTION || 'API documentation for E-Learning platform with MySQL',
    version: process.env.SWAGGER_VERSION || '1.0.0',
    serverUrl: process.env.SWAGGER_SERVER_URL || 'http://localhost:4000'
  },

  // Email Configuration
  email: {
    from: process.env.EMAIL_FROM || 'noreply@elearning.com',
    serviceApiKey: process.env.EMAIL_SERVICE_API_KEY || ''
  },

  // Storage Configuration
  storage: {
    type: process.env.STORAGE_TYPE || 'local',
    path: process.env.STORAGE_PATH || './uploads',
    maxFileSize: parseInt(process.env.STORAGE_MAX_FILE_SIZE || '52428800', 10) // 50MB
  },

  // Cache Configuration
  cache: {
    enabled: process.env.CACHE_ENABLED === 'true',
    ttl: parseInt(process.env.CACHE_TTL || '3600', 10), // 1 hour
    maxItems: parseInt(process.env.CACHE_MAX_ITEMS || '1000', 10)
  },

  // Feature Flags
  features: {
    aiEnabled: process.env.ENABLE_AI_FEATURES !== 'false',
    paymentsEnabled: process.env.ENABLE_PAYMENTS !== 'false',
    notificationsEnabled: process.env.ENABLE_NOTIFICATIONS !== 'false',
    emailVerificationEnabled: process.env.ENABLE_EMAIL_VERIFICATION === 'true',
    twoFactorAuthEnabled: process.env.ENABLE_TWO_FACTOR_AUTH === 'true'
  }
};

// Validation
const validateConfig = (): void => {
  const requiredVars = [
    'JWT_SECRET',
    'JWT_REFRESH_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  // Warn about missing optional but important configs
  if (!config.openaiApiKey && config.environment !== 'test') {
    console.warn('⚠️  Warning: OPENAI_API_KEY is not set. AI features will not work.');
  }

  if (!config.vnpay.tmnCode || !config.vnpay.hashSecret) {
    console.warn('⚠️  Warning: VNPay configuration is incomplete. Payment features will not work.');
  }

  if (!config.redisUrl && config.environment !== 'test') {
    console.warn('⚠️  Warning: Redis is not configured. Caching and session features will be limited.');
  }

  // Validate database URL format
  if (config.databaseUrl && !config.databaseUrl.startsWith('mysql://')) {
    throw new Error('DATABASE_URL must start with mysql:// for MySQL connections');
  }

  // Environment-specific validations
  if (config.environment === 'production') {
    if (config.jwtSecret === 'your_super_secure_jwt_secret_key_change_this_in_production') {
      throw new Error('JWT_SECRET must be changed in production');
    }

    if (config.cookieSecret === 'your_cookie_secret_change_this_in_production') {
      throw new Error('COOKIE_SECRET must be changed in production');
    }

    if (!config.corsOrigin || config.corsOrigin === 'http://localhost:3000') {
      console.warn('⚠️  Warning: CORS_ORIGIN should be set to your production domain');
    }
  }
};

// Run validation
try {
  validateConfig();
} catch (error) {
  console.error('❌ Configuration validation failed:', error);
  process.exit(1);
}

// Log configuration status
if (config.environment === 'development') {
  console.log('📋 Configuration loaded:', {
    environment: config.environment,
    port: config.port,
    database: config.databaseUrl ? 'URL provided' : 'Individual settings',
    redis: config.redisUrl ? 'Configured' : 'Not configured',
    openai: config.openaiApiKey ? 'Configured' : 'Not configured',
    vnpay: (config.vnpay.tmnCode && config.vnpay.hashSecret) ? 'Configured' : 'Not configured',
    features: config.features
  });
}

export default config;