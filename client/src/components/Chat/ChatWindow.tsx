import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import VideoCall from '../VideoCall/VideoCall';
import IncomingCall from '../VideoCall/IncomingCall';
import EditMessageModal from './EditMessageModal';
import ChannelSettings from './ChannelSettings';
import './Chat.css';
import './EnhancedStyles.css';

interface Channel {
  id: string;
  name: string;
  type: string;
  description?: string;
  createdBy: string;
  creator?: {
    id: string;
    username: string;
    displayName: string;
  };
  members?: any[];
}

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
  userId: string;
  channelId: string;
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

interface ChatWindowProps {
  channel: Channel;
  onChannelDeleted?: () => void;
  onChannelLeft?: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ channel, onChannelDeleted, onChannelLeft }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [channelDetails, setChannelDetails] = useState<Channel | null>(null);
  const [editingMessage, setEditingMessage] = useState<{ id: string; content: string } | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [inCall, setInCall] = useState(false);
  const [callTargetUser, setCallTargetUser] = useState<{ id: string; name: string } | null>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    callerAvatar?: string;
    channelId: string;
  } | null>(null);
  const { token, user } = useAuth();
  const { socket } = useSocket();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (channel) {
      fetchMessages();
      fetchChannelDetails();
      if (socket) {
        socket.emit('channel:join', { channelId: channel.id });
      }
    }

    return () => {
      if (socket && channel) {
        socket.emit('channel:leave', { channelId: channel.id });
      }
    };
  }, [channel]);

  useEffect(() => {
    if (!socket) return;

    socket.on('message:new', (data: any) => {
      if (data.channelId === channel.id) {
        setMessages((prev) => {
          // Check if message already exists to prevent duplicates
          const messageExists = prev.some(msg => msg.id === data.message.id);
          if (messageExists) {
            return prev;
          }
          return [...prev, data.message];
        });
      }
    });

    socket.on('message:edited', (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, content: data.content, isEdited: true }
            : msg
        )
      );
    });

    socket.on('message:deleted', (data: any) => {
      setMessages((prev) => prev.filter((msg) => msg.id !== data.messageId));
    });

    // Handle reactions
    socket.on('reaction:added', (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, reactions: [...(msg.reactions || []), data.reaction] }
            : msg
        )
      );
    });

    socket.on('reaction:removed', (data: any) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === data.messageId
            ? { ...msg, reactions: (msg.reactions || []).filter((r) => r.id !== data.reactionId) }
            : msg
        )
      );
    });

    socket.on('user:typing', (data: any) => {
      if (data.channelId === channel.id && data.userId !== user?.id) {
        setTypingUsers((prev) => {
          if (prev.includes(data.username)) {
            return prev;
          }
          return [...prev, data.username];
        });
        
        // Auto-clear typing indicator after 3 seconds if no stop event received
        setTimeout(() => {
          setTypingUsers((prev) => prev.filter((u) => u !== data.username));
        }, 3000);
      }
    });

    socket.on('user:typing:stop', (data: any) => {
      if (data.channelId === channel.id) {
        setTypingUsers((prev) => prev.filter((u) => u !== data.username));
      }
    });

    // Video call handlers
    socket.on('call:incoming', (data: any) => {
      setIncomingCall({
        callerId: data.callerId,
        callerName: data.callerName,
        callerAvatar: data.callerAvatar,
        channelId: data.channelId
      });
    });

    socket.on('call:accepted', (data: any) => {
      setCallTargetUser({ id: data.userId, name: data.userName });
      setInCall(true);
    });

    socket.on('call:rejected', (data: any) => {
      alert(`${data.userName} declined your call`);
      setCallTargetUser(null);
    });

    return () => {
      socket.off('message:new');
      socket.off('message:edited');
      socket.off('message:deleted');
      socket.off('reaction:added');
      socket.off('reaction:removed');
      socket.off('user:typing');
      socket.off('user:typing:stop');
      socket.off('call:incoming');
      socket.off('call:accepted');
      socket.off('call:rejected');
    };
  }, [socket, channel, user]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/api/messages/${channel.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMessages(response.data.messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChannelDetails = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/channels/${channel.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannelDetails(response.data.channel);
    } catch (error) {
      console.error('Error fetching channel details:', error);
    }
  };

  const handleSendMessage = async (content: string, file?: File, isImage?: boolean) => {
    try {
      if (file) {
        const formData = new FormData();
        const endpoint = isImage ? '/api/messages/image' : '/api/messages/file';
        const fieldName = isImage ? 'image' : 'file';
        
        formData.append(fieldName, file);
        formData.append('channelId', channel.id);
        formData.append('content', content);

        const response = await axios.post(`${API_URL}${endpoint}`, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });

        const newMessage = response.data.message;
        setMessages((prev) => [...prev, newMessage]);
        
        if (socket) {
          socket.emit('message:send', {
            channelId: channel.id,
            messageId: newMessage.id,
            message: newMessage
          });
        }
      } else {
        const response = await axios.post(
          `${API_URL}/api/messages`,
          {
            channelId: channel.id,
            content
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        const newMessage = response.data.message;
        setMessages((prev) => [...prev, newMessage]);
        
        if (socket) {
          socket.emit('message:send', {
            channelId: channel.id,
            messageId: newMessage.id,
            message: newMessage
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    if (!socket) return;

    if (isTyping) {
      socket.emit('typing:start', { channelId: channel.id });
      
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing:stop', { channelId: channel.id });
      }, 3000);
    } else {
      socket.emit('typing:stop', { channelId: channel.id });
    }
  };

  const handleStartCall = async () => {
    // Get the first member who is not the current user (for 1-on-1 calls)
    const otherMember = channelDetails?.members?.find((m: any) => m.id !== user?.id);
    
    if (!otherMember) {
      alert('No other user in this channel to call.');
      return;
    }

    setCallTargetUser({
      id: otherMember.id,
      name: otherMember.displayName || otherMember.username
    });

    if (socket) {
      socket.emit('call:initiate', {
        targetUserId: otherMember.id,
        channelId: channel.id
      });
    }

    setInCall(true);
  };

  const handleAcceptCall = () => {
    if (!incomingCall || !socket) return;

    setCallTargetUser({
      id: incomingCall.callerId,
      name: incomingCall.callerName
    });

    socket.emit('call:accept', { callerId: incomingCall.callerId });
    setInCall(true);
    setIncomingCall(null);
  };

  const handleRejectCall = () => {
    if (!incomingCall || !socket) return;

    socket.emit('call:reject', { callerId: incomingCall.callerId });
    setIncomingCall(null);
  };

  const handleCallEnd = () => {
    setInCall(false);
    setCallTargetUser(null);
  };

  const handleEditMessage = async (messageId: string, newContent: string) => {
    try {
      await axios.put(
        `${API_URL}/api/messages/${messageId}`,
        { content: newContent },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update local state
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true }
            : msg
        )
      );

      // Emit socket event
      if (socket) {
        socket.emit('message:edit', {
          channelId: channel.id,
          messageId,
          content: newContent
        });
      }

      setEditingMessage(null);
    } catch (error) {
      console.error('Error editing message:', error);
      alert('Failed to edit message');
    }
  };

  const handleDeleteForEveryone = async (messageId: string) => {
    try {
      await axios.delete(`${API_URL}/api/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Remove from local state
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));

      // Emit socket event
      if (socket) {
        socket.emit('message:delete', {
          channelId: channel.id,
          messageId
        });
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  const handleDeleteForMe = async (messageId: string) => {
    try {
      await axios.post(
        `${API_URL}/api/messages/${messageId}/delete-for-me`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Remove from local state (only for this user)
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message');
    }
  };

  return (
    <>
      <div className="chat-window">
        <div className="chat-header">
          <div className="channel-header-info">
            <h2>
              {channel.type === 'direct' ? '👤' : '#'} {channel.name}
            </h2>
            {channel.description && (
              <p className="channel-description">{channel.description}</p>
            )}
          </div>
          
          <div className="chat-header-actions">
            {/* Video call button (only for channels with members) */}
            {channelDetails?.members && channelDetails.members.length > 1 && (
              <button
                className="btn-video-call"
                onClick={handleStartCall}
                title="Start video call"
              >
                📹 Video Call
              </button>
            )}
            
            {/* Channel settings button */}
            <button
              className="btn-channel-settings"
              onClick={() => setShowSettings(true)}
              title="Channel settings"
            >
              ⚙️
            </button>
          </div>
        </div>

        <MessageList
          messages={messages}
          loading={loading}
          typingUsers={typingUsers}
          channelId={channel.id}
          onEditMessage={(id, content) => setEditingMessage({ id, content })}
          onDeleteForEveryone={handleDeleteForEveryone}
          onDeleteForMe={handleDeleteForMe}
          onReactionUpdate={fetchMessages}
        />
        
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
        />
      </div>

      {/* Incoming Call UI */}
      {incomingCall && !inCall && (
        <IncomingCall
          callerName={incomingCall.callerName}
          callerAvatar={incomingCall.callerAvatar}
          onAccept={handleAcceptCall}
          onReject={handleRejectCall}
        />
      )}

      {/* Video Call UI */}
      {inCall && callTargetUser && (
        <VideoCall
          targetUserId={callTargetUser.id}
          targetUserName={callTargetUser.name}
          isIncoming={!!incomingCall}
          onCallEnd={handleCallEnd}
        />
      )}

      {/* Edit Message Modal */}
      {editingMessage && (
        <EditMessageModal
          message={editingMessage.content}
          onSave={(newContent) => handleEditMessage(editingMessage.id, newContent)}
          onCancel={() => setEditingMessage(null)}
        />
      )}

      {/* Channel Settings Modal */}
      {showSettings && channelDetails && (
        <ChannelSettings
          channel={channelDetails}
          onClose={() => setShowSettings(false)}
          onChannelDeleted={() => {
            setShowSettings(false);
            if (onChannelDeleted) onChannelDeleted();
          }}
          onChannelLeft={() => {
            setShowSettings(false);
            if (onChannelLeft) onChannelLeft();
          }}
        />
      )}
    </>
  );
};

export default ChatWindow;

