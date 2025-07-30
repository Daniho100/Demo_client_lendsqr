import { Request, Response } from 'express';
import { WalletController } from '../../src/controllers/walletController';
import { WalletService } from '../../src/services/wallet.service';
import { AppError } from '../../src/utils';

const mockWalletService = {
  deposit: jest.fn(),
  withdraw: jest.fn(),
  transfer: jest.fn(),
  getBalance: jest.fn()
} as unknown as WalletService;

const controller = new WalletController(mockWalletService);

const mockResponse = () => {
  const res = {} as Response;
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('WalletController', () => {
  afterEach(() => jest.clearAllMocks());

  describe('deposit', () => {
    it('should deposit funds successfully', async () => {
      const req = {
        params: { userId: '1' },
        body: { amount: 100 },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.deposit(req, res);

      expect(mockWalletService.deposit).toHaveBeenCalledWith(1, 100);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Deposit successful' });
    });

    it('should reject unauthorized deposit', async () => {
      const req = {
        params: { userId: '2' },
        body: { amount: 100 },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.deposit(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized deposit attempt' });
    });

    it('should reject invalid amount', async () => {
      const req = {
        params: { userId: '1' },
        body: { amount: 0 },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.deposit(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid amount' });
    });
  });

  describe('withdraw', () => {
    it('should withdraw funds successfully', async () => {
      const req = {
        params: { userId: '1' },
        body: { amount: 50 },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.withdraw(req, res);

      expect(mockWalletService.withdraw).toHaveBeenCalledWith(1, 50);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Withdrawal successful' });
    });

    it('should reject unauthorized withdrawal', async () => {
      const req = {
        params: { userId: '2' },
        body: { amount: 50 },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.withdraw(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized withdrawal attempt' });
    });

    it('should reject invalid amount', async () => {
      const req = {
        params: { userId: '1' },
        body: { amount: 0 },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.withdraw(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid amount' });
    });
  });

  describe('transfer', () => {
    it('should transfer funds successfully', async () => {
      const req = {
        params: { userId: '1' },
        body: { toEmail: 'other@example.com', amount: 20 },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.transfer(req, res);

      expect(mockWalletService.transfer).toHaveBeenCalledWith(1, 'other@example.com', 20);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ message: 'Transfer successful' });
    });

    it('should reject unauthorized transfer', async () => {
      const req = {
        params: { userId: '2' },
        body: { toEmail: 'other@example.com', amount: 20 },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.transfer(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized transfer attempt' });
    });

    it('should reject invalid transfer data', async () => {
      const req = {
        params: { userId: '1' },
        body: { toEmail: '', amount: 0 },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.transfer(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: 'Invalid transfer details' });
    });
  });

  describe('getBalance', () => {
    it('should return user balance', async () => {
      const req = {
        params: { userId: '1' },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      mockWalletService.getBalance = jest.fn().mockResolvedValue(500);

      await controller.getBalance(req, res);

      expect(mockWalletService.getBalance).toHaveBeenCalledWith(1);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({ balance: 500 });
    });

    it('should reject unauthorized balance check', async () => {
      const req = {
        params: { userId: '2' },
        user: { userId: 1 }
      } as unknown as Request;
      const res = mockResponse();

      await controller.getBalance(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized access to wallet' });
    });
  });
});
