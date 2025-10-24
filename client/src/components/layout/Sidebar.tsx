import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../../config';
import { 
  Box, 
  Button, 
  List, 
  Typography, 
  useTheme,
  Divider,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
  Close as CloseIcon,
  Public as PublicIcon,
  Lock as LockIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';
import ChannelBrowser from '../Chat/ChannelBrowser';
import UserBrowser from '../Chat/UserBrowser';

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
  onDeleteChannel: (channelId: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  channels, 
  selectedChannel, 
  onSelectChannel, 
  onChannelCreated,
  onDeleteChannel
}) => {
  const theme = useTheme();
  const { token, user, logout } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging
  console.log('Sidebar - User:', user);
  console.log('Sidebar - Token:', token);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showBrowserModal, setShowBrowserModal] = useState(false);
  const [showUserBrowser, setShowUserBrowser] = useState(false);
  const [channelName, setChannelName] = useState('');
  const [channelDescription, setChannelDescription] = useState('');
  const [channelType, setChannelType] = useState('public');

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    <Box
      sx={{
        width: 280,
        height: '100vh',
        backgroundColor: theme.palette.mode === 'dark' ? '#202124' : '#f8fafc',
        borderRight: `1px solid ${theme.palette.divider}`,
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 1200,
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '64px' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Chat Platform
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton
            size="small"
            onClick={() => setShowUserBrowser(true)}
            title="New Direct Message"
            sx={{ color: theme.palette.text.secondary }}
          >
            💬
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setShowCreateModal(true)}
            title="Create Channel"
            sx={{ color: theme.palette.text.secondary }}
          >
            <AddIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
      
      <Divider />
      
      {/* Search */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Q Search Chats"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              backgroundColor: theme.palette.background.paper,
            },
          }}
        />
      </Box>


      {/* Recent Chats */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ px: 2, mb: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Recent chats
          </Typography>
        </Box>
        <List sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: 0 }}>
          {filteredChannels.map((channel) => (
            <ListItem key={channel.id} disablePadding>
              <ListItemButton
                selected={selectedChannel?.id === channel.id}
                onClick={() => onSelectChannel(channel)}
                sx={{
                  borderRadius: 1,
                  mx: 1,
                  mb: 0.5,
                  '&.Mui-selected': {
                    backgroundColor: theme.palette.primary.main + '20',
                    '&:hover': {
                      backgroundColor: theme.palette.primary.main + '30',
                    },
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <ChatIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText 
                  primary={channel.name}
                  primaryTypographyProps={{
                    fontSize: '14px',
                    fontWeight: selectedChannel?.id === channel.id ? 500 : 400,
                  }}
                />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteChannel(channel.id);
                  }}
                  sx={{ opacity: 0.6, '&:hover': { opacity: 1 } }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
      
      {/* Navigation */}
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <List sx={{ py: 0 }}>
          <ListItem disablePadding>
            <ListItemButton sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <DashboardIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <SettingsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Settings" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton sx={{ py: 1.5, px: 2 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <HistoryIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Activity" />
            </ListItemButton>
          </ListItem>
        </List>
      </Box>

      {/* User Profile Section */}
      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {user?.avatar ? (
              <img 
                src={`${API_URL}${user.avatar}`} 
                alt={user.displayName} 
                style={{ 
                  width: 32, 
                  height: 32, 
                  borderRadius: '50%',
                  objectFit: 'cover'
                }} 
              />
            ) : (
              <Box sx={{ 
                width: 32, 
                height: 32, 
                borderRadius: '50%', 
                bgcolor: theme.palette.primary.main, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                color: theme.palette.primary.contrastText,
                fontSize: '14px',
                fontWeight: 500
              }}>
                {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
              </Box>
            )}
            <Box>
              <Typography variant="body2" sx={{ fontWeight: 500, lineHeight: 1.2 }}>
                {user?.displayName || user?.username || 'User'}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.2 }}>
                {user?.email || 'user@example.com'}
              </Typography>
            </Box>
          </Box>
          <IconButton 
            size="medium" 
            onClick={() => {
              console.log('Logout clicked');
              logout();
            }}
            title="Logout"
            sx={{ 
              color: theme.palette.error.main,
              backgroundColor: theme.palette.error.main + '10',
              '&:hover': {
                backgroundColor: theme.palette.error.main + '20',
              }
            }}
          >
            <LogoutIcon fontSize="medium" />
          </IconButton>
        </Box>
      </Box>

      {/* Create Channel Modal */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            Create New Channel
            <IconButton onClick={() => setShowCreateModal(false)} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <form onSubmit={handleCreateChannel}>
          <DialogContent>
            <TextField
              fullWidth
              label="Channel Name"
              value={channelName}
              onChange={(e) => setChannelName(e.target.value)}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Description"
              value={channelDescription}
              onChange={(e) => setChannelDescription(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 2 }}
            />
            <FormControl fullWidth>
              <InputLabel>Channel Type</InputLabel>
              <Select
                value={channelType}
                onChange={(e) => setChannelType(e.target.value)}
                label="Channel Type"
              >
                <MenuItem value="public">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PublicIcon fontSize="small" />
                    Public
                  </Box>
                </MenuItem>
                <MenuItem value="private">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockIcon fontSize="small" />
                    Private
                  </Box>
                </MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create Channel</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Channel Browser Modal */}
      {showBrowserModal && (
        <ChannelBrowser
          onClose={() => setShowBrowserModal(false)}
          onChannelJoined={() => {
            setShowBrowserModal(false);
            window.location.reload();
          }}
        />
      )}

      {/* User Browser Modal */}
      {showUserBrowser && (
        <UserBrowser
          onClose={() => setShowUserBrowser(false)}
          onDMCreated={(channel) => {
            onChannelCreated(channel);
            setShowUserBrowser(false);
          }}
        />
      )}
    </Box>
  );
};

export default Sidebar;
