const jwt = require('jsonwebtoken');
const { User, Channel, ChannelMember } = require('../models');
const redisClient = require('../config/redis');

module.exports = (io) => {
  // Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findByPk(decoded.id);

      if (!user || !user.isActive) {
        return next(new Error('Authentication error'));
      }

      socket.userId = user.id;
      socket.user = user;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', async (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Update user status to online
    await socket.user.update({ status: 'online', lastSeen: new Date() });
    
    // Store user socket mapping in Redis
    await redisClient.set(`user:${socket.userId}:socketId`, socket.id);
    await redisClient.set(`socket:${socket.id}:userId`, socket.userId);

    // Join user's channels
    const memberships = await ChannelMember.findAll({
      where: { userId: socket.userId },
      include: [{ model: Channel, as: 'channel' }]
    });

    for (const membership of memberships) {
      socket.join(`channel:${membership.channelId}`);
    }

    // Emit online status to all channels
    memberships.forEach(membership => {
      socket.to(`channel:${membership.channelId}`).emit('user:online', {
        userId: socket.userId,
        status: 'online'
      });
    });

    // Handle joining a channel
    socket.on('channel:join', async (data) => {
      try {
        const { channelId } = data;
        
        // Verify membership
        const isMember = await ChannelMember.findOne({
          where: { channelId, userId: socket.userId }
        });

        if (isMember) {
          socket.join(`channel:${channelId}`);
          socket.emit('channel:joined', { channelId });
        }
      } catch (error) {
        console.error('Error joining channel:', error);
        socket.emit('error', { message: 'Failed to join channel' });
      }
    });

    // Handle leaving a channel
    socket.on('channel:leave', (data) => {
      const { channelId } = data;
      socket.leave(`channel:${channelId}`);
      socket.emit('channel:left', { channelId });
    });

    // Handle new message
    socket.on('message:send', async (data) => {
      try {
        const { channelId, messageId } = data;
        
        // Verify membership
        const isMember = await ChannelMember.findOne({
          where: { channelId, userId: socket.userId }
        });

        if (!isMember) {
          return socket.emit('error', { message: 'Not a member of this channel' });
        }

        // Broadcast to channel
        io.to(`channel:${channelId}`).emit('message:new', data);
      } catch (error) {
        console.error('Error sending message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Handle message editing
    socket.on('message:edit', async (data) => {
      try {
        const { channelId, messageId, content } = data;
        io.to(`channel:${channelId}`).emit('message:edited', {
          messageId,
          content,
          isEdited: true
        });
      } catch (error) {
        console.error('Error editing message:', error);
      }
    });

    // Handle message deletion
    socket.on('message:delete', async (data) => {
      try {
        const { channelId, messageId } = data;
        io.to(`channel:${channelId}`).emit('message:deleted', { messageId });
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    });

    // Handle reaction added
    socket.on('reaction:add', async (data) => {
      try {
        const { channelId, messageId, reaction } = data;
        io.to(`channel:${channelId}`).emit('reaction:added', {
          messageId,
          reaction
        });
      } catch (error) {
        console.error('Error adding reaction:', error);
      }
    });

    // Handle reaction removed
    socket.on('reaction:remove', async (data) => {
      try {
        const { channelId, messageId, reactionId } = data;
        io.to(`channel:${channelId}`).emit('reaction:removed', {
          messageId,
          reactionId
        });
      } catch (error) {
        console.error('Error removing reaction:', error);
      }
    });

    // Handle typing indicator
    socket.on('typing:start', async (data) => {
      try {
        const { channelId } = data;
        socket.to(`channel:${channelId}`).emit('user:typing', {
          userId: socket.userId,
          username: socket.user.displayName || socket.user.username,
          channelId
        });
      } catch (error) {
        console.error('Error handling typing:', error);
      }
    });

    socket.on('typing:stop', async (data) => {
      try {
        const { channelId } = data;
        socket.to(`channel:${channelId}`).emit('user:typing:stop', {
          userId: socket.userId,
          username: socket.user.displayName || socket.user.username,
          channelId
        });
      } catch (error) {
        console.error('Error handling typing stop:', error);
      }
    });

    // Handle user presence updates
    socket.on('presence:update', async (data) => {
      try {
        const { status } = data;
        
        if (['online', 'away', 'busy', 'offline'].includes(status)) {
          await socket.user.update({ status, lastSeen: new Date() });
          
          // Notify all user's channels
          memberships.forEach(membership => {
            socket.to(`channel:${membership.channelId}`).emit('user:status', {
              userId: socket.userId,
              status
            });
          });
        }
      } catch (error) {
        console.error('Error updating presence:', error);
      }
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      console.log(`User disconnected: ${socket.userId}`);

      try {
        // Update user status to offline
        await socket.user.update({ status: 'offline', lastSeen: new Date() });

        // Remove from Redis
        await redisClient.del(`user:${socket.userId}:socketId`);
        await redisClient.del(`socket:${socket.id}:userId`);

        // Notify all channels
        memberships.forEach(membership => {
          socket.to(`channel:${membership.channelId}`).emit('user:offline', {
            userId: socket.userId,
            status: 'offline'
          });
        });
      } catch (error) {
        console.error('Error handling disconnect:', error);
      }
    });

    // WebRTC Video Call Signaling
    socket.on('call:initiate', async (data) => {
      try {
        const { targetUserId, channelId } = data;
        
        // Get target user's socket
        const targetSocketId = await redisClient.get(`user:${targetUserId}:socketId`);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('call:incoming', {
            callerId: socket.userId,
            callerName: socket.user.displayName || socket.user.username,
            callerAvatar: socket.user.avatar,
            channelId
          });
        }
      } catch (error) {
        console.error('Error initiating call:', error);
      }
    });

    socket.on('call:accept', async (data) => {
      try {
        const { callerId } = data;
        const callerSocketId = await redisClient.get(`user:${callerId}:socketId`);
        
        if (callerSocketId) {
          io.to(callerSocketId).emit('call:accepted', {
            userId: socket.userId,
            userName: socket.user.displayName || socket.user.username
          });
        }
      } catch (error) {
        console.error('Error accepting call:', error);
      }
    });

    socket.on('call:reject', async (data) => {
      try {
        const { callerId } = data;
        const callerSocketId = await redisClient.get(`user:${callerId}:socketId`);
        
        if (callerSocketId) {
          io.to(callerSocketId).emit('call:rejected', {
            userId: socket.userId,
            userName: socket.user.displayName || socket.user.username
          });
        }
      } catch (error) {
        console.error('Error rejecting call:', error);
      }
    });

    socket.on('call:offer', async (data) => {
      try {
        const { targetUserId, offer } = data;
        const targetSocketId = await redisClient.get(`user:${targetUserId}:socketId`);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('call:offer', {
            callerId: socket.userId,
            offer
          });
        }
      } catch (error) {
        console.error('Error sending offer:', error);
      }
    });

    socket.on('call:answer', async (data) => {
      try {
        const { targetUserId, answer } = data;
        const targetSocketId = await redisClient.get(`user:${targetUserId}:socketId`);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('call:answer', {
            userId: socket.userId,
            answer
          });
        }
      } catch (error) {
        console.error('Error sending answer:', error);
      }
    });

    socket.on('call:ice-candidate', async (data) => {
      try {
        const { targetUserId, candidate } = data;
        const targetSocketId = await redisClient.get(`user:${targetUserId}:socketId`);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('call:ice-candidate', {
            userId: socket.userId,
            candidate
          });
        }
      } catch (error) {
        console.error('Error sending ICE candidate:', error);
      }
    });

    socket.on('call:end', async (data) => {
      try {
        const { targetUserId } = data;
        const targetSocketId = await redisClient.get(`user:${targetUserId}:socketId`);
        
        if (targetSocketId) {
          io.to(targetSocketId).emit('call:ended', {
            userId: socket.userId
          });
        }
      } catch (error) {
        console.error('Error ending call:', error);
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
};

