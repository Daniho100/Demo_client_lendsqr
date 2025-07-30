import { Request, Response } from 'express';
import { Knex } from 'knex';
import { UserService } from '../services/user.service';
import { WalletService } from '../services/wallet.service';
import { ICreateUserRequest, IJWTPayload } from '../types';
import { generateToken, handleError, AppError } from '../utils';
import bcrypt from 'bcryptjs';

export class UserController {
  private userService: UserService;
  private walletService: WalletService;
  private knex: Knex;

  constructor(knex: Knex, userService: UserService, walletService: WalletService) {
    this.knex = knex;
    this.userService = userService;
    this.walletService = walletService;
  }

  async createUser(req: Request, res: Response): Promise<void> {
    try {
      const { email, name, password }: ICreateUserRequest = req.body;
      if (!email || !name || !password) {
        throw new AppError('Email, name, and password are required', 400);
      }
      console.log(`Hashing password for ${email}`);
      console.log(`Raw password:`, password);

      const hashedPassword = await bcrypt.hash(password, 10);

      console.log(`Password hashed successfully:`, hashedPassword);

      console.log(`Creating user with email: ${email}, name: ${name}`);
      const user = await this.knex.transaction(async (trx) => {
        const user = await this.userService.createUser(email, name, hashedPassword, trx);
        console.log('User created:', user);
        await this.walletService.createUser(email, name, user.id, trx);
        console.log('Wallet created for user:', user.id);
        return user;
      });
      res.status(201).json({ user });
    } catch (error: any) {
        console.error('Error in createUser:', error.message || error);
        console.error(error.stack);
        const { message, statusCode } = handleError(error);
        res.status(statusCode).json({ message });
      }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        throw new AppError('Email and password are required', 400);
      }
      const user = await this.userService.getUserByEmail(email);
      if (!user || !user.password) {
        throw new AppError('Invalid credentials', 401);
      }
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        throw new AppError('Invalid credentials', 401);
      }
      const token = generateToken({ userId: user.id, email: user.email });
      res.status(200).json({ token });
    } catch (error) {
      const { message, statusCode } = handleError(error);
      console.error(`Error in login: ${message}`);
      res.status(statusCode).json({ message });
    }
  }
}