import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import './Chat.css';

interface User {
  id: string;
  username: string;
  displayName: string;
  avatar?: string;
  status: string;
}

interface UserBrowserProps {
  onClose: () => void;
  onDMCreated: (channel: any) => void;
}

const UserBrowser: React.FC<UserBrowserProps> = ({ onClose, onDMCreated }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchUsers();
  }, [searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/api/users`, {
        params: { search: searchTerm },
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDM = async (userId: string) => {
    try {
      setCreating(userId);
      const response = await axios.post(
        `${API_URL}/api/channels/dm`,
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      onDMCreated(response.data.channel);
      onClose();
    } catch (error) {
      console.error('Error creating DM:', error);
      alert('Failed to create direct message');
    } finally {
      setCreating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return '#10b981';
      case 'away':
        return '#f59e0b';
      case 'busy':
        return '#ef4444';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content user-browser-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>💬 Start a Conversation</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="user-browser-search">
          <input
            type="text"
            placeholder="🔍 Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="user-browser-list">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Searching...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="no-results">
              <p>No users found</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="user-card">
                <div className="user-info">
                  <div className="user-avatar-container">
                    {user.avatar ? (
                      <img
                        src={`${API_URL}${user.avatar}`}
                        alt={user.displayName}
                        className="user-avatar"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {user.displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div
                      className="status-indicator"
                      style={{ background: getStatusColor(user.status) }}
                    />
                  </div>
                  <div className="user-details">
                    <h3>{user.displayName}</h3>
                    <p>@{user.username}</p>
                  </div>
                </div>
                <button
                  className="btn-message"
                  onClick={() => handleCreateDM(user.id)}
                  disabled={creating === user.id}
                >
                  {creating === user.id ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <span>💬</span>
                      <span>Message</span>
                    </>
                  )}
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default UserBrowser;

