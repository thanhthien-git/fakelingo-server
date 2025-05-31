"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const redis_1 = require("redis");
class CacheService {
    constructor(redisUrl) {
        this.TTL = 300;
        this.client = (0, redis_1.createClient)({ url: redisUrl });
        this.client.on('connect', () => {
            console.log('Redis connected successfully!');
        });
        this.client.on('error', (err) => {
            console.error('Redis connection failed:', err.message);
        });
        this.client.connect().catch((err) => {
            console.error('Redis connection error on initial connect:', err.message);
        });
    }
    getClient() {
        return this.client;
    }
    async get(key) {
        const data = await this.client.get(key);
        return data ? data : null;
    }
    async set(key, data) {
        const setData = JSON.stringify(data);
        await this.client.set(key, setData, { EX: this.TTL });
    }
    async del(key) {
        await this.client.del(key);
    }
    async getOrSet(key, ttlSeconds, fetchFn) {
        const cached = await this.get(key);
        if (cached)
            return cached;
        const result = await fetchFn();
        await this.set(key, result);
        return result;
    }
    async updateIfExists(key, callback) {
        const updated = await callback();
        const exists = await this.client.exists(key);
        if (exists) {
            const setData = JSON.stringify(updated);
            await this.client.set(key, setData, { EX: this.TTL });
        }
    }
    async disconnect() {
        await this.client.disconnect();
    }
}
exports.CacheService = CacheService;
