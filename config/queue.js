const Queue = require('bull');

let messageQueue = null;
let imageQueue = null;

// Only create queues if Redis is explicitly enabled
// Set ENABLE_REDIS=true to enable Redis features
if (process.env.ENABLE_REDIS === 'true' && (process.env.REDIS_URL || process.env.REDIS_HOST)) {
  try {
    const redisConfig = process.env.REDIS_URL
      ? process.env.REDIS_URL
      : {
          host: process.env.REDIS_HOST,
          port: process.env.REDIS_PORT || 6379,
          password: process.env.REDIS_PASSWORD || undefined
        };

    // Message processing queue
    messageQueue = new Queue('message-processing', {
      redis: redisConfig
    });

    // Image processing queue
    imageQueue = new Queue('image-processing', {
      redis: redisConfig
    });

    // Process message queue jobs
    messageQueue.process(async (job) => {
      const { messageId, channelId, content } = job.data;
      console.log(`Processing message ${messageId} in channel ${channelId}`);
      
      // Add any message processing logic here
      // e.g., content moderation, link preview generation, etc.
      
      return { processed: true, messageId };
    });

    // Process image queue jobs
    imageQueue.process(async (job) => {
      const { messageId, imagePath } = job.data;
      console.log(`Processing image for message ${messageId}`);
      
      // Add image processing logic here
      // e.g., thumbnail generation, compression, scanning, etc.
      
      return { processed: true, messageId };
    });

    // Queue event handlers
    messageQueue.on('completed', (job, result) => {
      console.log(`Message job ${job.id} completed:`, result);
    });

    messageQueue.on('failed', (job, err) => {
      console.error(`Message job ${job.id} failed:`, err);
    });

    imageQueue.on('completed', (job, result) => {
      console.log(`Image job ${job.id} completed:`, result);
    });

    imageQueue.on('failed', (job, err) => {
      console.error(`Image job ${job.id} failed:`, err);
    });

    console.log('✓ Bull queues initialized with Redis');
  } catch (error) {
    console.log('⚠ Bull queues initialization failed:', error.message);
  }
} else {
  console.log('ℹ Bull queues disabled (running in single-instance mode)');
  if (process.env.REDIS_URL || process.env.REDIS_HOST) {
    console.log('ℹ Redis detected but not enabled. Set ENABLE_REDIS=true to use queues.');
  }
}

module.exports = { messageQueue, imageQueue };

