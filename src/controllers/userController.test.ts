// src/controllers/userController.test.ts
import { Knex } from 'knex';
import { UserService } from '../services/user.service';
import { WalletService } from '../services/wallet.service';
import { UserController } from './userController';
import supertest from 'supertest';
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { IWallet, IUser } from '../types';

jest.mock('knex');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('../services/user.service');
jest.mock('../services/wallet.service');

describe('UserController', () => {
  let app: express.Express;
  let userService: jest.Mocked<UserService>;
  let walletService: jest.Mocked<WalletService>;
  let userController: UserController;
  let mockKnex: jest.Mocked<Knex>;

  beforeEach(() => {
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret';

    // Create a mock query builder
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    };

    mockKnex = jest.fn(() => mockQueryBuilder) as any;
    mockKnex.transaction = jest.fn().mockImplementation((cb) => cb(mockQueryBuilder));

    jest.mock('knex', () => () => mockKnex);
    userService = new UserService(mockKnex) as jest.Mocked<UserService>;
    walletService = new WalletService(mockKnex) as jest.Mocked<WalletService>;
    userController = new UserController(mockKnex, userService, walletService);
    app = express();
    app.use(express.json());
    app.post('/api/users', userController.createUser);
    app.post('/api/auth/login', userController.login);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/users', () => {
    it('should create a user successfully', async () => {
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$10$hashedpassword',
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };
      const mockWallet: IWallet = {
        id: 1,
        user_id: 1,
        balance: 0,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      (bcrypt.hash as jest.Mock).mockResolvedValue('$2b$10$hashedpassword');
      userService.createUser.mockResolvedValue(mockUser);
      walletService.createUser.mockResolvedValue(mockWallet);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await supertest(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        })
        .expect(201);

      expect(response.body).toEqual({
        user: mockUser,
        token: 'mock-jwt-token',
      });
      expect(userService.createUser).toHaveBeenCalledWith(
        'test@example.com',
        'Test User',
        '$2b$10$hashedpassword'
      );
      expect(walletService.createUser).toHaveBeenCalledWith('test@example.com', 'Test User', 1);
    });

    it('should return 400 for invalid request', async () => {
      const response = await supertest(app)
        .post('/api/users')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toEqual({ message: 'Email, name, and password are required' });
    });

    it('should handle errors during user creation', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hashing error'));

      const response = await supertest(app)
        .post('/api/users')
        .send({
          email: 'test@example.com',
          name: 'Test User',
          password: 'password123',
        })
        .expect(500);

      expect(response.body).toEqual({ message: 'User creation failed' });
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and return a token', async () => {
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$10$hashedpassword',
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      userService.getUserByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('mock-jwt-token');

      const response = await supertest(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'password123' })
        .expect(200);

      expect(response.body).toEqual({ token: 'mock-jwt-token' });
      expect(userService.getUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(bcrypt.compare).toHaveBeenCalledWith('password123', '$2b$10$hashedpassword');
      expect(jwt.sign).toHaveBeenCalledWith({ userId: 1, email: 'test@example.com' }, 'test-secret', {
        expiresIn: '1h',
      });
    });

    it('should return 401 for invalid credentials', async () => {
      userService.getUserByEmail.mockResolvedValue(undefined);

      const response = await supertest(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'wrongpassword' })
        .expect(401);

      expect(response.body).toEqual({ message: 'Invalid credentials' });
    });

    it('should return 400 for missing email or password', async () => {
      const response = await supertest(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com' })
        .expect(400);

      expect(response.body).toEqual({ message: 'Email and password are required' });
    });
  });
});