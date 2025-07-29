// import { Knex } from 'knex';
// import { UserModel } from '../models/user';
// import { WalletModel } from '../models/wallet';
// import { TransactionModel } from '../models/transaction';
// import { AppError } from '../utils';
// import { IUser, IWallet } from '../types';
// import { UserService } from './user.service';

// export class WalletService {
//   private userModel: UserModel;
//   private walletModel: WalletModel;
//   private transactionModel: TransactionModel;
//   private userService: UserService;

//   constructor(private knex: Knex) {
//     this.userModel = new UserModel(knex);
//     this.walletModel = new WalletModel(knex);
//     this.transactionModel = new TransactionModel(knex);
//     this.userService = new UserService(knex);
//   }

//   async createUser(email: string, name: string): Promise<IUser> {
//     try {
//       return await this.knex.transaction(async (trx) => {
//         console.log('Creating user and wallet in transaction');
//         const user = await this.userService.createUser(email, name, trx);
//         console.log('User created:', user);
//         const wallet = await this.walletModel.create(user.id, trx);
//         console.log('Wallet created for user:', user.id, wallet);
//         return user;
//       });
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in WalletService.createUser for ${email}:`, message);
//       throw new AppError('Failed to create user and wallet', 500);
//     }
//   }

//   async getUserByEmail(email: string): Promise<IUser | undefined> {
//     return this.userService.getUserByEmail(email);
//   }

//   async deposit(userId: number, amount: number): Promise<void> {
//     if (amount <= 0) throw new AppError('Deposit amount must be positive', 400);
//     try {
//       await this.knex.transaction(async (trx) => {
//         console.log(`Depositing ${amount} to userId: ${userId}`);
//         const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId);
//         console.log('Wallet found:', wallet);
//         if (!wallet) throw new AppError('Wallet not found', 404);
//         const newBalance = wallet.balance + amount;
//         await this.walletModel.updateBalance(wallet.id, newBalance);
//         console.log(`Balance updated to: ${newBalance}`);
//         await this.transactionModel.create({
//           wallet_id: wallet.id,
//           type: 'DEPOSIT',
//           amount: amount,
//           status: 'COMPLETED',
//         });
//         console.log('Transaction created:', { wallet_id: wallet.id, type: 'DEPOSIT', amount, status: 'COMPLETED' });
//       });
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in deposit for userId: ${userId}:`, message);
//       throw new AppError('Failed to create user and wallet', 500);
//     }
//   }

