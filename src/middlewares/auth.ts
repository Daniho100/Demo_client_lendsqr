import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, handleError } from '../utils';
import { IJWTPayload } from '../types';

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Authorization header with Bearer token is required', 401);
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      throw new AppError('Authorization header with Bearer token is required', 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new AppError('JWT secret not configured', 500);
    }

    const payload = jwt.verify(token, secret) as IJWTPayload;
    console.log(`Authenticated user: ${JSON.stringify(payload)}`);
    req.user = payload;
    next();
  } catch (error) {
    const { message, statusCode } = handleError(error);
    console.error(`Auth middleware error: ${message}`);
    res.status(statusCode).json({ message });
  }
};