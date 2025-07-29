import { Request, Response } from 'express';
import { WalletService } from '../services/wallet.service';
import { IDepositRequest, ITransferRequest, IWithdrawRequest, IJWTPayload } from '../types';
import { handleError, AppError } from '../utils';

export class WalletController {
  constructor(private walletService: WalletService) {}

  async deposit(req: Request, res: Response): Promise<void> {
    try {
      const { amount }: IDepositRequest = req.body;
      const user = req.user as IJWTPayload;
      if (!amount || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }
      await this.walletService.deposit(user.userId, amount);
      res.status(200).json({ message: 'Deposit successful' });
    } catch (error) {
      const { message, statusCode } = handleError(error);
      res.status(statusCode).json({ message });
    }
  }

  async transfer(req: Request, res: Response): Promise<void> {
    try {
      const { toEmail, amount }: ITransferRequest = req.body;
      const user = req.user as IJWTPayload; // Line 27
      if (!toEmail || !amount || amount <= 0) {
        throw new AppError('Invalid transfer details', 400);
      }
      await this.walletService.transfer(user.userId, toEmail, amount);
      res.status(200).json({ message: 'Transfer successful' });
    } catch (error) {
      const { message, statusCode } = handleError(error);
      res.status(statusCode).json({ message });
    }
  }

  async withdraw(req: Request, res: Response): Promise<void> {
    try {
      const { amount }: IWithdrawRequest = req.body;
      const user = req.user as IJWTPayload; // Line 42
      if (!amount || amount <= 0) {
        throw new AppError('Invalid amount', 400);
      }
      await this.walletService.withdraw(user.userId, amount);
      res.status(200).json({ message: 'Withdrawal successful' });
    } catch (error) {
      const { message, statusCode } = handleError(error);
      res.status(statusCode).json({ message });
    }
  }

  async getBalance(req: Request, res: Response): Promise<void> {
    try {
      const user = req.user as IJWTPayload;
      const balance = await this.walletService.getBalance(user.userId);
      res.status(200).json({ balance });
    } catch (error) {
      const { message, statusCode } = handleError(error);
      res.status(statusCode).json({ message });
    }
  }
}