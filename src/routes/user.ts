import express from 'express';
import { UserController } from '../controllers/userController';

export default (userController: UserController) => {
  const router = express.Router();
  router.post('/', userController.createUser.bind(userController));
  router.post('/login', userController.login.bind(userController));
  return router;
};