import { INotificationService } from '@/core/ports/outbound/INotificationService';
import { inject, injectable } from 'tsyringe';
import { IMQService } from '@/core/ports/outbound/IMQService';
import { AppConfig } from '@/core/types';
import { DI_TOKENS } from '@/config/di-tokens';

/**
 * Service class responsible for dispatching messages such as welcome messages,
 * password reset notifications, and password change notifications using a message queue.
 * Implements circuit breaker and retry mechanisms for resilience.
 */
@injectable()
export class NotificationServiceAdapter implements INotificationService {
  private readonly routingKeys: {
    welcomeMessage: string;
    passwordReset: string;
    passwordChanged: string;
    newDeviceConnection: string;
  };

  constructor(
    @inject(DI_TOKENS.APP_CONFIG)
    private readonly config: AppConfig,
    @inject(DI_TOKENS.MQ_SERVICE) private readonly rabbitMQService: IMQService
  ) {
    this.routingKeys = this.config.services.notificationService.routingKeys;
  }

  /**
   * Sends a welcome message to the user via the message queue.
   *
   * @param {string} userId - The ID of the user to whom the welcome message will be sent.
   * @returns {Promise<void>} A promise that resolves when the message has been sent successfully.
   */
  public async sendWelcomeMessage(userId: string): Promise<void> {
    const message = {
      type: 'welcomeMessage',
      userId,
    };

    await this.rabbitMQService.sendMQ(this.routingKeys.welcomeMessage, message);
  }

  /**
   * Sends a password reset notification via the message queue.
   *
   * @param {string} email - The email address to send the password reset notification.
   * @returns {Promise<void>} A promise that resolves when the notification has been sent.
   */
  public async sendPasswordResetNotification(email: string, redirectUrl: string): Promise<void> {
    const message = {
      type: 'passwordReset',
      email,
      redirectUrl,
    };

    await this.rabbitMQService.sendMQ(this.routingKeys.passwordReset, message);
  }

  /**
   * Sends a password change notification via the message queue.
   *
   * @param {string} email - The email address to notify of the password change.
   * @returns {Promise<void>} A promise that resolves when the notification has been sent.
   */
  public async sendPasswordChangedNotification(email: string): Promise<void> {
    const message = {
      type: 'passwordChange',
      email,
    };

    await this.rabbitMQService.sendMQ(this.routingKeys.passwordChanged, message);
  }

  /**
   * Sends a new device connection notification via the message queue.
   *
   * @param {string} email - The email address to notify of the new device connection.
   * @returns {Promise<void>} A promise that resolves when the notification has been sent.
   */
  public async sendNewDeviceConnectionNotification(email: string): Promise<void> {
    const message = {
      type: 'newDeviceConnection',
      email,
    };

    await this.rabbitMQService.sendMQ(this.routingKeys.newDeviceConnection, message);
  }
}
