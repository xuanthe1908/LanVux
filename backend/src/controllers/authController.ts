import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import db from '../db';
import config from '../config';
import AppError from '../utils/appError';
import redisService from '../services/redisService';
import { UserRole } from '../types';

interface RegisterRequest extends Request {
  body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role?: UserRole;
  };
}

interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RefreshTokenRequest extends Request {
  body: {
    refreshToken: string;
  };
}

interface ChangePasswordRequest extends Request {
  body: {
    currentPassword: string;
    newPassword: string;
  };
}

const generateToken = (id: string, role: UserRole): string => {
  const options: SignOptions = {
    expiresIn: config.jwtExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ id, role }, config.jwtSecret as string, options);
};

const generateRefreshToken = (id: string): string => {
  const options: SignOptions = {
    expiresIn: config.jwtRefreshExpiresIn as jwt.SignOptions['expiresIn'],
  };
  return jwt.sign({ id }, config.jwtSecret as string, options);
};

export const register = async (req: RegisterRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password, firstName, lastName, role = 'student' } = req.body;

    const existingUser = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return next(new AppError('User with this email already exists', 400));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const userId = uuidv4();

    await db.query(
      'INSERT INTO users (id, email, password, role, first_name, last_name) VALUES ($1, $2, $3, $4, $5, $6)',
      [userId, email, hashedPassword, role, firstName, lastName]
    );

    const result = await db.query(
      'SELECT id, email, role, first_name, last_name FROM users WHERE id = $1',
      [userId]
    );

    const user = result.rows[0];

    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.status(201).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req: LoginRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { email, password } = req.body;

    const result = await db.query(
      'SELECT id, email, password, role, first_name, last_name FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next(new AppError('Invalid email or password', 401));
    }

    const token = generateToken(user.id, user.role);
    const refreshToken = generateRefreshToken(user.id);

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
        },
        token,
        refreshToken,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const refreshToken = async (req: RefreshTokenRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { refreshToken } = req.body;
    const decoded: any = jwt.verify(refreshToken, config.jwtSecret);

    const isBlacklisted = await redisService.getBlacklistedToken(refreshToken);
    if (isBlacklisted) {
      return next(new AppError('Invalid refresh token', 401));
    }

    const result = await db.query('SELECT id, role FROM users WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = result.rows[0];
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      status: 'success',
      data: { token },
    });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid refresh token', 401));
    }
    next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('No token provided', 401));
    }

    try {
      const decoded: any = jwt.verify(token, config.jwtSecret);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);
      await redisService.blacklistToken(token, expiresIn > 0 ? expiresIn : 3600);
    } catch (err: any) {
      if (err instanceof jwt.JsonWebTokenError) {
        return next(new AppError('Invalid token', 401));
      }
      return next(err);
    }

    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError('Authentication required', 401));
    }

    const userId = req.user.id;
    const result = await db.query(
      'SELECT id, email, role, first_name, last_name, profile_picture, bio FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = result.rows[0];

    res.status(200).json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          profilePicture: user.profile_picture,
          bio: user.bio,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req: ChangePasswordRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return next(new AppError('User not found', 404));
    }

    const result = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) {
      return next(new AppError('User not found', 404));
    }

    const user = result.rows[0];
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      return next(new AppError('Current password is incorrect', 401));
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await db.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, userId]);

    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

export default {
  register,
  login,
  refreshToken,
  logout,
  getMe,
  changePassword,
};
