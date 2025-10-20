const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const ChannelMember = sequelize.define('ChannelMember', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  channelId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'channels',
      key: 'id'
    }
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('owner', 'admin', 'member'),
    defaultValue: 'member'
  },
  lastRead: {
    type: DataTypes.DATE,
    allowNull: true
  },
  isMuted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'channel_members',
  indexes: [
    {
      unique: true,
      fields: ['channel_id', 'user_id']
    }
  ]
});

module.exports = ChannelMember;

