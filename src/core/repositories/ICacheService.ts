export interface ICacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  sAdd(key: string, ...members: string[]): Promise<void>;
  sMembers(key: string): Promise<string[]>;
  sRem(key: string, ...members: string[]): Promise<void>;
  expire(key: string, ttl: number): Promise<void>;
}
