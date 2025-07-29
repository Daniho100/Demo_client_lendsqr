import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable('transactions', (table) => {
    table.increments('id').primary();
    table.integer('wallet_id').unsigned().references('id').inTable('wallets').onDelete('CASCADE');
    table.enum('type', ['DEPOSIT', 'WITHDRAWAL', 'TRANSFER_SENT', 'TRANSFER_RECEIVED']).notNullable();
    table.decimal('amount', 15, 2).notNullable();
    table.integer('recipient_wallet_id').unsigned().references('id').inTable('wallets').nullable();
    table.enum('status', ['PENDING', 'COMPLETED', 'FAILED']).notNullable();
    table.timestamps(true, true);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable('transactions');
}