const express = require('express');
const { Channel, ChannelMember, User, Message } = require('../models');
const { protect } = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/channels
// @desc    Get all channels for current user
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const channels = await Channel.findAll({
      include: [
        {
          model: User,
          as: 'members',
          where: { id: req.user.id },
          through: { attributes: ['role', 'lastRead', 'isMuted'] }
        },
        {
          model: Message,
          as: 'messages',
          limit: 1,
          order: [['createdAt', 'DESC']],
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'displayName', 'avatar']
          }]
        }
      ],
      order: [['updatedAt', 'DESC']]
    });

    res.json({
      success: true,
      channels
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/channels/dm
// @desc    Create or get DM channel with another user
// @access  Private
router.post('/dm', async (req, res, next) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot create DM with yourself' });
    }

    // Check if DM already exists between these two users
    const existingDM = await Channel.findOne({
      where: { type: 'direct' },
      include: [{
        model: User,
        as: 'members',
        where: { id: { [Op.in]: [req.user.id, userId] } },
        through: { attributes: [] }
      }]
    });

    // Check if this DM has exactly 2 members and they're the right ones
    if (existingDM) {
      const memberIds = existingDM.members.map(m => m.id).sort();
      const targetIds = [req.user.id, userId].sort();
      
      if (memberIds.length === 2 && memberIds[0] === targetIds[0] && memberIds[1] === targetIds[1]) {
        // Fetch full DM details with the other user info
        const dmChannel = await Channel.findByPk(existingDM.id, {
          include: [{
            model: User,
            as: 'members',
            attributes: ['id', 'username', 'displayName', 'avatar', 'status'],
            through: { attributes: ['role'] }
          }]
        });

        return res.json({
          success: true,
          channel: dmChannel,
          isNew: false
        });
      }
    }

    // Get other user details
    const otherUser = await User.findByPk(userId);
    if (!otherUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create new DM channel
    const dmChannel = await Channel.create({
      name: `${req.user.displayName}, ${otherUser.displayName}`,
      type: 'direct',
      createdBy: req.user.id
    });

    // Add both users as members
    await ChannelMember.create({
      channelId: dmChannel.id,
      userId: req.user.id,
      role: 'member'
    });

    await ChannelMember.create({
      channelId: dmChannel.id,
      userId: otherUser.id,
      role: 'member'
    });

    // Fetch complete channel with members
    const newChannel = await Channel.findByPk(dmChannel.id, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'username', 'displayName', 'avatar', 'status'],
        through: { attributes: ['role'] }
      }]
    });

    res.json({
      success: true,
      channel: newChannel,
      isNew: true
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/channels/public
// @desc    Get all public channels (for browsing/discovery)
// @access  Private
router.get('/public', async (req, res, next) => {
  try {
    const publicChannels = await Channel.findAll({
      where: {
        type: 'public',
        isActive: true
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'displayName', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Check which channels the user is already a member of
    const userMemberships = await ChannelMember.findAll({
      where: { userId: req.user.id },
      attributes: ['channelId']
    });

    const memberChannelIds = userMemberships.map(m => m.channelId);

    // Add isMember flag to each channel
    const channelsWithMemberStatus = publicChannels.map(channel => ({
      ...channel.toJSON(),
      isMember: memberChannelIds.includes(channel.id)
    }));

    res.json({
      success: true,
      channels: channelsWithMemberStatus
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/channels
// @desc    Create a new channel
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { name, description, type } = req.body;

    const channel = await Channel.create({
      name,
      description,
      type: type || 'public',
      createdBy: req.user.id
    });

    // Add creator as owner
    await ChannelMember.create({
      channelId: channel.id,
      userId: req.user.id,
      role: 'owner'
    });

    res.status(201).json({
      success: true,
      channel
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/channels/:id
// @desc    Get channel by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const channel = await Channel.findByPk(req.params.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'displayName', 'avatar', 'status'],
          through: { attributes: ['role'] }
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'displayName', 'avatar']
        }
      ]
    });

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is member
    const isMember = await ChannelMember.findOne({
      where: { channelId: channel.id, userId: req.user.id }
    });

    if (!isMember && channel.type === 'private') {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      success: true,
      channel
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/channels/:id/join
// @desc    Join a channel
// @access  Private
router.post('/:id/join', async (req, res, next) => {
  try {
    const channel = await Channel.findByPk(req.params.id);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    if (channel.type === 'private') {
      return res.status(403).json({ error: 'Cannot join private channel' });
    }

    const existing = await ChannelMember.findOne({
      where: { channelId: channel.id, userId: req.user.id }
    });

    if (existing) {
      return res.status(400).json({ error: 'Already a member' });
    }

    await ChannelMember.create({
      channelId: channel.id,
      userId: req.user.id,
      role: 'member'
    });

    res.json({
      success: true,
      message: 'Joined channel successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/channels/:id/leave
// @desc    Leave a channel
// @access  Private
router.post('/:id/leave', async (req, res, next) => {
  try {
    const membership = await ChannelMember.findOne({
      where: { channelId: req.params.id, userId: req.user.id }
    });

    if (!membership) {
      return res.status(404).json({ error: 'Not a member of this channel' });
    }

    if (membership.role === 'owner') {
      return res.status(400).json({ error: 'Owner cannot leave channel' });
    }

    await membership.destroy();

    res.json({
      success: true,
      message: 'Left channel successfully'
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/channels/:id
// @desc    Update channel
// @access  Private
router.put('/:id', async (req, res, next) => {
  try {
    const channel = await Channel.findByPk(req.params.id);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is admin or owner
    const membership = await ChannelMember.findOne({
      where: { channelId: channel.id, userId: req.user.id }
    });

    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const { name, description } = req.body;
    await channel.update({ name, description });

    res.json({
      success: true,
      channel
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/channels/:id
// @desc    Delete a channel (owner only)
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const channel = await Channel.findByPk(req.params.id);

    if (!channel) {
      return res.status(404).json({ error: 'Channel not found' });
    }

    // Check if user is the owner
    if (channel.createdBy !== req.user.id) {
      return res.status(403).json({ error: 'Only the channel owner can delete this channel' });
    }

    // Delete the channel (cascade will handle members and messages)
    await channel.destroy();

    res.json({
      success: true,
      message: 'Channel deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

