export interface IMQService {
  sendMQ(key: string, message: any, ttl?: number): Promise<void>;
}
