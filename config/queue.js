const Queue = require('bull');

// Message processing queue
const messageQueue = new Queue('message-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  }
});

// Image processing queue
const imageQueue = new Queue('image-processing', {
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: process.env.REDIS_PORT || 6379,
    password: process.env.REDIS_PASSWORD || undefined
  }
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

module.exports = { messageQueue, imageQueue };

