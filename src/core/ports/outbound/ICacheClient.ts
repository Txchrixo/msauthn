export interface ICacheClient {
  connect(): Promise<void>;
  getClient(): any;
}
