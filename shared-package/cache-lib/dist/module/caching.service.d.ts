import { RedisClientType } from "redis";
export declare class CacheService {
    private client;
    private readonly TTL;
    constructor(redisUrl: string);
    getClient(): RedisClientType;
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, data: T): Promise<void>;
    del(key: string): Promise<void>;
    getOrSet<T>(key: string, ttlSeconds: number, fetchFn: () => Promise<T>): Promise<T>;
    updateIfExists<T>(key: string, callback: () => Promise<T>): Promise<void>;
    disconnect(): Promise<void>;
}
