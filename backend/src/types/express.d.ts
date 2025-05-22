import { Request } from 'express';

declare global {
  namespace Express {
    interface User {
      id: string;
      role: 'student' | 'teacher' | 'admin';
    }

    interface Request {
      user?: User;
    }
  }
}
