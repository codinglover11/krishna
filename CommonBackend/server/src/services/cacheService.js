/**
 * Robust High-Performance Cache Service
 * Primary: Redis client
 * Fallback: In-memory TTL Map
 */

const { createClient } = require('redis');

class MemoryCache {
  constructor() {
    this.store = new Map();
  }

  get(key) {
    const item = this.store.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return item.value;
  }

  set(key, value, ttlSeconds = 300) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expiresAt });
  }

  del(key) {
    this.store.delete(key);
  }

  flushPattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key);
      }
    }
  }
}

class CacheService {
  constructor() {
    this.memoryCache = new MemoryCache();
    this.redisClient = null;
    this.useRedis = false;
    this.initRedis();
  }

  async initRedis() {
    if (process.env.REDIS_URL || process.env.ENABLE_REDIS === 'true') {
      try {
        const client = createClient({
          url: process.env.REDIS_URL || 'redis://localhost:6379'
        });
        client.on('error', (err) => {
          console.warn('[CacheService] Redis error, falling back to MemoryCache:', err.message);
          this.useRedis = false;
        });
        await client.connect();
        this.redisClient = client;
        this.useRedis = true;
        console.log('[CacheService] Redis connected successfully.');
      } catch (err) {
        console.warn('[CacheService] Redis connection failed, using MemoryCache:', err.message);
        this.useRedis = false;
      }
    }
  }

  async get(key) {
    if (this.useRedis && this.redisClient?.isReady) {
      try {
        const raw = await this.redisClient.get(key);
        return raw ? JSON.parse(raw) : null;
      } catch (err) {
        return this.memoryCache.get(key);
      }
    }
    return this.memoryCache.get(key);
  }

  async set(key, value, ttlSeconds = 300) {
    if (this.useRedis && this.redisClient?.isReady) {
      try {
        await this.redisClient.set(key, JSON.stringify(value), { EX: ttlSeconds });
      } catch (err) {
        this.memoryCache.set(key, value, ttlSeconds);
      }
    } else {
      this.memoryCache.set(key, value, ttlSeconds);
    }
  }

  async del(key) {
    if (this.useRedis && this.redisClient?.isReady) {
      try {
        await this.redisClient.del(key);
      } catch (err) {
        this.memoryCache.del(key);
      }
    }
    this.memoryCache.del(key);
  }

  async flushPattern(pattern) {
    this.memoryCache.flushPattern(pattern);
    if (this.useRedis && this.redisClient?.isReady) {
      try {
        const keys = await this.redisClient.keys(pattern);
        if (keys.length > 0) {
          await this.redisClient.del(keys);
        }
      } catch (err) {
        // Ignored
      }
    }
  }

  async getOrSet(key, ttlSeconds, fetcherFn) {
    const cached = await this.get(key);
    if (cached !== null && cached !== undefined) {
      return cached;
    }
    const freshData = await fetcherFn();
    if (freshData !== null && freshData !== undefined) {
      await this.set(key, freshData, ttlSeconds);
    }
    return freshData;
  }
}

module.exports = new CacheService();
