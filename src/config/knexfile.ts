import dotenv from 'dotenv';
import { Knex } from 'knex';
import { URL } from 'url';

dotenv.config();

const dbUrl = new URL(process.env.DATABASE_URL!);

const config: { [key: string]: Knex.Config } = {
  development: {
    client: 'mysql2',
    connection: {
      host: dbUrl.hostname,
      port: Number(dbUrl.port || 3306),
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.replace('/', ''),
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
  },
  production: {
    client: 'mysql2',
    connection: {
      host: dbUrl.hostname,
      port: Number(dbUrl.port || 3306),
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.replace('/', ''),
      ssl: { rejectUnauthorized: false },
    },
    pool: { min: 2, max: 10 },
    migrations: {
      directory: './src/migrations',
      tableName: 'knex_migrations',
    },
    seeds: {
      directory: './dist/seeds',
    },
  },
};

export default config;
