const express = require('express');
const { Reaction, Message, User, ChannelMember } = require('../models');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   POST /api/reactions
// @desc    Add a reaction to a message
// @access  Private
router.post('/', async (req, res, next) => {
  try {
    const { messageId, emoji } = req.body;

    if (!messageId || !emoji) {
      return res.status(400).json({ error: 'Message ID and emoji required' });
    }

    // Check if message exists
    const message = await Message.findByPk(messageId);
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

    // Check if reaction already exists
    const existingReaction = await Reaction.findOne({
      where: { messageId, userId: req.user.id, emoji }
    });

    if (existingReaction) {
      return res.status(400).json({ error: 'Already reacted with this emoji' });
    }

    // Create reaction
    const reaction = await Reaction.create({
      messageId,
      userId: req.user.id,
      emoji
    });

    // Fetch reaction with user details
    const reactionWithUser = await Reaction.findByPk(reaction.id, {
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'displayName', 'avatar']
      }]
    });

    res.json({
      success: true,
      reaction: reactionWithUser
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/reactions/:id
// @desc    Remove a reaction
// @access  Private
router.delete('/:id', async (req, res, next) => {
  try {
    const reaction = await Reaction.findByPk(req.params.id);

    if (!reaction) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    // Only the user who created the reaction can delete it
    if (reaction.userId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    await reaction.destroy();

    res.json({
      success: true,
      message: 'Reaction removed'
    });
  } catch (error) {
    next(error);
  }
});

// @route   DELETE /api/reactions/message/:messageId/emoji/:emoji
// @desc    Remove user's reaction by emoji from a message
// @access  Private
router.delete('/message/:messageId/emoji/:emoji', async (req, res, next) => {
  try {
    const { messageId, emoji } = req.params;

    const reaction = await Reaction.findOne({
      where: { messageId, userId: req.user.id, emoji }
    });

    if (!reaction) {
      return res.status(404).json({ error: 'Reaction not found' });
    }

    await reaction.destroy();

    res.json({
      success: true,
      message: 'Reaction removed',
      reactionId: reaction.id
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/reactions/message/:messageId
// @desc    Get all reactions for a message
// @access  Private
router.get('/message/:messageId', async (req, res, next) => {
  try {
    const reactions = await Reaction.findAll({
      where: { messageId: req.params.messageId },
      include: [{
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'displayName', 'avatar']
      }],
      order: [['createdAt', 'ASC']]
    });

    res.json({
      success: true,
      reactions
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

