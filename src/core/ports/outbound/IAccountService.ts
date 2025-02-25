import { RegisterData } from '@/core/types';

export interface IAccountService {
  createUser(user: RegisterData): Promise<any>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
}
