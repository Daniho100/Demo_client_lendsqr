// import { Knex } from 'knex';
// import { IWallet } from '../types';

// export class WalletModel {
//   constructor(private knex: Knex) {}

//   async create(userId: number, trx?: Knex.Transaction): Promise<IWallet> {
//     const query = (trx || this.knex)('wallets').insert({ user_id: userId, balance: 0 });
//     const [id] = await query; // MySQL returns the inserted ID
//     const wallet = await (trx || this.knex)('wallets')
//       .where({ id })
//       .select('id', 'user_id', 'balance')
//       .first();
//     if (!wallet) throw new Error('Failed to retrieve created wallet');
//     return wallet;
//   }

//   async findByUserId(userId: number): Promise<IWallet | undefined> {
//     return this.knex('wallets').where({ user_id: userId }).first();
//   }

//   async updateBalance(walletId: number, balance: number): Promise<void> {
//     await this.knex('wallets').where({ id: walletId }).update({ balance });
//   }
// }







// import { Knex } from 'knex';
// import { IWallet } from '../types';

// export class WalletModel {
//   constructor(private knex: Knex) {}

//   async create(userId: number, trx?: Knex.Transaction): Promise<IWallet> {
//     try {
//       console.log(`Inserting wallet for userId: ${userId}`);
//       const [id] = await (trx || this.knex)('wallets').insert({ user_id: userId, balance: 0 });
//       console.log(`Wallet inserted with id: ${id}`);
//       const wallet = await (trx || this.knex)('wallets')
//         .where({ id })
//         .select('id', 'user_id', 'balance')
//         .first();
//       if (!wallet) throw new Error('Failed to retrieve created wallet');
//       console.log(`Retrieved created wallet: ${JSON.stringify(wallet)}`);
//       return wallet;
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in WalletModel.create: ${message}`);
//       throw error;
//     }
//   }

//   async findByUserId(userId: number): Promise<IWallet | undefined> {
//     try {
//       console.log(`Finding wallet by userId: ${userId}`);
//       const wallet = await this.knex('wallets').where({ user_id: userId }).select('id', 'user_id', 'balance').first();
//       console.log(`Wallet found: ${wallet ? JSON.stringify(wallet) : 'not found'}`);
//       return wallet;
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in findByUserId: ${message}`);
//       throw error;
//     }
//   }

//   async updateBalance(walletId: number, balance: number): Promise<void> {
//     try {
//       console.log(`Updating balance for walletId: ${walletId} to ${balance}`);
//       await this.knex('wallets').where({ id: walletId }).update({ balance });
//       console.log(`Balance updated for walletId: ${walletId}`);
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in updateBalance: ${message}`);
//       throw error;
//     }
//   }
// }






import { Knex } from 'knex';
import { IWallet } from '../types';

export class WalletModel {
  constructor(private knex: Knex) {}

  async create(userId: number, trx?: Knex.Transaction): Promise<IWallet> {
    try {
      console.log(`Inserting wallet for userId: ${userId}`);
      const [id] = await (trx || this.knex)('wallets').insert({ user_id: userId, balance: 0 });
      console.log(`Wallet inserted with id: ${id}`);
      const wallet = await (trx || this.knex)('wallets')
        .where({ id })
        .select('id', 'user_id', 'balance')
        .first();
      if (!wallet) throw new Error('Failed to retrieve created wallet');
      console.log(`Retrieved created wallet: ${JSON.stringify(wallet)}`);
      return wallet;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in WalletModel.create: ${message}`);
      throw error;
    }
  }

  async findByUserId(userId: number, trx?: Knex.Transaction): Promise<IWallet | undefined> {
    try {
      console.log(`Finding wallet by userId: ${userId}`);
      const wallet = await (trx || this.knex)('wallets')
        .where({ user_id: userId })
        .select('id', 'user_id', 'balance')
        .first();
      console.log(`Wallet found: ${wallet ? JSON.stringify(wallet) : 'not found'}`);
      return wallet;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in findByUserId: ${message}`);
      throw error;
    }
  }

  async updateBalance(walletId: number, balance: number, trx?: Knex.Transaction): Promise<void> {
    try {
      console.log(`Updating balance for walletId: ${walletId} to ${balance}`);
      await (trx || this.knex)('wallets')
        .where({ id: walletId })
        .update({ balance: this.knex.raw('?', [Number(balance.toFixed(2))]) });
      console.log(`Balance updated for walletId: ${walletId}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in updateBalance: ${message}`);
      throw error;
    }
  }
}