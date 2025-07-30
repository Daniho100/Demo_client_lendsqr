// src/services/wallet.service.test.ts
import { Knex } from 'knex';
import { WalletService } from './wallet.service';
import { UserService } from './user.service';
import { IWallet, IUser } from '../types';

jest.mock('knex');
jest.mock('./user.service');

describe('WalletService', () => {
  let walletService: WalletService;
  let userService: jest.Mocked<UserService>;
  let mockKnex: jest.Mocked<Knex>;

  beforeEach(() => {
    // Create a mock query builder that supports Knex method chaining
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    };

    // Mock Knex to return a callable function that returns the query builder
    mockKnex = jest.fn(() => mockQueryBuilder) as any;
    mockKnex.transaction = jest.fn().mockImplementation((cb) => cb(mockQueryBuilder));

    // Override the mock for Knex to ensure it's callable
    jest.mock('knex', () => () => mockKnex);

    userService = new UserService(mockKnex) as jest.Mocked<UserService>;
    walletService = new WalletService(mockKnex);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a wallet for a user', async () => {
      const mockWallet: IWallet = {
        id: 1,
        user_id: 1,
        balance: 0,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.returning.mockResolvedValue([mockWallet]);

      const wallet = await walletService.createUser('test@example.com', 'Test User', 1);

      expect(wallet).toEqual(mockWallet);
      expect(mockKnex.insert).toHaveBeenCalledWith({
        user_id: 1,
        balance: 0,
        created_at: expect.anything(),
        updated_at: expect.anything(),
      });
    });

    it('should throw error if wallet creation fails', async () => {
      mockKnex.returning.mockRejectedValue(new Error('Database error'));

      await expect(walletService.createUser('test@example.com', 'Test User', 1)).rejects.toThrow(
        'Failed to create wallet'
      );
    });
  });

  describe('deposit', () => {
    it('should deposit funds successfully', async () => {
      const mockWallet: IWallet = {
        id: 1,
        user_id: 1,
        balance: 1000,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.first.mockResolvedValue(mockWallet);
      mockKnex.update.mockResolvedValue(1);
      mockKnex.returning.mockResolvedValue([1]);

      await walletService.deposit(1, 500);

      expect(mockKnex.update).toHaveBeenCalledWith({
        balance: 1500,
        updated_at: expect.anything(),
      });
      expect(mockKnex.insert).toHaveBeenCalledWith({
        wallet_id: 1,
        type: 'DEPOSIT',
        amount: 500,
        status: 'COMPLETED',
        created_at: expect.anything(),
        updated_at: expect.anything(),
      });
    });

    it('should throw error if wallet not found', async () => {
      mockKnex.first.mockResolvedValue(undefined);

      await expect(walletService.deposit(1, 500)).rejects.toThrow('Wallet not found');
    });

    it('should throw error for invalid amount', async () => {
      await expect(walletService.deposit(1, 0)).rejects.toThrow('Deposit amount must be positive');
    });
  });

  describe('transfer', () => {
    it('should transfer funds successfully', async () => {
      const fromWallet: IWallet = {
        id: 1,
        user_id: 1,
        balance: 1000,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };
      const toWallet: IWallet = {
        id: 2,
        user_id: 2,
        balance: 0,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };
      const toUser: IUser = {
        id: 2,
        email: 'mary@gmail.com',
        name: 'Mary Jane',
        password: '$2b$10$hashedpassword',
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.first
        .mockResolvedValueOnce(fromWallet)
        .mockResolvedValueOnce(toWallet)
        .mockResolvedValueOnce(toWallet);
      userService.getUserByEmail.mockResolvedValue(toUser);
      mockKnex.update.mockResolvedValue(1);
      mockKnex.returning.mockResolvedValue([1]);

      await walletService.transfer(1, 'mary@gmail.com', 500);

      expect(mockKnex.update).toHaveBeenCalledWith({
        balance: 500,
        updated_at: expect.anything(),
      });
      expect(mockKnex.update).toHaveBeenCalledWith({
        balance: 500,
        updated_at: expect.anything(),
      });
      expect(mockKnex.insert).toHaveBeenCalledTimes(2);
    });

    it('should throw error for insufficient funds', async () => {
      const fromWallet: IWallet = {
        id: 1,
        user_id: 1,
        balance: 100,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.first.mockResolvedValue(fromWallet);

      await expect(walletService.transfer(1, 'mary@gmail.com', 500)).rejects.toThrow('Insufficient funds');
    });

    it('should throw error if recipient not found', async () => {
      const fromWallet: IWallet = {
        id: 1,
        user_id: 1,
        balance: 1000,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.first.mockResolvedValue(fromWallet);
      userService.getUserByEmail.mockResolvedValue(undefined);

      await expect(walletService.transfer(1, 'mary@gmail.com', 500)).rejects.toThrow('Recipient not found');
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds successfully', async () => {
      const mockWallet: IWallet = {
        id: 1,
        user_id: 1,
        balance: 1000,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.first.mockResolvedValue(mockWallet);
      mockKnex.update.mockResolvedValue(1);
      mockKnex.returning.mockResolvedValue([1]);

      await walletService.withdraw(1, 500);

      expect(mockKnex.update).toHaveBeenCalledWith({
        balance: 500,
        updated_at: expect.anything(),
      });
      expect(mockKnex.insert).toHaveBeenCalledWith({
        wallet_id: 1,
        type: 'WITHDRAWAL',
        amount: 500,
        status: 'COMPLETED',
        created_at: expect.anything(),
        updated_at: expect.anything(),
      });
    });

    it('should throw error for insufficient funds', async () => {
      const mockWallet: IWallet = {
        id: 1,
        user_id: 1,
        balance: 100,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.first.mockResolvedValue(mockWallet);

      await expect(walletService.withdraw(1, 500)).rejects.toThrow('Insufficient funds');
    });
  });

  describe('getBalance', () => {
    it('should return the user balance', async () => {
      const mockWallet: IWallet = {
        id: 1,
        user_id: 1,
        balance: 1000,
        created_at: '2025-07-30T16:45:00.000Z',
        updated_at: '2025-07-30T16:45:00.000Z',
      };

      mockKnex.first.mockResolvedValue(mockWallet);

      const balance = await walletService.getBalance(1);

      expect(balance).toBe(1000);
      expect(mockKnex.where).toHaveBeenCalledWith({ user_id: 1 });
    });

    it('should throw error if wallet not found', async () => {
      mockKnex.first.mockResolvedValue(undefined);

      await expect(walletService.getBalance(1)).rejects.toThrow('Wallet not found');
    });
  });
});