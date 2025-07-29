// import { Knex } from 'knex';
// import { IUser } from '../types';

// export class UserModel {
//   constructor(private knex: Knex) {}

//   async create(user: Partial<IUser>, trx?: Knex.Transaction): Promise<IUser> {
//     try {
//       console.log(`Inserting user: ${JSON.stringify(user)}`);
//       const query = (trx || this.knex)('users').insert(user);
//       const [id] = await query;
//       console.log(`User inserted with id: ${id}`);
//       const createdUser = await (trx || this.knex)('users')
//         .where({ id })
//         .select('id', 'email', 'name', 'password', 'created_at', 'updated_at')
//         .first();
//       if (!createdUser) throw new Error('Failed to retrieve created user');
//       console.log(`Retrieved created user: ${JSON.stringify(createdUser)}`);
//       return createdUser;
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in UserModel.create: ${message}`);
//       throw error;
//     }
//   }

//   async findByEmail(email: string): Promise<IUser | undefined> {
//     try {
//       console.log(`Finding user by email: ${email}`);
//       const user = await this.knex('users').where({ email }).select('id', 'email', 'name', 'password', 'created_at', 'updated_at').first();
//       console.log(`User found: ${user ? JSON.stringify(user) : 'not found'}`);
//       return user;
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in findByEmail: ${message}`);
//       throw error;
//     }
//   }

//   async updatePassword(userId: number, hashedPassword: string): Promise<void> {
//     try {
//       console.log(`Updating password for userId: ${userId}`);
//       await this.knex('users').where({ id: userId }).update({ password: hashedPassword });
//       console.log(`Password updated for userId: ${userId}`);
//     } catch (error) {
//       const message = error instanceof Error ? error.message : 'Unknown error';
//       console.error(`Error in updatePassword: ${message}`);
//       throw error;
//     }
//   }
// }







import { Knex } from 'knex';
import { IUser } from '../types';

export class UserModel {
  constructor(private knex: Knex) {}

  async create(user: Partial<IUser>, trx?: Knex.Transaction): Promise<IUser> {
    try {
      console.log(`Inserting user: ${JSON.stringify(user)}`);
      const query = (trx || this.knex)('users').insert(user);
      const [id] = await query;
      console.log(`User inserted with id: ${id}`);
      const createdUser = await (trx || this.knex)('users')
        .where({ id })
        .select('id', 'email', 'name', 'password', 'created_at', 'updated_at')
        .first();
      if (!createdUser) throw new Error('Failed to retrieve created user');
      console.log(`Retrieved created user: ${JSON.stringify(createdUser)}`);
      return createdUser;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in UserModel.create: ${message}`);
      throw error;
    }
  }

  async findByEmail(email: string): Promise<IUser | undefined> {
    try {
      console.log(`Finding user by email: ${email}`);
      const user = await this.knex('users').where({ email }).select('id', 'email', 'name', 'password', 'created_at', 'updated_at').first();
      console.log(`User found: ${user ? JSON.stringify(user) : 'not found'}`);
      return user;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      console.error(`Error in findByEmail: ${message}`);
      throw error;
    }
  }
}