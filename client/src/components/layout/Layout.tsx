import React, { useState, useEffect } from 'react';
import { Box, CssBaseline } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatWindow from '../Chat/ChatWindow';

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

const Layout: React.FC = () => {
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
    <Box sx={{ 
      height: '100vh', 
      display: 'flex', 
    }}>
      <CssBaseline />
      <Sidebar
        channels={channels}
        selectedChannel={selectedChannel}
        onSelectChannel={handleChannelSelect}
        onChannelCreated={handleChannelCreated}
      />
      <Box
        component="main"
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          ml: '280px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <Header />
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            height: 'calc(100vh - 64px)',
            width: '100%',
            overflow: 'hidden',
          }}
        >
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
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                py: 4,
                textAlign: 'center',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  mb: 6,
                }}
              >
                <Box
                  sx={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    bgcolor: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 500,
                    color: 'primary.contrastText',
                    mx: 'auto',
                    mb: 3,
                  }}
                >
                  💬
                </Box>
                <h2>Welcome to Chat Platform</h2>
                <p>Select a channel to start messaging</p>
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
