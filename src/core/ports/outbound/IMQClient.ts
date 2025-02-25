export interface IMQClient {
  connect(): Promise<void>;
  getClient(): any;
}
