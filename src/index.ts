// import express, { Express } from 'express';
// import Knex from 'knex';
// import { UserController } from './controllers/userController';
// import { UserService } from './services/user.service';
// import { WalletService } from './services/wallet.service';
// import { WalletController } from './controllers/walletController';
// import { walletRoutes } from './routes/wallets';
// import { AppError, handleError } from './utils';
// import dotenv from 'dotenv';


// dotenv.config();

// const app: Express = express();
// const port = process.env.PORT || 8081;

// const knex = Knex({
//   client: 'mysql2',
//   connection: {
//     connectionString: process.env.DATABASE_URL,
//     ssl: { rejectUnauthorized: false }, 
//   },
//   pool: { min: 0, max: 10 },
// });

// app.use(express.json());

// // Initialize services and controllers
// const userService = new UserService(knex);
// const walletService = new WalletService(knex);
// const userController = new UserController(knex, userService, walletService);
// const walletController = new WalletController(walletService);

// // Routes
// app.post('/api/users', (req, res) => userController.createUser(req, res));
// app.post('/api/login', (req, res) => userController.login(req, res));
// app.use('/api/wallets', walletRoutes(walletController));

// // Global error handler
// app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
//   const { message, statusCode } = handleError(error);
//   res.status(statusCode).json({ message });
// });

// // Start server
// knex.raw('SELECT 1').then(() => {
//   console.log('MySQL database connection successful: Connected');
//   app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
//   });
// }).catch((error) => {
//   console.error('Failed to connect to MySQL database:', error.message);
//   process.exit(1);
// });







import express from 'express';
import dotenv from 'dotenv';
import { knexInstance } from './config/db';
import { UserService } from './services/user.service';
import { WalletService } from './services/wallet.service';
import { UserController } from './controllers/userController';
import { WalletController } from './controllers/walletController';
import { walletRoutes } from './routes/wallets';
import { handleError } from './utils';

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;

app.use(express.json());

const userService = new UserService(knexInstance);
const walletService = new WalletService(knexInstance);
const userController = new UserController(knexInstance, userService, walletService);
const walletController = new WalletController(walletService);

app.post('/api/users', (req, res) => userController.createUser(req, res));
app.post('/api/login', (req, res) => userController.login(req, res));
app.use('/api/wallets', walletRoutes(walletController));

app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { message, statusCode } = handleError(error);
  res.status(statusCode).json({ message });
});

knexInstance.raw('SELECT 1').then(() => {
  console.log('MySQL database connection successful');
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((err) => {
  console.error('Database connection failed:', err.message);
  process.exit(1);
});
