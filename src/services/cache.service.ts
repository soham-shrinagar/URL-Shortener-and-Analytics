import { redisClient } from '../config/redis.js';
import { config } from '../config/env.js';

export class CacheService {
  private readonly prefix = 'url:';

  async get(shortCode: string): Promise<string | null> {
    return await redisClient.get(`${this.prefix}${shortCode}`);
  }

  async set(shortCode: string, longUrl: string, ttlInDays?: number): Promise<void> {
    const ttl = ttlInDays ? ttlInDays * 86400 : config.defaultCacheTtl;
    await redisClient.set(`${this.prefix}${shortCode}`, longUrl, ttl);
  }

  async delete(shortCode: string): Promise<void> {
    await redisClient.del(`${this.prefix}${shortCode}`);
  }
}

export const cacheService = new CacheService();