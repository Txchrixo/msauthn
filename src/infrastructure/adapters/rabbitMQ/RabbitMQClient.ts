import { DI_TOKENS } from '@/config/di-tokens';
import { MessageQueueError } from '@/core/errors/errors';
import { inject, singleton } from 'tsyringe';
import { IMQClient } from '@/core/ports/outbound/IMQClient';
import amqp, { Channel, Connection } from 'amqplib';

@singleton()
export class RabbitMQClient implements IMQClient {
  private connection!: Connection;
  private channel!: Channel;
  private rabbitMQUrl!: string;

  constructor(@inject(DI_TOKENS.APP_CONFIG) private readonly config: { rabbitMQUrl: string }) {
    this.rabbitMQUrl = this.config.rabbitMQUrl;
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.rabbitMQUrl);
      this.channel = await this.connection.createChannel();
      // logger.info('RabbitMQ Connection initialized on broker URL:', this.rabbitMQUrl)
      console.log('RabbitMQ Connection initialized on broker URL:', this.rabbitMQUrl!);
    } catch (error: any) {
      // console.error('Failed to connect to RabbitMQ:', error);
      throw new MessageQueueError(`Failed to connect to RabbitMQ: ${error.message}`);
    }
  }

  getClient(): Channel {
    return this.channel;
  }
}
