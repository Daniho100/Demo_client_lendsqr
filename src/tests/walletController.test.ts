import { Request, Response } from 'express';
import { WalletController } from '../controllers/walletController';
import { WalletService } from '../services/wallet.service';

jest.mock('../services/walletService');

describe('WalletController', () => {
  let walletController: WalletController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let walletService: WalletService;

  beforeEach(() => {
    walletService = new WalletService({} as any);
    walletController = new WalletController(walletService);
    mockRequest = { body: {}, user: { userId: 1, email: 'test@example.com' } };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  test('should deposit funds successfully', async () => {
    mockRequest.body = { amount: 100 };
    (walletService.deposit as jest.Mock).mockResolvedValue(undefined);

    await walletController.deposit(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Deposit successful' });
  });

  test('should fail deposit with invalid amount', async () => {
    mockRequest.body = { amount: -10 };
    await walletController.deposit(mockRequest as Request, mockResponse as Response);
    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Invalid amount' });
  });
});