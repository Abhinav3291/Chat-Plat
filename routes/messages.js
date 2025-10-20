const express = require('express');
const { Message, User, Channel, ChannelMember, DeletedMessage, Reaction } = require('../models');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { messageQueue, imageQueue } = require('../config/queue');
const { Op } = require('sequelize');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/messages/:channelId
// @desc    Get messages for a channel
// @access  Private
router.get('/:channelId', async (req, res, next) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before } = req.query;

    // Check if user is member
    const isMember = await ChannelMember.findOne({
      where: { channelId, userId: req.user.id }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const whereClause = { 
      channelId,
      isDeleted: false
    };

    if (before) {
      whereClause.createdAt = { [Op.lt]: new Date(before) };
    }

    const messages = await Message.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'username', 'displayName', 'avatar']
        },
        {
          model: Message,
          as: 'parentMessage',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'displayName']
          }]
        },
        {
          model: DeletedMessage,
          as: 'deletedBy',
          attributes: ['userId'],
          required: false
        },
        {
          model: Reaction,
          as: 'reactions',
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'displayName', 'avatar']
          }],
          required: false
        }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit)
    });

    // Filter out messages deleted by this user
    const filteredMessages = messages.filter(msg => {
      const deletedByUsers = msg.deletedBy || [];
      return !deletedByUsers.some(d => d.userId === req.user.id);
    });

    // Update last read
    await isMember.update({ lastRead: new Date() });

    res.json({
      success: true,
      messages: filteredMessages.reverse()
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages
// @desc    Send a message
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { channelId, content, replyTo } = req.body;

    // Check if user is member
    const isMember = await ChannelMember.findOne({
      where: { channelId, userId: req.user.id }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const message = await Message.create({
      channelId,
      userId: req.user.id,
      content,
      replyTo: replyTo || null,
      type: 'text'
    });

    // Load user data
    await message.reload({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'displayName', 'avatar']
      }]
    });

    // Add to processing queue
    await messageQueue.add({
      messageId: message.id,
      channelId,
      content
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/image
// @desc    Send image message
// @access  Private
router.post('/image', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { channelId, content } = req.body;

    // Check if user is member
    const isMember = await ChannelMember.findOne({
      where: { channelId, userId: req.user.id }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;

    const message = await Message.create({
      channelId,
      userId: req.user.id,
      content: content || '',
      imageUrl,
      type: 'image'
    });

    // Load user data
    await message.reload({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'displayName', 'avatar']
      }]
    });

    // Add to image processing queue
    await imageQueue.add({
      messageId: message.id,
      imagePath: imageUrl
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/file
// @desc    Send file message (document, video, audio, etc.)
// @access  Private
router.post('/file', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { channelId, content } = req.body;

    // Check if user is member
    const isMember = await ChannelMember.findOne({
      where: { channelId, userId: req.user.id }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    const fileName = req.file.originalname;
    const fileType = req.file.mimetype;

    // Determine message type based on mime type
    let messageType = 'file';
    if (fileType.startsWith('video/')) {
      messageType = 'video';
    } else if (fileType.startsWith('audio/')) {
      messageType = 'audio';
    } else if (fileType === 'application/pdf') {
      messageType = 'pdf';
    } else if (fileType.startsWith('application/') || fileType.startsWith('text/')) {
      messageType = 'document';
    }

    const message = await Message.create({
      channelId,
      userId: req.user.id,
      content: content || fileName,
      fileUrl,
      fileName,
      type: messageType
    });

    // Load user data
    await message.reload({
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'displayName', 'avatar']
      }]
    });

    res.status(201).json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/messages/:id
// @desc    Edit a message
// @access  Private
router.put('/:id', async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { content } = req.body;
    await message.update({ content, isEdited: true });

    res.json({
      success: true,
      message
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/messages/:id
// @desc    Delete a message for everyone
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    if (message.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await message.update({ isDeleted: true, content: 'This message was deleted' });

    res.json({
      success: true,
      message: 'Message deleted for everyone'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/messages/:id/delete-for-me
// @desc    Delete a message for current user only
// @access  Private
router.post('/:id/delete-for-me', async (req, res, next) => {
  try {
    const message = await Message.findByPk(req.params.id);

    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    // Check if user is member of the channel
    const isMember = await ChannelMember.findOne({
      where: { channelId: message.channelId, userId: req.user.id }
    });

    if (!isMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check if already deleted for this user
    const existing = await DeletedMessage.findOne({
      where: { userId: req.user.id, messageId: message.id }
    });

    if (!existing) {
      await DeletedMessage.create({
        userId: req.user.id,
        messageId: message.id
      });
    }

    res.json({
      success: true,
      message: 'Message deleted for you'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

