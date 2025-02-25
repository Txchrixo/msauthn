export interface IDbClient {
  connect(): Promise<void>;
  getClient(): any;
}
