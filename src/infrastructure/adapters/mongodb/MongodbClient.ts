import { DI_TOKENS } from '@/config/di-tokens';
import { DatabaseError } from '@/core/errors/errors';
import { MongoClient } from 'mongodb';
import { inject, singleton } from 'tsyringe';
import { IDbClient } from '@/core/ports/outbound/IDbClient';

@singleton()
export class MongodbClient implements IDbClient {
  private client: MongoClient;
  private mongoDbUrl: string;

  constructor(
    @inject(DI_TOKENS.APP_CONFIG)
    private readonly config: { mongodb: { uri: string } }
  ) {
    this.mongoDbUrl = this.config.mongodb.uri;
    this.client = new MongoClient(this.mongoDbUrl, {
      monitorCommands: true,
    });
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      console.log('MongoDB Connection initialized on MongoDB URI:', this.mongoDbUrl);
    } catch (error: any) {
      throw new DatabaseError(`Failed to connect to MongoDB: ${error.message}`);
    }
  }

  getClient(): MongoClient {
    return this.client;
  }
}
