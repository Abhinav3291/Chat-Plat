import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from './Sidebar';
import ChatWindow from './ChatWindow';
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

const ChatLayout: React.FC = () => {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    fetchChannels();
  }, []);

  const fetchChannels = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/channels`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(response.data.channels);
      if (response.data.channels.length > 0 && !selectedChannel) {
        setSelectedChannel(response.data.channels[0]);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
  };

  const handleChannelCreated = (channel: Channel) => {
    setChannels([channel, ...channels]);
    setSelectedChannel(channel);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="chat-layout">
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={handleChannelSelect}
        onChannelCreated={handleChannelCreated}
      />
      {selectedChannel ? (
        <ChatWindow
          channel={selectedChannel}
          onChannelDeleted={() => {
            setSelectedChannel(null);
            fetchChannels();
          }}
          onChannelLeft={() => {
            setSelectedChannel(null);
            fetchChannels();
          }}
        />
      ) : (
        <div className="no-channel-selected">
          <h2>Welcome to Chat Platform</h2>
          <p>Select a channel to start messaging</p>
        </div>
      )}
    </div>
  );
};

export default ChatLayout;

