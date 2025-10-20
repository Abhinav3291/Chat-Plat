import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import './Chat.css';

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  createdBy: string;
  creator?: {
    id: string;
    username: string;
    displayName: string;
  };
  members?: any[];
}

interface ChannelSettingsProps {
  channel: Channel;
  onClose: () => void;
  onChannelDeleted: () => void;
  onChannelLeft: () => void;
}

const ChannelSettings: React.FC<ChannelSettingsProps> = ({
  channel,
  onClose,
  onChannelDeleted,
  onChannelLeft
}) => {
  const { user, token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const isOwner = channel.createdBy === user?.id;
  const memberCount = channel.members?.length || 0;

  const handleDeleteChannel = async () => {
    setLoading(true);
    try {
      await axios.delete(`${API_URL}/api/channels/${channel.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onChannelDeleted();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete channel');
    } finally {
      setLoading(false);
    }
  };

  const handleLeaveChannel = async () => {
    setLoading(true);
    try {
      await axios.post(
        `${API_URL}/api/channels/${channel.id}/leave`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onChannelLeft();
      onClose();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to leave channel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal channel-settings-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Channel Settings</h2>
          <button className="btn-icon" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          {/* Channel Info */}
          <div className="channel-info-section">
            <div className="channel-info-header">
              <div className="channel-icon-large">
                {channel.type === 'direct' ? '👤' : '#'}
              </div>
              <div>
                <h3>{channel.name}</h3>
                <p className="channel-meta">
                  {channel.type === 'public' ? '🌐 Public' : '🔒 Private'} • {memberCount} member{memberCount !== 1 ? 's' : ''}
                </p>
                {channel.creator && (
                  <p className="channel-creator">
                    Created by {channel.creator.displayName}
                  </p>
                )}
              </div>
            </div>
            {channel.description && (
              <p className="channel-description-full">{channel.description}</p>
            )}
          </div>

          {/* Actions */}
          <div className="channel-actions-section">
            <h4>Actions</h4>
            
            {/* Leave Channel */}
            {!isOwner && (
              <button
                className="action-btn warning"
                onClick={() => setShowLeaveConfirm(true)}
                disabled={loading}
              >
                <span>🚪</span>
                <div className="action-btn-content">
                  <strong>Leave Channel</strong>
                  <small>You won't be able to see messages anymore</small>
                </div>
              </button>
            )}

            {/* Delete Channel */}
            {isOwner && (
              <button
                className="action-btn danger"
                onClick={() => setShowDeleteConfirm(true)}
                disabled={loading}
              >
                <span>🗑️</span>
                <div className="action-btn-content">
                  <strong>Delete Channel</strong>
                  <small>Permanently delete this channel and all messages</small>
                </div>
              </button>
            )}
          </div>
        </div>

        {/* Delete Confirmation */}
        {showDeleteConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-dialog">
              <h3>⚠️ Delete Channel?</h3>
              <p>
                Are you sure you want to delete <strong>"{channel.name}"</strong>?
              </p>
              <p className="confirm-warning">
                This will permanently delete:
              </p>
              <ul className="confirm-list">
                <li>All messages and images</li>
                <li>All member associations</li>
                <li>Channel settings and data</li>
              </ul>
              <p className="confirm-warning">
                <strong>This action cannot be undone!</strong>
              </p>
              <div className="confirm-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn-danger"
                  onClick={handleDeleteChannel}
                  disabled={loading}
                >
                  {loading ? 'Deleting...' : 'Delete Channel'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Leave Confirmation */}
        {showLeaveConfirm && (
          <div className="confirm-overlay">
            <div className="confirm-dialog">
              <h3>🚪 Leave Channel?</h3>
              <p>
                Are you sure you want to leave <strong>"{channel.name}"</strong>?
              </p>
              <p className="confirm-info">
                You can rejoin this {channel.type} channel {channel.type === 'public' ? 'anytime from the browse menu' : 'if invited again'}.
              </p>
              <div className="confirm-actions">
                <button
                  className="btn-secondary"
                  onClick={() => setShowLeaveConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  className="btn-warning"
                  onClick={handleLeaveChannel}
                  disabled={loading}
                >
                  {loading ? 'Leaving...' : 'Leave Channel'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChannelSettings;

