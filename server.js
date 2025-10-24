require('dotenv').config();
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const { sequelize } = require('./config/database');
const redisClient = require('./config/redis');
const socketHandler = require('./socket/socketHandler');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = socketio(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Optional Redis adapter for horizontal scaling
if (process.env.REDIS_URL || process.env.REDIS_HOST) {
  try {
    const redisAdapter = require('socket.io-redis');
    const redisUrl = process.env.REDIS_URL;
    
    if (redisUrl) {
      // Use REDIS_URL for cloud platforms
      io.adapter(redisAdapter(redisUrl));
    } else {
      // Use individual params for local development
      io.adapter(redisAdapter({
        host: process.env.REDIS_HOST,
        port: process.env.REDIS_PORT,
        password: process.env.REDIS_PASSWORD
      }));
    }
    console.log('Socket.io using Redis adapter for horizontal scaling');
  } catch (error) {
    console.log('Redis adapter not available, using in-memory adapter');
  }
} else {
  console.log('Socket.io using in-memory adapter (single instance)');
}

// Middleware
app.use(helmet());
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/channels', require('./routes/channels'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/reactions', require('./routes/reactions'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.io connection handling
socketHandler(io);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

const PORT = process.env.PORT || 5000;

// Initialize database and start server
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('✓ Database connected successfully');
    
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    console.log('✓ Database synced');
    
    // Connect to Redis only if configured
    if (redisClient) {
      try {
        await redisClient.connect();
        console.log('✓ Redis connected successfully');
      } catch (error) {
        console.log('⚠ Redis connection failed (optional):', error.message);
      }
    }
    
    server.listen(PORT, () => {
      console.log(`✓ Server running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV}`);
      console.log(`✓ Mode: ${redisClient ? 'Production (with Redis)' : 'Development (without Redis)'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, shutting down gracefully...');
  await redisClient.quit();
  await sequelize.close();
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

