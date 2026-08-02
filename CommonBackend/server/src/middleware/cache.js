const { client } = require('../config/redis');

// Fallback in-memory cache if Redis is not configured
const inMemoryCache = new Map();
const TTL_SECONDS = 300; // 5 minutes default TTL

const cacheMiddleware = (duration = TTL_SECONDS) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') return next();

    const cacheKey = `cache:${req.originalUrl || req.url}`;

    try {
      if (client && client.isOpen) {
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
          return res.json(JSON.parse(cachedData));
        }
      } else if (inMemoryCache.has(cacheKey)) {
        const entry = inMemoryCache.get(cacheKey);
        if (Date.now() < entry.expiry) {
          return res.json(entry.data);
        }
        inMemoryCache.delete(cacheKey);
      }
    } catch (err) {
      console.warn('[Cache Middleware Warning]:', err.message);
    }

    // Intercept res.json to cache response payload
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      try {
        if (res.statusCode === 200 && body && body.success !== false) {
          if (client && client.isOpen) {
            client.setEx(cacheKey, duration, JSON.stringify(body));
          } else {
            inMemoryCache.set(cacheKey, {
              data: body,
              expiry: Date.now() + duration * 1000
            });
          }
        }
      } catch (err) {
        console.warn('[Cache Save Error]:', err.message);
      }
      return originalJson(body);
    };

    next();
  };
};

const invalidateCache = async (prefix = 'cache:') => {
  try {
    if (client && client.isOpen) {
      const keys = await client.keys(`${prefix}*`);
      if (keys.length > 0) {
        await client.del(keys);
      }
    }
    inMemoryCache.clear();
  } catch (err) {
    console.warn('[Cache Invalidation Error]:', err.message);
  }
};

module.exports = { cacheMiddleware, invalidateCache };
