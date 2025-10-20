import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import './Chat.css';

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  isMember: boolean;
  creator?: {
    displayName: string;
  };
}

interface ChannelBrowserProps {
  onClose: () => void;
  onChannelJoined: () => void;
}

const ChannelBrowser: React.FC<ChannelBrowserProps> = ({ onClose, onChannelJoined }) => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchPublicChannels();
  }, []);

  const fetchPublicChannels = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/channels/public`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(response.data.channels);
    } catch (error) {
      console.error('Error fetching public channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinChannel = async (channelId: string) => {
    try {
      await axios.post(
        `${API_URL}/api/channels/${channelId}/join`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update the channel's member status
      setChannels(channels.map(ch => 
        ch.id === channelId ? { ...ch, isMember: true } : ch
      ));
      
      // Notify parent to refresh channel list
      onChannelJoined();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to join channel');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Browse Public Channels</h2>
          <button className="btn-icon" onClick={onClose}>
            ✕
          </button>
        </div>
        
        <div className="channel-browser">
          {loading ? (
            <div className="loading-container">
              <div className="spinner"></div>
              <p>Loading channels...</p>
            </div>
          ) : channels.length === 0 ? (
            <div className="no-channels">
              <p>No public channels available yet.</p>
              <p>Create the first one!</p>
            </div>
          ) : (
            <div className="channels-grid">
              {channels.map((channel) => (
                <div key={channel.id} className="channel-card">
                  <div className="channel-card-header">
                    <div className="channel-card-icon">#</div>
                    <div className="channel-card-info">
                      <h3>{channel.name}</h3>
                      <p className="channel-card-creator">
                        by {channel.creator?.displayName || 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {channel.description && (
                    <p className="channel-card-description">{channel.description}</p>
                  )}
                  
                  <div className="channel-card-footer">
                    {channel.isMember ? (
                      <span className="badge-joined">✓ Joined</span>
                    ) : (
                      <button
                        className="btn-join"
                        onClick={() => handleJoinChannel(channel.id)}
                      >
                        Join Channel
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChannelBrowser;

