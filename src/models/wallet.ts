// wallet.model.ts
import { Knex } from 'knex';
import { IWallet } from '../types';

export class WalletModel {
  constructor(private knex: Knex) {}

  async findByUserId(userId: number, trx?: Knex.Transaction): Promise<IWallet | undefined> {
    try {
      const [wallet] = await (trx || this.knex)('wallets')
        .where({ user_id: userId })
        .select('*');
      return wallet;
    } catch (error) {
      console.error(`Error in WalletModel.findByUserId for userId: ${userId}:`, error);
      throw error;
    }
  }
async updateBalance(walletId: number, balance: number, trx?: Knex.Transaction): Promise<void> {
    try {
      const numericBalance = Number(balance);
      console.log(`Preparing to update walletId: ${walletId} with balance: ${numericBalance} (type: ${typeof numericBalance})`);
      const query = (trx || this.knex)('wallets')
        .where({ id: walletId })
        .update({
          balance: numericBalance, // Pass as number directly
          updated_at: this.knex.fn.now(),
        });
      console.log(`Executing update query: ${query.toString()}`);
      const result = await query;
      console.log(`Update result: ${JSON.stringify(result)} (affected rows)`);
      // Verify the actual database state
      const updatedWallet = await (trx || this.knex)('wallets').where({ id: walletId }).first();
      console.log(`Wallet after update: ${JSON.stringify(updatedWallet)}`);
    } catch (error) {
      console.error(`Error in WalletModel.updateBalance for walletId: ${walletId}:`, error);
      throw error;
    }
  }

  async create(userId: number, trx?: Knex.Transaction): Promise<IWallet> {
    try {
      const [wallet] = await (trx || this.knex)('wallets')
        .insert({
          user_id: userId,
          balance: 0,
          created_at: this.knex.fn.now(),
          updated_at: this.knex.fn.now(),
        })
        .returning('*');
      return wallet;
    } catch (error) {
      console.error(`Error in WalletModel.create for userId: ${userId}:`, error);
      throw error;
    }
  }
}