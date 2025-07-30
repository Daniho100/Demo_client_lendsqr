// src/tests/walletController.test.ts
import { Knex } from 'knex';
import { WalletService } from '../services/wallet.service';
import { WalletController } from '../controllers/walletController';
import supertest from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { authMiddleware } from '../middlewares/auth';

jest.mock('knex');
jest.mock('jsonwebtoken');
jest.mock('../services/wallet.service');

describe('WalletController', () => {
  let app: express.Express;
  let walletService: jest.Mocked<WalletService>;
  let walletController: WalletController;
  let mockKnex: jest.Mocked<Knex>;
  let mockToken: string;

  beforeEach(() => {
    // Set JWT_SECRET for tests
    process.env.JWT_SECRET = 'test-secret';

    // Create a mock query builder
    const mockQueryBuilder = {
      select: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      first: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([]),
    };

    mockKnex = jest.fn(() => mockQueryBuilder) as any;
    mockKnex.transaction = jest.fn().mockImplementation((cb) => cb(mockQueryBuilder));

    jest.mock('knex', () => () => mockKnex);
    walletService = new WalletService(mockKnex) as jest.Mocked<WalletService>;
    walletController = new WalletController(walletService);
    app = express();
    app.use(express.json());
    app.use(authMiddleware);
    app.post('/api/wallets/deposit', walletController.deposit);
    app.post('/api/wallets/transfer', walletController.transfer);
    app.post('/api/wallets/withdraw', walletController.withdraw);
    app.get('/api/wallets/balance/:userId', walletController.getBalance);

    mockToken = 'valid_token';
    (jwt.verify as jest.Mock).mockImplementation((token, secret) => {
      if (token === 'valid_token' && secret === 'test-secret') {
        return { userId: 1, email: 'test@example.com' };
      }
      throw new Error('Invalid token');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/wallets/deposit', () => {
    it('should deposit funds successfully', async () => {
      walletService.deposit.mockResolvedValue(undefined);

      const response = await supertest(app)
        .post('/api/wallets/deposit')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ amount: 500 })
        .expect(200);

      expect(response.body).toEqual({ message: 'Deposit successful' });
      expect(walletService.deposit).toHaveBeenCalledWith(1, 500);
    });

    it('should return 401 for missing token', async () => {
      const response = await supertest(app)
        .post('/api/wallets/deposit')
        .send({ amount: 500 })
        .expect(401);

      expect(response.body).toEqual({ message: 'Authorization header with Bearer token is required' });
    });

    it('should return 400 for invalid amount', async () => {
      const response = await supertest(app)
        .post('/api/wallets/deposit')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ amount: -100 })
        .expect(400);

      expect(response.body).toEqual({ message: 'Invalid amount' });
    });
  });

  describe('POST /api/wallets/transfer', () => {
    it('should transfer funds successfully', async () => {
      walletService.transfer.mockResolvedValue(undefined);

      const response = await supertest(app)
        .post('/api/wallets/transfer')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ toEmail: 'mary@gmail.com', amount: 500 })
        .expect(200);

      expect(response.body).toEqual({ message: 'Transfer successful' });
      expect(walletService.transfer).toHaveBeenCalledWith(1, 'mary@gmail.com', 500);
    });

    it('should return 400 for invalid transfer details', async () => {
      const response = await supertest(app)
        .post('/api/wallets/transfer')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ toEmail: 'mary@gmail.com' })
        .expect(400);

      expect(response.body).toEqual({ message: 'Invalid transfer details' });
    });
  });

  describe('POST /api/wallets/withdraw', () => {
    it('should withdraw funds successfully', async () => {
      walletService.withdraw.mockResolvedValue(undefined);

      const response = await supertest(app)
        .post('/api/wallets/withdraw')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ amount: 500 })
        .expect(200);

      expect(response.body).toEqual({ message: 'Withdrawal successful' });
      expect(walletService.withdraw).toHaveBeenCalledWith(1, 500);
    });

    it('should return 400 for invalid amount', async () => {
      const response = await supertest(app)
        .post('/api/wallets/withdraw')
        .set('Authorization', `Bearer ${mockToken}`)
        .send({ amount: -100 })
        .expect(400);

      expect(response.body).toEqual({ message: 'Invalid amount' });
    });
  });

  describe('GET /api/wallets/balance/:userId', () => {
    it('should return balance for authorized user', async () => {
      walletService.getBalance.mockResolvedValue(1000);

      const response = await supertest(app)
        .get('/api/wallets/balance/1')
        .set('Authorization', `Bearer ${mockToken}`)
        .expect(200);

      expect(response.body).toEqual({ balance: 1000 });
      expect(walletService.getBalance).toHaveBeenCalledWith(1);
    });

    it('should return 401 for missing token', async () => {
      const response = await supertest(app)
        .get('/api/wallets/balance/1')
        .expect(401);

      expect(response.body).toEqual({ message: 'Authorization header with Bearer token is required' });
    });
  });
});