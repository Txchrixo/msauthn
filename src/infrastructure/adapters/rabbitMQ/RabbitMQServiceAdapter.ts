import { Channel } from 'amqplib';
import { IMQService } from '@/core/ports/outbound/IMQService';
import { DI_TOKENS } from '@/config/di-tokens';
import { AppConfig } from '@/core/types';
import { inject, injectable } from 'tsyringe';
import { MessageQueueError } from '@/core/errors/errors';
import { IMQClient } from '@/core/ports/outbound/IMQClient';

/**
 * Utility function to send a message to a RabbitMQ exchange with a specific routing key.
 * Uses dependency injection to inject the RabbitMQ rabbitMQChannel and exchange information.
 */
@injectable()
export class RabbitMQServiceAdapter implements IMQService {
  private rabbitMQChannel: Channel;
  private exchange: string;

  /**
   * Constructor for RabbitMQUtil, dependencies are injected by tsyringe.
   *
   * @param {Channel} rabbitMQChannel - The RabbitMQ rabbitMQChannel used for communication.
   * @param {string} exchange - The RabbitMQ exchange to which the message will be sent.
   */
  constructor(
    @inject(DI_TOKENS.APP_CONFIG) private readonly config: AppConfig,
    @inject(DI_TOKENS.MQ_CLIENT) private readonly mq: IMQClient
  ) {
    this.rabbitMQChannel = this.mq.getClient();
    this.exchange = this.config.services.notificationService.exchangeName;
  }

  /**
   * Sends a message to the RabbitMQ exchange with the specified routing key.
   *
   * @param {string} routingKey - The routing key used to route the message to the appropriate queue.
   * @param {any} message - The message to send to the exchange.
   * @param {number} [messageTTL] - Optional time-to-live for the message in milliseconds.
   * @returns {Promise<void>} - Resolves when the message is successfully sent.
   */
  async sendMQ(routingKey: string, message: any, messageTTL?: number): Promise<void> {
    const msgBuffer = Buffer.from(JSON.stringify(message));

    try {
      this.rabbitMQChannel.publish(this.exchange, routingKey, msgBuffer, {
        expiration: messageTTL,
        timestamp: Date.now(),
      });
      console.log(`Message published to exchange ${this.exchange} with routing key ${routingKey}`);
    } catch (error: any) {
      console.error(`Error publishing message to exchange ${this.exchange}:`, error);
      throw new MessageQueueError(`Error publishing message to exchange ${this.exchange}:${error.message}`);
    }
  }
}
