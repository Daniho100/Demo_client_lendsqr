import dotenv from 'dotenv';
import { AppError } from '../utils/error';

dotenv.config();

interface EnvConfig {
  DB_HOST: string;
  DB_USER: string;
  DB_PASSWORD: string;
  DB_NAME: string;
  DB_PORT: string;
  JWT_SECRET: string;
  ADJUTOR_API_KEY: string;
  ADJUTOR_API_URL: string;
  PORT: string;
}

const requiredEnvVars = [
  'DB_HOST',
  'DB_USER',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'ADJUTOR_API_KEY',
  'ADJUTOR_API_URL',
  'PORT'
];

export const loadEnvConfig = (): EnvConfig => {
  const env: Partial<EnvConfig> = {
    DB_HOST: process.env.DB_HOST,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD,
    DB_NAME: process.env.DB_NAME || 'lendsqr_wallet',
    DB_PORT: process.env.DB_PORT || '3306',
    JWT_SECRET: process.env.JWT_SECRET,
    ADJUTOR_API_KEY: process.env.ADJUTOR_API_KEY,
    ADJUTOR_API_URL: process.env.ADJUTOR_API_URL,
    PORT: process.env.PORT || '3000',
  };

  for (const envVar of requiredEnvVars) {
    if (!env[envVar as keyof EnvConfig]) {
      throw new AppError(`Missing required environment variable: ${envVar}`, 500);
    }
  }

  return env as EnvConfig;
};

export const envConfig = loadEnvConfig();