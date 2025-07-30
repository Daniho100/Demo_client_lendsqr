import { Knex } from 'knex';
import { UserModel } from '../models/user';
import { checkKarmaBlacklist } from '../utils/adjutor';
import { AppError } from '../utils';
import { IUser } from '../types';

export class UserService {
  private userModel: UserModel;

  constructor(private knex: Knex) {
    this.userModel = new UserModel(knex);
  }

  async createUser(email: string, name: string, hashedPassword: string, trx?: Knex.Transaction): Promise<IUser> {
    const isBlacklisted = await checkKarmaBlacklist(email);
    if (isBlacklisted) {
      throw new AppError('User is blacklisted', 403);
    }
    try {
      const user = await this.userModel.create({ email, name, password: hashedPassword }, trx);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error creating user ${email}:`, message);
      throw new AppError('Failed to create user', 500);
    }
  }

  async getUserByEmail(email: string): Promise<IUser | undefined> {
    const user = await this.userModel.findByEmail(email);
    console.log(`User fetched: ${user ? JSON.stringify(user) : 'not found'}`);
    return user;
  }
}



















