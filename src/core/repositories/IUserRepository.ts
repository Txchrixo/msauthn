import { User } from '@/core/entities';
import { RegisterData } from '../types';

export interface IUserRepository {
  findUserById(userId: string): Promise<User | null>;
  findUserByEmail(email: string): Promise<User | null>;
  findUserByPhoneNumber(phoneNumber: string): Promise<User | null>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
  findUserByEmailOrPhoneNumber(email?: string, phoneNumber?: string): Promise<User | null>;
  createUserLocally(user: RegisterData): Promise<any>;
}
