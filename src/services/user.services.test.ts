// src/services/user.service.test.ts
import { Knex } from 'knex';
import { UserService } from './user.service';
import { UserModel } from '../models/user';
import { ICreateUserRequest, IUser } from '../types';
import bcrypt from 'bcryptjs';
import { checkKarmaBlacklist } from '../utils/adjutor';

jest.mock('knex');
jest.mock('bcryptjs');
jest.mock('../utils/adjutor');

describe('UserService', () => {
  let userService: UserService;
  let mockKnex: jest.Mocked<Knex>;

  beforeEach(() => {
    mockKnex = {
      transaction: jest.fn().mockImplementation((cb) => cb(mockKnex)),
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    } as any;
    jest.mock('knex', () => () => mockKnex);
    userService = new UserService(mockKnex);
    (bcrypt.hash as jest.Mock).mockImplementation(() => Promise.resolve('$2b$10$hashedpassword'));
    (checkKarmaBlacklist as jest.Mock).mockResolvedValue(false);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a user successfully', async () => {
      const userRequest: ICreateUserRequest = {
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$10$hashedpassword',
      };

      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$10$hashedpassword',
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.returning.mockResolvedValue([mockUser]);

      const user = await userService.createUser(userRequest.email, userRequest.name, userRequest.password);

      expect(user).toEqual(mockUser);
      expect(mockKnex.insert).toHaveBeenCalledWith({
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$10$hashedpassword',
        created_at: expect.anything(),
        updated_at: expect.anything(),
      });
      expect(checkKarmaBlacklist).toHaveBeenCalledWith('test@example.com');
    });

    it('should throw error if user is blacklisted', async () => {
      (checkKarmaBlacklist as jest.Mock).mockResolvedValue(true);

      await expect(
        userService.createUser('test@example.com', 'Test User', '$2b$10$hashedpassword')
      ).rejects.toThrow('User is blacklisted');
    });

    it('should throw error if user creation fails', async () => {
      mockKnex.returning.mockRejectedValue(new Error('Database error'));

      await expect(
        userService.createUser('test@example.com', 'Test User', '$2b$10$hashedpassword')
      ).rejects.toThrow('Failed to create user');
    });
  });

  describe('getUserByEmail', () => {
    it('should return user by email', async () => {
      const mockUser: IUser = {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: '$2b$10$hashedpassword',
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.first.mockResolvedValue(mockUser);

      const user = await userService.getUserByEmail('test@example.com');

      expect(user).toEqual(mockUser);
      expect(mockKnex.where).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return undefined if user not found', async () => {
      mockKnex.first.mockResolvedValue(undefined);

      const user = await userService.getUserByEmail('nonexistent@example.com');

      expect(user).toBeUndefined();
      expect(mockKnex.where).toHaveBeenCalledWith({ email: 'nonexistent@example.com' });
    });
  });
});