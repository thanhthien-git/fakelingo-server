import { createClient, RedisClientType } from "redis";

export class CacheService {
  private client: RedisClientType;
  private readonly TTL = 300;

  constructor(redisUrl: string) {
    this.client = createClient({ url: redisUrl });
    this.client.connect().catch(console.error);
  }

  getClient() {
    return this.client;
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    return data ? (data as T) : null;
  }

  async set<T>(key: string, data: T): Promise<void> {
    const setData = JSON.stringify(data);
    await this.client.set(key, setData, { EX: this.TTL });
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async getOrSet<T>(
    key: string,
    ttlSeconds: number,
    fetchFn: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached) return cached;

    const result = await fetchFn();
    await this.set(key, result);
    return result;
  }

  async updateIfExists<T>(
    key: string,
    callback: () => Promise<T>
  ): Promise<void> {
    const updated = await callback();

    const exists = await this.client.exists(key);
    if (exists) {
      const setData = JSON.stringify(updated);
      await this.client.set(key, setData, { EX: this.TTL });
    }
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }
}
