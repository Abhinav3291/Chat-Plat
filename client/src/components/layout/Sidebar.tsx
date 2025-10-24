import React, { useState } from 'react';
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
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  Search as SearchIcon,
  Delete as DeleteIcon,
  Dashboard as DashboardIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { useAuth } from '../../contexts/AuthContext';

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
  const theme = useTheme();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', height: '64px' }}>
        <Typography variant="h6" sx={{ fontWeight: 600, color: theme.palette.primary.main }}>
          Chat Platform
        </Typography>
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

      {/* New Chat Button */}
      <Box sx={{ px: 2, mb: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => {
            console.log('Create new chat');
          }}
          sx={{
            borderRadius: 2,
            py: 1,
            justifyContent: 'flex-start',
            pl: 2,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              backgroundColor: theme.palette.primary.main + '10',
            },
          }}
        >
          New chat
        </Button>
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
                    console.log('Delete chat', channel.id);
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
    </Box>
  );
};

export default Sidebar;
