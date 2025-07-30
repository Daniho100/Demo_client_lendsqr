import dotenv from 'dotenv';
import { AppError } from '../utils/error';

dotenv.config();

const requiredVars = ['DATABASE_URL', 'PORT', 'JWT_SECRET'];

for (const key of requiredVars) {
  if (!process.env[key]) {
    throw new AppError(`Missing required env var: ${key}`, 500);
  }
}

export const envConfig = {
  databaseUrl: process.env.DATABASE_URL!,
  port: parseInt(process.env.PORT!, 10),
  jwtSecret: process.env.JWT_SECRET!,
};
