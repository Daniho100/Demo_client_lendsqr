import express from 'express';
import { WalletController } from '../controllers/walletController';
import { authMiddleware } from '../middlewares/auth';

export default (walletController: WalletController) => {
  const router = express.Router();
  router.post('/deposit', authMiddleware, walletController.deposit.bind(walletController));
  router.post('/transfer', authMiddleware, walletController.transfer.bind(walletController));
  router.post('/withdraw', authMiddleware, walletController.withdraw.bind(walletController));
  router.get('/balance', authMiddleware, walletController.getBalance.bind(walletController));
  return router;
};