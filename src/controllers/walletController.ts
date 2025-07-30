import { Request, Response } from 'express';
import { WalletService } from '../services/wallet.service';
import { IDepositRequest, ITransferRequest, IWithdrawRequest, IJWTPayload } from '../types';
import { handleError, AppError } from '../utils';

export class WalletController {
  constructor(private walletService: WalletService) {}

  async deposit(req: Request, res: Response): Promise<void> {
  try {
    const authUser = req.user as IJWTPayload;
    const { userId } = req.params;
    const { amount }: IDepositRequest = req.body;

    if (Number(userId) !== authUser.userId) {
      throw new AppError('Unauthorized deposit attempt', 403);
    }
    if (!amount || amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    await this.walletService.deposit(authUser.userId, amount);
    res.status(200).json({ message: 'Deposit successful' });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    res.status(statusCode).json({ message });
  }
}

async transfer(req: Request, res: Response): Promise<void> {
  try {
    const authUser = req.user as IJWTPayload;
    const { userId } = req.params;
    const { toEmail, amount }: ITransferRequest = req.body;

    if (Number(userId) !== authUser.userId) {
      throw new AppError('Unauthorized transfer attempt', 403);
    }
    if (!toEmail || !amount || amount <= 0) {
      throw new AppError('Invalid transfer details', 400);
    }

    await this.walletService.transfer(authUser.userId, toEmail, amount);
    res.status(200).json({ message: 'Transfer successful' });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    res.status(statusCode).json({ message });
  }
}

async withdraw(req: Request, res: Response): Promise<void> {
  try {
    const authUser = req.user as IJWTPayload;
    const { userId } = req.params;
    const { amount }: IWithdrawRequest = req.body;

    if (Number(userId) !== authUser.userId) {
      throw new AppError('Unauthorized withdrawal attempt', 403);
    }
    if (!amount || amount <= 0) {
      throw new AppError('Invalid amount', 400);
    }

    await this.walletService.withdraw(authUser.userId, amount);
    res.status(200).json({ message: 'Withdrawal successful' });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    res.status(statusCode).json({ message });
  }
}


  async getBalance(req: Request, res: Response): Promise<void> {
  try {
    const authUser = req.user as IJWTPayload;
    const { userId } = req.params;

    if (Number(userId) !== authUser.userId) {
      throw new AppError('Unauthorized access to wallet', 403);
    }

    const balance = await this.walletService.getBalance(authUser.userId);
    res.status(200).json({ balance });
  } catch (error) {
    const { message, statusCode } = handleError(error);
    res.status(statusCode).json({ message });
  }
}

}