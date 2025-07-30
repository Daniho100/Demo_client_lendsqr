import { Knex } from 'knex';
import { UserModel } from '../models/user';
import { WalletModel } from '../models/wallet';
import { TransactionModel } from '../models/transaction';
import { AppError } from '../utils';
import { IUser, IWallet } from '../types';
import { UserService } from './user.service';

export class WalletService {
  private userModel: UserModel;
  private walletModel: WalletModel;
  private transactionModel: TransactionModel;
  private userService: UserService;

  constructor(private knex: Knex) {
    this.userModel = new UserModel(knex);
    this.walletModel = new WalletModel(knex);
    this.transactionModel = new TransactionModel(knex);
    this.userService = new UserService(knex);
  }

  async createUser(email: string, name: string, userId: number, trx?: Knex.Transaction): Promise<IWallet> {
    try {
      const wallet = await this.walletModel.create(userId, trx);
      return wallet;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in WalletService.createUser for userId: ${userId}:`, message);
      throw new AppError('Failed to create wallet', 500);
    }
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    return this.userService.getUserByEmail(email);
  }


  async deposit(userId: number, amount: number): Promise<void> {
  if (amount <= 0) throw new AppError('Deposit amount must be positive', 400);
  try {
    await this.knex.transaction(async (trx) => {
      const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId, trx);
      if (!wallet) throw new AppError('Wallet not found', 404);
      const newBalance = Number(wallet.balance) + Number(amount);
      await this.walletModel.updateBalance(wallet.id, newBalance, trx);
      await this.transactionModel.create(
        {
          wallet_id: wallet.id,
          type: 'DEPOSIT',
          amount: Number(amount),
          status: 'COMPLETED',
        },
        trx
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in deposit for userId: ${userId}:`, message);
    throw error;
  }
}


async transfer(fromUserId: number, toEmail: string, amount: number): Promise<void> {
  if (amount <= 0) throw new AppError('Transfer amount must be positive', 400);
  try {
    await this.knex.transaction(async (trx) => {
      const fromWallet: IWallet | undefined = await this.walletModel.findByUserId(fromUserId, trx);
      if (!fromWallet) throw new AppError('Wallet not found', 404);
      if (Number(fromWallet.balance) < amount) throw new AppError('Insufficient funds', 400);
      const toUser = await this.userService.getUserByEmail(toEmail);
      if (!toUser) throw new AppError('Recipient not found', 404);
      const toWallet: IWallet | undefined = await this.walletModel.findByUserId(toUser.id, trx);
      if (!toWallet) throw new AppError('Recipient wallet not found', 404);
      const fromNewBalance = Number(fromWallet.balance) - Number(amount);
      await this.walletModel.updateBalance(fromWallet.id, fromNewBalance, trx);
      const toNewBalance = Number(toWallet.balance) + Number(amount);
      await this.walletModel.updateBalance(toWallet.id, toNewBalance, trx);
      const updatedToWallet = await this.walletModel.findByUserId(toUser.id, trx);
      await this.transactionModel.create(
        {
          wallet_id: fromWallet.id,
          type: 'TRANSFER_SENT',
          amount: Number(amount),
          recipient_wallet_id: toWallet.id,
          status: 'COMPLETED',
        },
        trx
      );
      await this.transactionModel.create(
        {
          wallet_id: fromWallet.id,
          type: 'TRANSFER_RECEIVED',
          amount: Number(amount),
          recipient_wallet_id: toWallet.id,
          status: 'COMPLETED',
        },
        trx
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in transfer from ${fromUserId} to ${toEmail}:`, message);
    throw error;
  }
}

async withdraw(userId: number, amount: number): Promise<void> {
  if (amount <= 0) throw new AppError('Withdrawal amount must be positive', 400);
  try {
    await this.knex.transaction(async (trx) => {
      const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId, trx);
      if (!wallet) throw new AppError('Wallet not found', 404);
      if (wallet.balance < amount) throw new AppError('Insufficient funds', 400);
      await this.walletModel.updateBalance(wallet.id, wallet.balance - amount, trx);
      await this.transactionModel.create(
        {
          wallet_id: wallet.id,
          type: 'WITHDRAWAL',
          amount: Number(amount),
          status: 'COMPLETED',
        },
        trx
      );
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error(`Error in withdraw for userId: ${userId}:`, message);
    throw error;
  }
}

  async getBalance(userId: number): Promise<number> {
    try {
      const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId);
      if (!wallet) throw new AppError('Wallet not found', 404);
      return wallet.balance;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in getBalance for userId: ${userId}:`, message);
      throw error;
    }
  }
}