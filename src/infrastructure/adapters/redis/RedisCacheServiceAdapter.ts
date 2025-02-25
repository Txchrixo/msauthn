import { ICacheService } from '@/core/repositories/ICacheService';
import { inject, injectable } from 'tsyringe';
import { RedisClientType } from 'redis';
import { DI_TOKENS } from '@/config/di-tokens';
import { ICacheClient } from '@/core/ports/outbound/ICacheClient';

@injectable()
export class RedisCacheServiceAdapter implements ICacheService {
  private readonly redis: RedisClientType;

  constructor(@inject(DI_TOKENS.CACHE_CLIENT) private readonly cache: ICacheClient) {
    this.redis = this.cache.getClient();
  }

  public async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(key);
    return data ? JSON.parse(data) : null;
  }

  public async set<T>(key: string, value: T, ttl: number = 3600): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), { EX: ttl });
  }

  public async delete(key: string): Promise<void> {
    await this.redis.del(key);
  }
  public async exists(key: string): Promise<boolean> {
    const result = await this.redis.exists(key);
    return result === 1;
  }
  public async sAdd(key: string, ...members: string[]): Promise<void> {
    await this.redis.sAdd(key, members);
  }

  public async sMembers(key: string): Promise<string[]> {
    const members = await this.redis.sMembers(key);
    return members;
  }
  public async sRem(key: string, ...members: string[]): Promise<void> {
    await this.redis.sRem(key, members);
  }
  public async expire(key: string, ttl: number): Promise<void> {
    await this.redis.expire(key, ttl);
  }
}
