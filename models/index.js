const User = require('./User');
const Channel = require('./Channel');
const Message = require('./Message');
const ChannelMember = require('./ChannelMember');
const DeletedMessage = require('./DeletedMessage');
const Reaction = require('./Reaction');

// User and Channel relationships
User.hasMany(Channel, { foreignKey: 'createdBy', as: 'createdChannels' });
Channel.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// User and Message relationships
User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Channel and Message relationships
Channel.hasMany(Message, { foreignKey: 'channelId', as: 'messages' });
Message.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });

// Message reply relationships
Message.belongsTo(Message, { foreignKey: 'replyTo', as: 'parentMessage' });
Message.hasMany(Message, { foreignKey: 'replyTo', as: 'replies' });

// Channel Members - Many-to-Many through ChannelMember
User.belongsToMany(Channel, { 
  through: ChannelMember, 
  foreignKey: 'userId', 
  as: 'channels' 
});
Channel.belongsToMany(User, { 
  through: ChannelMember, 
  foreignKey: 'channelId', 
  as: 'members' 
});

// Direct access to ChannelMember
User.hasMany(ChannelMember, { foreignKey: 'userId', as: 'memberships' });
Channel.hasMany(ChannelMember, { foreignKey: 'channelId', as: 'channelMembers' });
ChannelMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
ChannelMember.belongsTo(Channel, { foreignKey: 'channelId', as: 'channel' });

// DeletedMessage relationships
DeletedMessage.belongsTo(User, { foreignKey: 'userId', as: 'user' });
DeletedMessage.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
User.hasMany(DeletedMessage, { foreignKey: 'userId', as: 'deletedMessages' });
Message.hasMany(DeletedMessage, { foreignKey: 'messageId', as: 'deletedBy' });

// Reaction relationships
Reaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Reaction.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });
User.hasMany(Reaction, { foreignKey: 'userId', as: 'reactions' });
Message.hasMany(Reaction, { foreignKey: 'messageId', as: 'reactions' });

module.exports = {
  User,
  Channel,
  Message,
  ChannelMember,
  DeletedMessage,
  Reaction
};

