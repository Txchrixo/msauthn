import { DI_TOKENS } from '@/config/di-tokens';
import { ICacheService } from '@/core/repositories/ICacheService';
import { IRefreshTokenCacheService } from '@/core/repositories/IRefreshTokenCacheService';
import { AppConfig } from '@/core/types';
import crypto from 'crypto';
import { inject, injectable } from 'tsyringe';

@injectable()
export class RefreshTokenCacheService implements IRefreshTokenCacheService {
  private readonly refreshTokenExpiration: number;

  constructor(
    @inject(DI_TOKENS.APP_CONFIG)
    private readonly config: AppConfig,
    @inject(DI_TOKENS.CACHE_SERVICE) private readonly cache: ICacheService
  ) {
    this.refreshTokenExpiration = this.config.redis.refreshTokenExpiration;
  }

  private hashToken(token: string): string {
    return crypto.createHash('sha256').update(token).digest('hex');
  }

  public async cacheRefreshToken(userId: string, refreshToken: string): Promise<string> {
    const refreshTokenHash = this.hashToken(refreshToken);
    const refreshTokenKey = `refreshToken:${refreshTokenHash}`;
    const userTokensKey = `userTokens:${userId}`;

    await this.cache.set(refreshTokenKey, { userId, refreshToken: refreshTokenHash }, this.refreshTokenExpiration);
    await this.cache.sAdd(userTokensKey, refreshTokenHash);

    return refreshToken;
  }

  public async getCachedRefreshToken(refreshToken: string): Promise<any> {
    const refreshTokenHash = this.hashToken(refreshToken);
    const key = `refreshToken:${refreshTokenHash}`;

    const cached: string | null = await this.cache.get(key);

    if (!cached) return null;

    return cached;
  }

  public async invalidateUserToken(userId: string, refreshToken: string): Promise<void> {
    const refreshTokenHash = this.hashToken(refreshToken);
    const refreshTokenKey = `refreshToken:${refreshTokenHash}`;
    const userTokensKey = `userTokens:${userId}`;

    const userTokens = await this.cache.sMembers(userTokensKey);

    if (userTokens.length > 0) {
      if (userTokens.includes(refreshTokenHash)) {
        await this.cache.delete(refreshTokenKey);
        await this.cache.sRem(userTokensKey, refreshTokenHash);
      }
    }
  }

  public async invalidateUserTokens(userId: string): Promise<void> {
    const userTokensKey = `userTokens:${userId}`;

    const userTokens = await this.cache.sMembers(userTokensKey);

    if (userTokens.length > 0) {
      for (const tokenHash of userTokens) {
        const tokenKey = `refreshToken:${tokenHash}`;
        await this.cache.delete(tokenKey);
      }
      await this.cache.sRem(userTokensKey, ...userTokens);
    }

    await this.cache.delete(userTokensKey);
  }
}
