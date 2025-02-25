export interface IRefreshTokenCacheService {
  cacheRefreshToken(userId: string, refreshToken: string): Promise<string>;
  getCachedRefreshToken(refreshToken: string): Promise<any>;
  invalidateUserToken(userId: string, refreshToken: string): Promise<void>;
  invalidateUserTokens(userId: string): Promise<void>;
}
