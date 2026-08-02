const redis = require('redis');

const redisUrl = process.env.REDIS_URL || '';

let client = null;

if (redisUrl) {
  client = redis.createClient({ url: redisUrl });
  client.on('error', (error) => {
    console.error('Redis client error', error);
  });
}

const getRedisConfig = () => ({
  configured: Boolean(redisUrl),
  url: redisUrl,
  driver: 'redis',
});

const connectRedis = async () => {
  if (!client) {
    return { ok: false, message: 'Redis credentials are not configured yet' };
  }

  try {
    await client.connect();
    return { ok: true, message: 'Redis connection successful' };
  } catch (error) {
    return { ok: false, message: error.message };
  }
};

module.exports = {
  client,
  getRedisConfig,
  connectRedis,
};
