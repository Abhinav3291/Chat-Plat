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
  const [showWelcome, setShowWelcome] = useState(true);
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
        setShowWelcome(false);
      }
    } catch (error) {
      console.error('Error fetching channels:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannel(channel);
    setShowWelcome(false);
  };

  const handleChannelCreated = (channel: Channel) => {
    setChannels([channel, ...channels]);
    setSelectedChannel(channel);
    setShowWelcome(false);
  };

  const handleModelSelect = (modelId: string) => {
    setSelectedModel(modelId);
  };

  const handleSendMessage = async (message: string, file?: File, isImage?: boolean) => {
    if (!selectedChannel) {
      // If no channel selected, create a new channel first
      try {
        const response = await axios.post(
          `${API_URL}/api/channels`,
          {
            name: `${selectedModel} Chat`,
            description: `Chat using ${selectedModel} model`,
            type: 'public'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        const newChannel = response.data.channel;
        setChannels([newChannel, ...channels]);
        setSelectedChannel(newChannel);
        setShowWelcome(false);
        
        // Send the message to the new channel
        await sendMessageToChannel(newChannel.id, message, file, isImage);
      } catch (error) {
        console.error('Error creating channel:', error);
      }
    } else {
      // Send message to existing channel
      await sendMessageToChannel(selectedChannel.id, message, file, isImage);
    }
  };

  const sendMessageToChannel = async (channelId: string, content: string, file?: File, isImage?: boolean) => {
    try {
      if (file) {
        // Handle file upload
        const formData = new FormData();
        formData.append('file', file);
        formData.append('channelId', channelId);
        if (content) formData.append('content', content);

        const endpoint = isImage ? '/api/messages/image' : '/api/messages/file';
        await axios.post(`${API_URL}${endpoint}`, formData, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      } else {
        // Handle text message
        await axios.post(
          `${API_URL}/api/messages`,
          {
            channelId,
            content,
            type: 'text'
          },
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSuggestedQuestion = (question: string) => {
    handleSendMessage(question);
  };

  const handleNewChat = async () => {
    try {
      const response = await axios.post(
        `${API_URL}/api/channels`,
        {
          name: `New ${selectedModel} Chat`,
          description: `Chat using ${selectedModel} model`,
          type: 'public'
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const newChannel = response.data.channel;
      setChannels([newChannel, ...channels]);
      setSelectedChannel(newChannel);
      setShowWelcome(false);
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  };

  const handleDeleteChannel = async (channelId: string) => {
    try {
      await axios.delete(`${API_URL}/api/channels/${channelId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setChannels(channels.filter(ch => ch.id !== channelId));
      if (selectedChannel?.id === channelId) {
        setSelectedChannel(null);
        setShowWelcome(true);
      }
    } catch (error) {
      console.error('Error deleting channel:', error);
    }
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
        onNewChat={handleNewChat}
        onDeleteChannel={handleDeleteChannel}
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
        <Header selectedModel={selectedModel} onModelSelect={handleModelSelect} />
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
          {selectedChannel && !showWelcome ? (
            <ChatWindow
              channel={selectedChannel}
              onChannelDeleted={() => {
                setSelectedChannel(null);
                setShowWelcome(true);
                fetchChannels();
              }}
              onChannelLeft={() => {
                setSelectedChannel(null);
                setShowWelcome(true);
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
