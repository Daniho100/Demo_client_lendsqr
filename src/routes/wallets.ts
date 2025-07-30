import { Router } from 'express';
import { WalletController } from '../controllers/walletController';
import { authMiddleware } from '../middlewares/auth';

export function walletRoutes(walletController: WalletController): Router {
  const router = Router();
  router.post('/deposit', authMiddleware, (req, res) => walletController.deposit(req, res));
  router.post('/transfer', authMiddleware, (req, res) => walletController.transfer(req, res));
  router.post('/withdraw', authMiddleware, (req, res) => walletController.withdraw(req, res));
  router.get('/balance/:userId', authMiddleware, (req, res) => walletController.getBalance(req, res));
  return router;
}