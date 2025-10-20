# Real-Time Chat Platform

A professional, industrial-grade real-time chat platform built with modern web technologies.

## 🚀 Features

- **Real-time Messaging**: Instant message delivery using Socket.io
- **User Authentication**: Secure JWT-based authentication
- **Channel System**: Create and join public/private channels
- **Image Sharing**: Upload and share images in conversations
- **User Presence**: See who's online, away, or busy
- **Typing Indicators**: Real-time typing status
- **Message Queue**: Bull queue for message processing
- **Caching**: Redis for caching and session management
- **Professional UI**: Modern, responsive design suitable for industrial use

## 🛠 Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Real-time**: Socket.io with Redis adapter
- **Database**: PostgreSQL with Sequelize ORM
- **Cache/Queue**: Redis & Bull
- **Authentication**: JWT tokens
- **File Upload**: Multer

### Frontend
- **Framework**: React with TypeScript
- **State Management**: Context API
- **Real-time**: Socket.io Client
- **HTTP Client**: Axios
- **Styling**: Custom CSS with CSS Variables

### DevOps
- **Containerization**: Docker & Docker Compose
- **Deployment**: AWS/Heroku ready
- **Database**: PostgreSQL
- **Cache**: Redis

## 📋 Prerequisites

- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

## 🔧 Installation

### Using Docker (Recommended)

1. Clone the repository:
```bash
git clone <repository-url>
cd chat-platform
```

2. Create environment file:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Start with Docker Compose:
```bash
docker-compose up -d
```

The application will be available at `http://localhost:5000`

### Manual Installation

1. Install dependencies:
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd client && npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your database and Redis credentials
```

3. Set up PostgreSQL database:
```bash
createdb chat_platform
```

4. Run migrations:
```bash
npm run migrate
```

5. Start Redis:
```bash
redis-server
```

6. Start the development servers:
```bash
# Terminal 1 - Backend
npm run dev

# Terminal 2 - Frontend
cd client && npm start
```

## 🚢 Deployment

### Heroku

1. Create a Heroku app:
```bash
heroku create your-app-name
```

2. Add PostgreSQL and Redis addons:
```bash
heroku addons:create heroku-postgresql:hobby-dev
heroku addons:create heroku-redis:hobby-dev
```

3. Set environment variables:
```bash
heroku config:set JWT_SECRET=your_secret_key
heroku config:set NODE_ENV=production
```

4. Deploy using Docker:
```bash
heroku stack:set container
git push heroku main
```

### AWS

The application includes Docker configuration for easy deployment to:
- **AWS ECS**: Use the provided Dockerfile
- **AWS Elastic Beanstalk**: Deploy with Docker
- **AWS EC2**: Run using Docker Compose

Ensure you have:
- RDS PostgreSQL instance
- ElastiCache Redis cluster
- Load balancer (for multiple instances)

## 📁 Project Structure

```
chat-platform/
├── config/              # Configuration files
│   ├── database.js      # PostgreSQL configuration
│   ├── redis.js         # Redis client
│   └── queue.js         # Bull queue setup
├── models/              # Database models
│   ├── User.js
│   ├── Channel.js
│   ├── Message.js
│   └── ChannelMember.js
├── routes/              # API routes
│   ├── auth.js
│   ├── users.js
│   ├── channels.js
│   └── messages.js
├── middleware/          # Express middleware
│   ├── auth.js
│   └── upload.js
├── socket/              # Socket.io handlers
│   └── socketHandler.js
├── client/              # React frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── contexts/    # React contexts
│   │   ├── config.ts    # Frontend config
│   │   └── App.tsx
│   └── public/
├── uploads/             # File uploads directory
├── scripts/             # Utility scripts
├── Dockerfile           # Docker configuration
├── docker-compose.yml   # Docker Compose setup
├── server.js            # Express server entry point
└── package.json
```



## 🧪 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/status` - Update user status

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/profile` - Update profile
- `POST /api/users/avatar` - Upload avatar

### Channels
- `GET /api/channels` - Get user's channels
- `POST /api/channels` - Create channel
- `GET /api/channels/:id` - Get channel details
- `POST /api/channels/:id/join` - Join channel
- `POST /api/channels/:id/leave` - Leave channel
- `PUT /api/channels/:id` - Update channel

### Messages
- `GET /api/messages/:channelId` - Get channel messages
- `POST /api/messages` - Send text message
- `POST /api/messages/image` - Send image message
- `PUT /api/messages/:id` - Edit message
- `DELETE /api/messages/:id` - Delete message

## 🔌 Socket Events

### Client → Server
- `channel:join` - Join a channel
- `channel:leave` - Leave a channel
- `message:send` - Send a message
- `typing:start` - Start typing
- `typing:stop` - Stop typing
- `presence:update` - Update presence status

### Server → Client
- `message:new` - New message received
- `message:edited` - Message edited
- `message:deleted` - Message deleted
- `user:online` - User came online
- `user:offline` - User went offline
- `user:typing` - User is typing
- `user:typing:stop` - User stopped typing
- `user:status` - User status changed

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with modern web technologies
- Designed for industrial/enterprise use
- Scalable and production-ready architecture

## 📞 Support

For support, please open an issue in the repository or contact the development team.

