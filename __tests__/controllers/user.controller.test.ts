import { Request, Response } from 'express';
import { UserController } from '../../src/controllers/userController';
import { UserService } from '../../src/services/user.service';
import { WalletService } from '../../src/services/wallet.service';
import { AppError } from '../../src/utils';
import { Knex } from 'knex';

const mockUserService: Partial<UserService> = {
  createUser: jest.fn(),
  getUserByEmail: jest.fn()
};

const mockWalletService: Partial<WalletService> = {
  createUser: jest.fn()
};

const mockTrx = {} as Knex.Transaction;
const mockKnex = {
  transaction: jest.fn((cb) => cb(mockTrx))
} as unknown as Knex;

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('UserController', () => {
  let controller: UserController;

  beforeEach(() => {
    controller = new UserController(mockKnex, mockUserService as UserService, mockWalletService as WalletService);
  });

  describe('createUser', () => {
    it('should return 400 if missing fields', async () => {
      const req = { body: {} } as Request;
      const res = mockResponse();
      await controller.createUser(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Email, name, and password are required' });
    });

    it('should create user and wallet', async () => {
      const req = { body: { email: 'test@example.com', name: 'Test', password: 'pass' } } as Request;
      const res = mockResponse();
      (mockUserService.createUser as jest.Mock).mockResolvedValue({ id: 1, email: 'test@example.com' });

      await controller.createUser(req, res);

      expect(mockKnex.transaction).toHaveBeenCalled();
      expect(mockUserService.createUser).toHaveBeenCalled();
      expect(mockWalletService.createUser).toHaveBeenCalledWith('test@example.com', 'Test', 1, mockTrx);
      expect(res.status).toHaveBeenCalledWith(201);
    });
  });

  describe('login', () => {
    it('should return 400 if email or password is missing', async () => {
      const req = { body: { email: '' } } as Request;
      const res = mockResponse();
      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 401 for invalid credentials', async () => {
      const req = { body: { email: 'fail@example.com', password: 'wrong' } } as Request;
      const res = mockResponse();
      (mockUserService.getUserByEmail as jest.Mock).mockResolvedValue(null);
      await controller.login(req, res);
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});
