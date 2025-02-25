import { IUserRepository } from '@/core/repositories/IUserRepository';
import { MongoClient, Collection, ObjectId } from 'mongodb';
import { inject, injectable } from 'tsyringe';
import { User } from '@/core/entities';
import { comparePassword } from '@/utils/common';
import { DatabaseError } from '@/core/errors/errors';
import { AppConfig, RegisterData } from '@/core/types';
import { DI_TOKENS } from '@/config/di-tokens';
import { IDbClient } from '@/core/ports/outbound/IDbClient';

@injectable()
export class MongodbUserRepository implements IUserRepository {
  private mongodb: MongoClient;
  private collection: Collection;

  constructor(
    @inject(DI_TOKENS.DB_CLIENT) private readonly db: IDbClient,
    @inject(DI_TOKENS.APP_CONFIG)
    private readonly config: AppConfig
  ) {
    this.mongodb = this.db.getClient();
    this.collection = this.mongodb.db(this.config.mongodb.name).collection(this.config.mongodb.collections.users);
  }

  public async createUserLocally(user: RegisterData): Promise<any> {}

  public async findUserById(userId: string): Promise<User | null> {
    if (!ObjectId.isValid(userId)) throw new DatabaseError('The provided userID is not a valid ObjectId');

    const userData = await this.collection.findOne(
      { _id: new ObjectId(userId) },
      {
        projection: {
          _id: 1,
          email: 1,
          role: 1,
        },
      }
    );

    if (userData)
      return {
        id: userData._id.toString(),
        email: userData.email.toString(),
        role: userData.role.toString(),
      };

    return null;
  }

  public async findUserByEmail(email: string): Promise<User | null> {
    const userData = await this.collection.findOne({ email: email });
    if (userData)
      return {
        id: userData._id.toString(),
        email: userData.email.toString(),
        role: userData.role.toString(),
      };
    return null;
  }

  public async findUserByPhoneNumber(phoneNumber: string): Promise<User | null> {
    const userData = await this.collection.findOne({
      phoneNumber: phoneNumber,
    });
    if (userData)
      return {
        id: userData._id.toString(),
        email: userData.email.toString(),
        role: userData.role.toString(),
      };
    return null;
  }

  public async findUserByEmailOrPhoneNumber(email?: string, phoneNumber?: string): Promise<User | null> {
    let query: any = {};

    if (email || phoneNumber) {
      query = {
        $or: [email ? { email: email } : {}, phoneNumber ? { phoneNumber: phoneNumber } : {}],
      };
    }

    const user = await this.collection.findOne(query);
    if (user)
      return {
        id: user._id.toString(),
        email: user.email.toString(),
        role: user.role.toString(),
        phoneNumber: user.phoneNumber.toString(),
      };
    return null;
  }

  public async verifyPassword(userId: string, password: string): Promise<boolean> {
    if (!ObjectId.isValid(userId)) throw new DatabaseError('The provided userID is not a valid ObjectId');
    const user = await this.collection.findOne({ _id: new ObjectId(userId) }, { projection: { password_hash: 1 } });
    if (user) return await comparePassword(password, user.password_hash);
    return false;
  }
}
