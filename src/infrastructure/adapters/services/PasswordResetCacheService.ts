import { DI_TOKENS } from '@/config/di-tokens';
import { ICacheService } from '@/core/repositories/ICacheService';
import { IPasswordResetCacheService } from '@/core/repositories/IPasswordResetCacheService';
import { AppConfig } from '@/core/types';
import crypto from 'crypto';
import { inject, injectable } from 'tsyringe';

@injectable()
export class PasswordResetCacheService implements IPasswordResetCacheService {
  private readonly passwordResetTokenExpiration: number;

  constructor(
    @inject(DI_TOKENS.APP_CONFIG)
    private readonly config: AppConfig,
    @inject(DI_TOKENS.CACHE_SERVICE) private readonly cache: ICacheService
  ) {
    this.passwordResetTokenExpiration = this.config.redis.passwordResetTokenExpiration;
  }

  private hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  public async cachePasswordResetToken(userId: string, token: string): Promise<string> {
    const passwordResetTokenKey = `passwordResetToken:${userId}`;
    await this.cache.set(passwordResetTokenKey, token, this.passwordResetTokenExpiration);
    return token;
  }

  public async getCachedPasswordResetToken(userId: string): Promise<any> {
    const passwordResetTokenKey = `passwordResetToken:${userId}`;
    const cached: string | null = await this.cache.get(passwordResetTokenKey);
    if (!cached) return null;
    return cached;
  }

  public async invalidatePasswordResetToken(userId: string): Promise<void> {
    const passwordResetTokenKey = `passwordResetToken:${userId}`;
    await this.cache.delete(passwordResetTokenKey);
  }
}