//   async transfer(fromUserId: number, toEmail: string, amount: number): Promise<void> {
//     if (amount <= 0) throw new AppError('Transfer amount must be positive', 400);
//     try {
//       await this.knex.transaction(async (trx) => {
//         console.log(`Transferring ${amount} from userId: ${fromUserId} to ${toEmail}`);
//         const fromWallet: IWallet | undefined = await this.walletModel.findByUserId(fromUserId);
//         console.log('From wallet:', fromWallet);
//         if (!fromWallet) throw new AppError('Wallet not found', 404);
//         if (fromWallet.balance < amount) throw new AppError('Insufficient funds', 400);
//         const toUser = await this.userService.getUserByEmail(toEmail);
//         console.log('To user:', toUser);
//         if (!toUser) throw new AppError('Recipient not found', 404);
//         const toWallet: IWallet | undefined = await this.walletModel.findByUserId(toUser.id);
//         console.log('To wallet:', toWallet);
//         if (!toWallet) throw new AppError('Recipient wallet not found', 404);
//         await this.walletModel.updateBalance(fromWallet.id, fromWallet.balance - amount);
//         console.log(`From balance updated to: ${fromWallet.balance - amount}`);
//         await this.walletModel.updateBalance(toWallet.id, toWallet.balance + amount);
//         console.log(`To balance updated to: ${toWallet.balance + amount}`);
//         await this.transactionModel.create({
//           wallet_id: fromWallet.id,
//           type: 'TRANSFER_SENT',
//           amount,
//           recipient_wallet_id: toWallet.id,
//           status: 'COMPLETED',
//         });
//         console.log('Transaction created:', { wallet_id: fromWallet.id, type: 'TRANSFER_SENT', amount, recipient_wallet_id: toWallet.id });
//         await this.transactionModel.create({
//           wallet_id: toWallet.id,
//           type: 'TRANSFER_RECEIVED',
//           amount,
//           recipient_wallet_id: fromWallet.id,
//           status: 'COMPLETED',
//         });
//         console.log('Transaction created:', { wallet_id: toWallet.id, type: 'TRANSFER_RECEIVED', amount, recipient_wallet_id: fromWallet.id });
//       });
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in transfer from ${fromUserId} to ${toEmail}:`, message);
//       throw new AppError('Failed to create user and wallet', 500);
//     }
//   }

//   async withdraw(userId: number, amount: number): Promise<void> {
//     if (amount <= 0) throw new AppError('Withdrawal amount must be positive', 400);
//     try {
//       await this.knex.transaction(async (trx) => {
//         console.log(`Withdrawing ${amount} from userId: ${userId}`);
//         const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId);
//         console.log('Wallet found:', wallet);
//         if (!wallet) throw new AppError('Wallet not found', 404);
//         if (wallet.balance < amount) throw new AppError('Insufficient funds', 400);
//         await this.walletModel.updateBalance(wallet.id, wallet.balance - amount);
//         console.log(`Balance updated to: ${wallet.balance - amount}`);
//         await this.transactionModel.create({
//           wallet_id: wallet.id,
//           type: 'WITHDRAWAL',
//           amount,
//           status: 'COMPLETED',
//         });
//         console.log('Transaction created:', { wallet_id: wallet.id, type: 'WITHDRAWAL', amount, status: 'COMPLETED' });
//       });
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in withdrawal for userId: ${userId}:`, message);
//       throw new AppError('Failed to withdraw for user', 500);
     
//     }
//   }

