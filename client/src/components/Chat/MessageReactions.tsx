import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import './Chat.css';

interface Reaction {
  id: string;
  emoji: string;
  userId: string;
  user: {
    id: string;
    username: string;
    displayName: string;
  };
}

interface MessageReactionsProps {
  messageId: string;
  channelId: string;
  reactions: Reaction[];
  onReactionUpdate: () => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😂', '😮', '😢', '🔥', '🎉', '👏'];

const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  channelId,
  reactions,
  onReactionUpdate
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const { user, token } = useAuth();
  const { socket } = useSocket();

  // Group reactions by emoji
  const groupedReactions = reactions.reduce((acc, reaction) => {
    if (!acc[reaction.emoji]) {
      acc[reaction.emoji] = [];
    }
    acc[reaction.emoji].push(reaction);
    return acc;
  }, {} as Record<string, Reaction[]>);

  const handleAddReaction = async (emoji: string) => {
    try {
      // Check if user already reacted with this emoji
      const existingReaction = reactions.find(
        (r) => r.userId === user?.id && r.emoji === emoji
      );

      if (existingReaction) {
        // Remove reaction
        await axios.delete(
          `${API_URL}/api/reactions/message/${messageId}/emoji/${emoji}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Emit socket event
        socket?.emit('reaction:remove', {
          channelId,
          messageId,
          reactionId: existingReaction.id
        });
      } else {
        // Add reaction
        const response = await axios.post(
          `${API_URL}/api/reactions`,
          { messageId, emoji },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Emit socket event
        socket?.emit('reaction:add', {
          channelId,
          messageId,
          reaction: response.data.reaction
        });
      }

      onReactionUpdate();
      setShowPicker(false);
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const getUserReaction = (emoji: string) => {
    return reactions.find((r) => r.userId === user?.id && r.emoji === emoji);
  };

  return (
    <div className="message-reactions-container">
      <div className="reactions-display">
        {Object.entries(groupedReactions).map(([emoji, emojiReactions]) => (
          <button
            key={emoji}
            className={`reaction-button ${getUserReaction(emoji) ? 'user-reacted' : ''}`}
            onClick={() => handleAddReaction(emoji)}
            title={emojiReactions.map((r) => r.user.displayName).join(', ')}
          >
            <span className="reaction-emoji">{emoji}</span>
            <span className="reaction-count">{emojiReactions.length}</span>
          </button>
        ))}

        <button
          className="reaction-add-button"
          onClick={() => setShowPicker(!showPicker)}
          title="Add reaction"
        >
          ➕
        </button>
      </div>

      {showPicker && (
        <div className="reaction-picker">
          {COMMON_EMOJIS.map((emoji) => (
            <button
              key={emoji}
              className="emoji-button"
              onClick={() => handleAddReaction(emoji)}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageReactions;

