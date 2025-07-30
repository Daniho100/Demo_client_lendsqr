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

knexInstance.migrate.latest()
  .then(() => {
    console.log('✅ Migrations ran successfully');
    return knexInstance.raw('SELECT 1');
  })
  .then(() => {
    console.log('MySQL database connection successful');
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('Database startup failed:', err.message);
    process.exit(1);
  });
