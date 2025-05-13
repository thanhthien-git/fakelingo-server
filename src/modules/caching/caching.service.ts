import { Inject, Injectable } from '@nestjs/common';
import { RedisClientType } from 'redis';

@Injectable()
export class CachingService {
  private readonly TTL = 300;
  constructor(
    @Inject('REDIS_CLIENT')
    private readonly redisClient: RedisClientType,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redisClient.get(key);
    return data ? (data as T) : null;
  }

  async set<T>(key: string, data: T): Promise<void> {
    const setData = JSON.stringify(data);
    await this.redisClient.set(key, setData, { EX: this.TTL });
  }

  async updateIfExists<T>(
    key: string,
    callback: () => Promise<T>,
  ): Promise<void> {
    const updated = await callback();

    const exists = await this.redisClient.exists(key);
    if (exists) {
      const setData = JSON.stringify(updated);
      await this.redisClient.set(key, setData, { EX: this.TTL });
    }
  }
}
