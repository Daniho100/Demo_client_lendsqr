// import express, { Express } from 'express';
// import Knex from 'knex';
// import { UserController } from './controllers/userController';
// import { UserService } from './services/user.service';
// import { WalletService } from './services/wallet.service';
// import { AppError, handleError } from './utils';
// import dotenv from 'dotenv';

// dotenv.config();

// const app: Express = express();
// const port = process.env.PORT || 8081;

// // Initialize Knex
// const knex = Knex({
//   client: 'mysql2',
//   connection: {
//     host: process.env.DB_HOST,
//     port: parseInt(process.env.DB_PORT || '3306'),
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_NAME,
//   },
// });

// app.use(express.json());

// // Initialize services and controllers
// const userService = new UserService(knex);
// const walletService = new WalletService(knex);
// const userController = new UserController(knex, userService, walletService);

// // Routes
// app.post('/api/users', (req, res) => userController.createUser(req, res));
// app.post('/api/login', (req, res) => userController.login(req, res));
// app.post('/api/wallets/deposit', (req, res) => walletService.deposit(req.body.userId, req.body.amount).then(() => res.json({ message: 'Deposit successful' })).catch((error) => {
//   const { message, statusCode } = handleError(error);
//   res.status(statusCode).json({ message });
// }));
// app.post('/api/wallets/transfer', (req, res) => walletService.transfer(req.body.fromUserId, req.body.toEmail, req.body.amount).then(() => res.json({ message: 'Transfer successful' })).catch((error) => {
//   const { message, statusCode } = handleError(error);
//   res.status(statusCode).json({ message });
// }));
// app.post('/api/wallets/withdraw', (req, res) => walletService.withdraw(req.body.userId, req.body.amount).then(() => res.json({ message: 'Withdrawal successful' })).catch((error) => {
//   const { message, statusCode } = handleError(error);
//   res.status(statusCode).json({ message });
// }));
// app.get('/api/wallets/balance/:userId', (req, res) => walletService.getBalance(parseInt(req.params.userId)).then((balance) => res.json({ balance })).catch((error) => {
//   const { message, statusCode } = handleError(error);
//   res.status(statusCode).json({ message });
// }));

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



















// app.ts
import express, { Express } from 'express';
import Knex from 'knex';
import { UserController } from './controllers/userController';
import { UserService } from './services/user.service';
import { WalletService } from './services/wallet.service';
import { WalletController } from './controllers/walletController';
import { walletRoutes } from './routes/wallets';
import { AppError, handleError } from './utils';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 8081;

// Initialize Knex
const knex = Knex({
  client: 'mysql2',
  connection: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  },
});

app.use(express.json());

// Initialize services and controllers
const userService = new UserService(knex);
const walletService = new WalletService(knex);
const userController = new UserController(knex, userService, walletService);
const walletController = new WalletController(walletService);

// Routes
app.post('/api/users', (req, res) => userController.createUser(req, res));
app.post('/api/login', (req, res) => userController.login(req, res));
app.use('/api/wallets', walletRoutes(walletController));

// Global error handler
app.use((error: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  const { message, statusCode } = handleError(error);
  res.status(statusCode).json({ message });
});

// Start server
knex.raw('SELECT 1').then(() => {
  console.log('MySQL database connection successful: Connected');
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}).catch((error) => {
  console.error('Failed to connect to MySQL database:', error.message);
  process.exit(1);
});