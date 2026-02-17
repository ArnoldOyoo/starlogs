import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryDelayOnFailover: 100,
  maxRetriesPerRequest: 3,
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

// Cache helpers
export const cacheGet = async <T>(key: string): Promise<T | null> => {
  const data = await redis.get(key);
  return data ? JSON.parse(data) : null;
};

export const cacheSet = async (key: string, value: unknown, ttlSeconds = 300): Promise<void> => {
  await redis.setex(key, ttlSeconds, JSON.stringify(value));
};

export const cacheDelete = async (key: string): Promise<void> => {
  await redis.del(key);
};

export const cacheDeletePattern = async (pattern: string): Promise<void> => {
  const keys = await redis.keys(pattern);
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

export default redis;
