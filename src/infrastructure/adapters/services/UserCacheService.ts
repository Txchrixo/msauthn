import { DI_TOKENS } from '@/config/di-tokens';
import { User } from '@/core/entities';
import { ICacheService } from '@/core/repositories/ICacheService';
import { IUserCacheService } from '@/core/repositories/IUserCacheService';
import { AppConfig } from '@/core/types';
import { inject, injectable } from 'tsyringe';

@injectable()
export class UserCacheService implements IUserCacheService {
  private readonly userCacheExpiration: number;

  constructor(
    @inject(DI_TOKENS.APP_CONFIG)
    private readonly config: AppConfig,
    @inject(DI_TOKENS.CACHE_SERVICE) private readonly cache: ICacheService
  ) {
    this.userCacheExpiration = this.config.redis.userCacheExpiration;
  }

  public async getCachedUser(email?: string, phoneNumber?: string): Promise<User | null> {
    let user: User | null = null;
    if (email) user = await this.cache.get<User>(`user:email:${email}`);
    if (!user && phoneNumber) user = await this.cache.get<User>(`user:phoneNumber:${phoneNumber}`);
    return user;
  }

  public async cacheUser(user: User): Promise<void> {
    if (user.email) await this.cache.set(`user:email:${user.email}`, user, this.userCacheExpiration);
    if (user.phoneNumber) await this.cache.set(`user:phoneNumber:${user.phoneNumber}`, this.userCacheExpiration);
  }
}
