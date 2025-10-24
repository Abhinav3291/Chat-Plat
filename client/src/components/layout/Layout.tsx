import React, { useState, useEffect } from 'react';
import { Box, CssBaseline, Typography } from '@mui/material';
import axios from 'axios';
import { API_URL } from '../../config';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Sidebar from './Sidebar';
import ChatWindow from '../Chat/ChatWindow';
import ModelSelector from '../common/ModelSelector';
import SuggestedQuestions from '../common/SuggestedQuestions';
import ChatInput from '../common/ChatInput';

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
  const [selectedModel, setSelectedModel] = useState('general');
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const suggestedQuestions = [
    "How can I help you today?",
    "What would you like to know?",
    "Tell me about your project",
    "Need technical assistance?",
    "Want to discuss business ideas?",
    "Looking for creative inspiration?"
  ];

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

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message, 'with model:', selectedModel);
    // This would integrate with your existing chat functionality
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
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
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)',
            position: 'relative',
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
                px: 4,
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  maxWidth: '800px',
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
                <Typography variant="h4" component="h1" sx={{ fontWeight: 600, mb: 1 }}>
                  Welcome! How can I assist you today?
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
                  Choose a semantic model below to get started with your conversation.
                </Typography>
                
                <ModelSelector selectedModel={selectedModel} onModelSelect={handleModelSelect} />
                
                <SuggestedQuestions 
                  questions={suggestedQuestions} 
                  onSelectQuestion={handleSuggestedQuestion} 
                />
              </Box>
              
              <Box sx={{ width: '100%', maxWidth: '600px', mx: 'auto' }}>
                <ChatInput onSendMessage={handleSendMessage} />
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
