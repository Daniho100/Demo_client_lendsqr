// import { Knex } from 'knex';
// import { ITransaction } from '../types';

// export class TransactionModel {
//   constructor(private knex: Knex) {}

//   async create(data: {
//     wallet_id: number;
//     type: ITransaction['type'];
//     amount: number;
//     recipient_wallet_id?: number;
//     status: ITransaction['status'];
//   }): Promise<ITransaction> {
//     const [transaction] = await this.knex('transactions').insert(data).returning('*');
//     return transaction;
//   }
// }




















import { Knex } from 'knex';
import { ITransaction } from '../types';

export class TransactionModel {
  constructor(private knex: Knex) {}

  async create(transaction: Partial<ITransaction>, trx?: Knex.Transaction): Promise<void> {
    try {
      console.log(`Inserting transaction: ${JSON.stringify(transaction)}`);
      await (trx || this.knex)('transactions').insert({
        wallet_id: transaction.wallet_id,
        type: transaction.type,
        amount: Number(transaction.amount),
        recipient_wallet_id: transaction.recipient_wallet_id,
        status: transaction.status,
        created_at: this.knex.fn.now(),
      });
      console.log('Transaction inserted');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in TransactionModel.create: ${message}`);
      throw error;
    }
  }
}