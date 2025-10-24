const redis = require('redis');

// Only create Redis client if explicitly enabled
// Set ENABLE_REDIS=true to enable Redis features
let redisClient = null;

if (process.env.ENABLE_REDIS === 'true' && (process.env.REDIS_URL || process.env.REDIS_HOST)) {
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

    redisClient.on('error', (err) => console.error('⚠ Redis Client Error (non-fatal):', err.message));
    redisClient.on('connect', () => console.log('✓ Redis Client Connected'));
    
    console.log('✓ Redis client configured');
  } catch (error) {
    console.log('Warning: Redis client configuration failed:', error.message);
    redisClient = null;
  }
} else {
  console.log('ℹ Redis disabled (running in single-instance mode)');
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    console.log('ℹ Redis detected but not enabled. Set ENABLE_REDIS=true to use Redis.');
  }
}

// Export a null-safe Redis client
module.exports = redisClient;

