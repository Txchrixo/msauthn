import { User } from '@/core/entities';

export interface IUserCacheService {
  cacheUser(user: User): Promise<void>;
  getCachedUser(email?: string, phoneNumber?: string): Promise<User | null>;
}
