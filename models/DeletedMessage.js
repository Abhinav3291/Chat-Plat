const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const DeletedMessage = sequelize.define('DeletedMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
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
  messageId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'message_id',
    references: {
      model: 'messages',
      key: 'id'
    },
    onDelete: 'CASCADE'
  }
}, {
  tableName: 'deleted_messages',
  indexes: [
    {
      unique: true,
      fields: ['user_id', 'message_id']
    },
    {
      fields: ['user_id']
    }
  ]
});

module.exports = DeletedMessage;

