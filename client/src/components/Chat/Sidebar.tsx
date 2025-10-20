import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ChannelBrowser from './ChannelBrowser';
import UserBrowser from './UserBrowser';
import './Chat.css';

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

interface SidebarProps {
  channels: Channel[];
  selectedChannel: Channel | null;
  onSelectChannel: (channel: Channel) => void;
  onChannelCreated: (channel: Channel) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  channels,
  selectedChannel,
  onSelectChannel,
  onChannelCreated
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [showUserBrowser, setShowUserBrowser] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channelType, setChannelType] = useState('public');
  const { user, token, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleCreateChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `${API_URL}/api/channels`,
        {
          name: channelName,
          description: channelDescription,
          type: channelType
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      onChannelCreated(response.data.channel);
      setShowCreateModal(false);
      setChannelName('');
      setChannelDescription('');
      setChannelType('public');
    } catch (error) {
      console.error('Error creating channel:', error);
    }
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h2>Chat Platform</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-icon"
            onClick={() => setShowUserBrowser(true)}
            title="New Direct Message"
          >
            💬
          </button>
          <button
            className="btn-icon"
            onClick={() => setShowCreateModal(true)}
            title="Create Channel"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" />
            </svg>
          </button>
        </div>
      </div>

      <div className="channels-list">
        <div className="channels-header">
          <h3>Channels</h3>
          <button
            className="btn-text"
            onClick={() => setShowBrowserModal(true)}
            title="Browse Public Channels"
          >
            Browse
          </button>
        </div>
        {channels.map((channel) => (
          <div
            key={channel.id}
            className={`channel-item ${selectedChannel?.id === channel.id ? 'active' : ''}`}
            onClick={() => onSelectChannel(channel)}
          >
            <div className="channel-icon">
              {channel.type === 'direct' ? '👤' : '#'}
            </div>
            <div className="channel-info">
              <div className="channel-name">{channel.name}</div>
              {channel.description && (
                <div className="channel-description">{channel.description}</div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">
            {user?.avatar ? (
              <img src={`${API_URL}${user.avatar}`} alt={user.displayName} />
            ) : (
              <div className="avatar-placeholder">
                {user?.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="user-details">
            <div className="user-name">{user?.displayName}</div>
            <div className="user-status">
              <span className="status-indicator online"></span>
              Online
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            className="btn-icon"
            onClick={toggleTheme}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
          <button className="btn-icon" onClick={logout} title="Logout">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 102 0V4a1 1 0 00-1-1zm10.293 9.293a1 1 0 001.414 1.414l3-3a1 1 0 000-1.414l-3-3a1 1 0 10-1.414 1.414L14.586 9H7a1 1 0 100 2h7.586l-1.293 1.293z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Channel</h2>
              <button
                className="btn-icon"
                onClick={() => setShowCreateModal(false)}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateChannel} className="modal-form">
              <div className="form-group">
                <label>Channel Name</label>
                <input
                  type="text"
                  value={channelName}
                  onChange={(e) => setChannelName(e.target.value)}
                  placeholder="Enter channel name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={channelDescription}
                  onChange={(e) => setChannelDescription(e.target.value)}
                  placeholder="Enter channel description"
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Channel Type</label>
                <select
                  value={channelType}
                  onChange={(e) => setChannelType(e.target.value)}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showBrowserModal && (
        <ChannelBrowser
          onClose={() => setShowBrowserModal(false)}
          onChannelJoined={() => {
            // Refresh channels when a new one is joined
            window.location.reload();
          }}
        />
      )}

      {showUserBrowser && (
        <UserBrowser
          onClose={() => setShowUserBrowser(false)}
          onDMCreated={(channel) => {
            onChannelCreated(channel);
            setShowUserBrowser(false);
          }}
        />
      )}
    </div>
  );
};

export default Sidebar;