//   async getBalance(userId: number): Promise<number> {
//     try {
//       console.log(`Getting balance for userId: ${userId}`);
//       const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId);
//       console.log('Wallet found:', wallet);
//       if (!wallet) throw new AppError('Wallet not found', 404);
//       return wallet.balance;
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in getBalance for userId: ${userId}:`, message);
//       throw new AppError('Failed to get balance for user', 500);
//     }
//   }
// }
























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
      console.log(`Creating wallet for userId: ${userId}, email: ${email}, name: ${name}`);
      const wallet = await this.walletModel.create(userId, trx);
      console.log('Wallet created:', wallet);
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

  // async deposit(userId: number, amount: number): Promise<void> {
  //   if (amount <= 0) throw new AppError('Deposit amount must be positive', 400);
  //   try {
  //     await this.knex.transaction(async (trx) => {
  //       console.log(`Depositing ${amount} to userId: ${userId}`);
  //       const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId);
  //       console.log('Wallet found:', wallet);
  //       if (!wallet) throw new AppError('Wallet not found', 404);
  //       const newBalance = wallet.balance + amount;
  //       await this.walletModel.updateBalance(wallet.id, newBalance);
  //       console.log(`Balance updated to: ${newBalance}`);
  //       await this.transactionModel.create({
  //         wallet_id: wallet.id,
  //         type: 'DEPOSIT',
  //         amount: amount,
  //         status: 'COMPLETED',
  //       });
  //       console.log('Transaction created:', { wallet_id: wallet.id, type: 'DEPOSIT', amount, status: 'COMPLETED' });
  //     });
  //   } catch (error) {
  //     const message = error instanceof Error ? error.message : 'Unknown error';
  //     console.error(`Error in deposit for userId: ${userId}:`, message);
  //     throw error;
  //   }
  // }



  async deposit(userId: number, amount: number): Promise<void> {
  if (amount <= 0) throw new AppError('Deposit amount must be positive', 400);
  try {
    await this.knex.transaction(async (trx) => {
      console.log(`Depositing ${amount} to userId: ${userId}`);
      const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId, trx);
      console.log('Wallet found:', wallet);
      if (!wallet) throw new AppError('Wallet not found', 404);
      const newBalance = Number(wallet.balance) + Number(amount);
      console.log(`Calculated new balance: ${newBalance} for walletId: ${wallet.id}`);
      await this.walletModel.updateBalance(wallet.id, newBalance, trx);
      console.log(`Balance updated to: ${newBalance}`);
      await this.transactionModel.create(
        {
          wallet_id: wallet.id,
          type: 'DEPOSIT',
          amount: Number(amount),
          status: 'COMPLETED',
        },
        trx
      );
      console.log('Transaction created:', { wallet_id: wallet.id, type: 'DEPOSIT', amount, status: 'COMPLETED' });
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
        console.log(`Transferring ${amount} from userId: ${fromUserId} to ${toEmail}`);
        const fromWallet: IWallet | undefined = await this.walletModel.findByUserId(fromUserId);
        console.log('From wallet:', fromWallet);
        if (!fromWallet) throw new AppError('Wallet not found', 404);
        if (fromWallet.balance < amount) throw new AppError('Insufficient funds', 400);
        const toUser = await this.userService.getUserByEmail(toEmail);
        console.log('To user:', toUser);
        if (!toUser) throw new AppError('Recipient not found', 404);
        const toWallet: IWallet | undefined = await this.walletModel.findByUserId(toUser.id);
        console.log('To wallet:', toWallet);
        if (!toWallet) throw new AppError('Recipient wallet not found', 404);
        await this.walletModel.updateBalance(fromWallet.id, fromWallet.balance - amount);
        console.log(`From balance updated to: ${fromWallet.balance - amount}`);
        await this.walletModel.updateBalance(toWallet.id, toWallet.balance + amount);
        console.log(`To balance updated to: ${toWallet.balance + amount}`);
        await this.transactionModel.create({
          wallet_id: fromWallet.id,
          type: 'TRANSFER_SENT',
          amount,
          recipient_wallet_id: toWallet.id,
          status: 'COMPLETED',
        });
        console.log('Transaction created:', { wallet_id: fromWallet.id, type: 'TRANSFER_SENT', amount, recipient_wallet_id: toWallet.id });
        await this.transactionModel.create({
          wallet_id: toWallet.id,
          type: 'TRANSFER_RECEIVED',
          amount,
          recipient_wallet_id: fromWallet.id,
          status: 'COMPLETED',
        });
        console.log('Transaction created:', { wallet_id: toWallet.id, type: 'TRANSFER_RECEIVED', amount, recipient_wallet_id: fromWallet.id });
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
        console.log(`Withdrawing ${amount} from userId: ${userId}`);
        const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId);
        console.log('Wallet found:', wallet);
        if (!wallet) throw new AppError('Wallet not found', 404);
        if (wallet.balance < amount) throw new AppError('Insufficient funds', 400);
        await this.walletModel.updateBalance(wallet.id, wallet.balance - amount);
        console.log(`Balance updated to: ${wallet.balance - amount}`);
        await this.transactionModel.create({
          wallet_id: wallet.id,
          type: 'WITHDRAWAL',
          amount,
          status: 'COMPLETED',
        });
        console.log('Transaction created:', { wallet_id: wallet.id, type: 'WITHDRAWAL', amount, status: 'COMPLETED' });
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in withdraw for userId: ${userId}:`, message);
      throw error;
    }
  }

  async getBalance(userId: number): Promise<number> {
    try {
      console.log(`Getting balance for userId: ${userId}`);
      const wallet: IWallet | undefined = await this.walletModel.findByUserId(userId);
      console.log('Wallet found:', wallet);
      if (!wallet) throw new AppError('Wallet not found', 404);
      return wallet.balance;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in getBalance for userId: ${userId}:`, message);
      throw error;
    }
  }
}