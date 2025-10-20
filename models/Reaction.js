const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Reaction = sequelize.define('Reaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  messageId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'message_id',
    references: {
      model: 'messages',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id',
    references: {
      model: 'users',
      key: 'id'
    },
    onDelete: 'CASCADE'
  },
  emoji: {
    type: DataTypes.STRING(10),
    allowNull: false
  }
}, {
  tableName: 'reactions',
  indexes: [
    {
      unique: true,
      fields: ['message_id', 'user_id', 'emoji']
    },
    {
      fields: ['message_id']
    }
  ]
});

module.exports = Reaction;

