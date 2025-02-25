export interface INotificationService {
  sendWelcomeMessage(userId: string): Promise<void>;

  sendPasswordResetNotification(email: string, redirectUrl: string): Promise<void>;

  sendPasswordChangedNotification(email: string): Promise<void>;

  sendNewDeviceConnectionNotification(email: string): Promise<void>;
}
