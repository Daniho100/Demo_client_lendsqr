import { Knex, knex } from 'knex';
import dotenv from 'dotenv';

dotenv.config();

const config: Knex.Config = {
  client: 'mysql2',
 connection: {
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }, 
  },
  pool: { min: 0, max: 10 },
  migrations: {
    directory: './src/migrations',
    tableName: 'knex_migrations',
  },
  seeds: {
    directory: './src/seeds',
  },
};

export const knexInstance = knex(config);