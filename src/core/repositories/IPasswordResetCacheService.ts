export interface IPasswordResetCacheService {
  cachePasswordResetToken(userId: string, token: string): Promise<string>;
  getCachedPasswordResetToken(userId: string): Promise<any>;
  invalidatePasswordResetToken(userId: string): Promise<void>;
}
