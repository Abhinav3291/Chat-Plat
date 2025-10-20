const express = require('express');
const { User } = require('../models');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// All routes are protected
router.use(protect);

// @route   GET /api/users
// @desc    Get all users (with optional search)
// @access  Private
router.get('/', async (req, res, next) => {
  try {
    const { search } = req.query;
    const whereClause = { 
      isActive: true,
      id: { [require('sequelize').Op.ne]: req.user.id } // Exclude current user
    };

    // Add search filter if provided
    if (search) {
      whereClause[require('sequelize').Op.or] = [
        { username: { [require('sequelize').Op.iLike]: `%${search}%` } },
        { displayName: { [require('sequelize').Op.iLike]: `%${search}%` } }
      ];
    }

    const users = await User.findAll({
      where: whereClause,
      attributes: ['id', 'username', 'displayName', 'avatar', 'status', 'lastSeen'],
      order: [['displayName', 'ASC']],
      limit: 50
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    next(error);
  }
});

// @route   GET /api/users/:id
// @desc    Get user by ID
// @access  Private
router.get('/:id', async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ['id', 'username', 'displayName', 'avatar', 'status', 'lastSeen']
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    next(error);
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', async (req, res, next) => {
  try {
    const { displayName } = req.body;

    await req.user.update({ displayName });

    res.json({
      success: true,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', upload.single('avatar'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const avatarUrl = `/uploads/${req.file.filename}`;
    await req.user.update({ avatar: avatarUrl });

    res.json({
      success: true,
      avatar: avatarUrl,
      user: req.user
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

