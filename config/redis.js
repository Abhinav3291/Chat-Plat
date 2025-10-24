const redis = require('redis');

// Only create Redis client if Redis URL or host is provided
let redisClient = null;

if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  try {
    if (process.env.REDIS_URL) {
      // Use REDIS_URL for cloud platforms (Render, Heroku, etc.)
      redisClient = redis.createClient({
        url: process.env.REDIS_URL,
        legacyMode: false
      });
    } else {
      // Use individual params for local development
      redisClient = redis.createClient({
        socket: {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT || 6379
        },
        password: process.env.REDIS_PASSWORD || undefined,
        legacyMode: false
      });
    }

    redisClient.on('error', (err) => console.error('Redis Client Error:', err));
    redisClient.on('connect', () => console.log('✓ Redis Client Connected'));
    
    console.log('Redis client configured');
  } catch (error) {
    console.log('Warning: Redis client configuration failed:', error.message);
    redisClient = null;
  }
} else {
  console.log('Info: Redis not configured (optional for single-instance deployment)');
}

// Export a null-safe Redis client
module.exports = redisClient;

