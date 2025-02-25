import { DI_TOKENS } from '@/config/di-tokens';
import { CacheError } from '@/core/errors/errors';
import { inject, singleton } from 'tsyringe';
import { ICacheClient } from '@/core/ports/outbound/ICacheClient';
import { createClient, RedisClientType } from 'redis';

@singleton()
export class RedisClient implements ICacheClient {
  private client: RedisClientType;
  private redisUrl: string;

  constructor(
    @inject(DI_TOKENS.APP_CONFIG)
    private readonly config: { redis: { url: string } }
  ) {
    this.redisUrl = this.config.redis.url;
    this.client = createClient({
      url: this.redisUrl,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      // logger.info('Redis Connection initialized on Redis URL:', config.redis.url)
      console.log('Redis Connection initialized on Redis URL:', this.redisUrl);
    } catch (error: any) {
      console.error('Failed to connect to Redis:', error);
      throw new CacheError(`Failed to connect to Redis: ${error.message}`);
    }
  }

  getClient(): RedisClientType {
    return this.client;
  }
}
