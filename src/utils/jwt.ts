import jwt from 'jsonwebtoken';
import { IJWTPayload } from '../types';

export const generateToken = (payload: IJWTPayload): string => {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '1h' });
};

export const verifyToken = (token: string): IJWTPayload => {
  return jwt.verify(token, process.env.JWT_SECRET!) as IJWTPayload;
};