import React, { useEffect, useRef, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import MessageActions from './MessageActions';
import MessageReactions from './MessageReactions';
import ImageViewer from './ImageViewer';
import FilePreview from './FilePreview';
import './Chat.css';
import './EnhancedStyles.css';

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

interface Message {
  id: string;
  content: string;
  type: string;
  imageUrl?: string;
  fileUrl?: string;
  fileName?: string;
  userId: string;
  createdAt: string;
  isEdited: boolean;
  reactions?: Reaction[];
  user: {
    id: string;
    username: string;
    displayName: string;
    avatar?: string;
  };
}

interface MessageListProps {
  messages: Message[];
  loading: boolean;
  typingUsers: string[];
  channelId: string;
  onEditMessage: (messageId: string, content: string) => void;
  onDeleteForEveryone: (messageId: string) => void;
  onDeleteForMe: (messageId: string) => void;
  onReactionUpdate: () => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  loading,
  typingUsers,
  channelId,
  onEditMessage,
  onDeleteForEveryone,
  onDeleteForMe,
  onReactionUpdate
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="messages-container">
        <div className="loading-messages">
          <div className="spinner"></div>
          <p>Loading messages...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="messages-container">
      <div className="messages-list">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`message ${message.userId === user?.id ? 'own-message' : ''}`}
            >
              <div className="message-avatar">
                {message.user.avatar ? (
                  <img src={`${API_URL}${message.user.avatar}`} alt={message.user.displayName} />
                ) : (
                  <div className="avatar-placeholder">
                    {message.user.displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="message-content">
                <div className="message-header">
                  <span className="message-author">{message.user.displayName}</span>
                  <span className="message-time">
                    {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                  </span>
                  {message.isEdited && (
                    <span className="message-edited">(edited)</span>
                  )}
                </div>
                {/* Image preview */}
                {message.type === 'image' && message.imageUrl && (
                  <div 
                    className="message-image"
                    onClick={() => setSelectedImage(`${API_URL}${message.imageUrl}`)}
                  >
                    <img src={`${API_URL}${message.imageUrl}`} alt="Uploaded" />
                  </div>
                )}

                {/* File previews (video, audio, pdf, document) */}
                {message.type !== 'image' && message.type !== 'text' && message.fileUrl && (
                  <FilePreview
                    type={message.type}
                    fileUrl={message.fileUrl}
                    fileName={message.fileName || 'Unknown file'}
                    content={message.content}
                  />
                )}

                {/* Text content */}
                {(message.type === 'text' || !message.fileUrl) && message.content && (
                  <div className="message-text">{message.content}</div>
                )}

                {/* Message Reactions */}
                <MessageReactions
                  messageId={message.id}
                  channelId={channelId}
                  reactions={message.reactions || []}
                  onReactionUpdate={onReactionUpdate}
                />
              </div>
              
              <MessageActions
                messageId={message.id}
                isOwnMessage={message.userId === user?.id}
                onEdit={() => onEditMessage(message.id, message.content)}
                onDeleteForEveryone={() => onDeleteForEveryone(message.id)}
                onDeleteForMe={() => onDeleteForMe(message.id)}
              />
            </div>
          ))
        )}
        
        {typingUsers.length > 0 && (
          <div className="typing-indicator">
            <div className="typing-avatar">
              <div className="avatar-placeholder">...</div>
            </div>
            <div className="typing-content">
              <span>
                {typingUsers.join(', ')} {typingUsers.length === 1 ? 'is' : 'are'} typing
              </span>
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Image Viewer */}
      {selectedImage && (
        <ImageViewer
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}
    </div>
  );
};

export default MessageList;

