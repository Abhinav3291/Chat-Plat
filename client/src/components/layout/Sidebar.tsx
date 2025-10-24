import React from 'react';
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
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Chat as ChatIcon,
  Settings as SettingsIcon,
  MoreVert as MoreVertIcon,
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
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', height: '64px' }}>
        <Typography variant="h6" sx={{ fontWeight: 500 }}>Chat Platform</Typography>
      </Box>
      <Divider />
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <Box sx={{ p: 2, flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={() => {
              // This would trigger channel creation modal
              console.log('Create new channel');
            }}
            sx={{
              borderRadius: 3,
              py: 1,
              mb: 2,
              justifyContent: 'flex-start',
              pl: 2,
              borderColor: 'rgba(138, 180, 248, 0.2)',
              color: theme.palette.mode === 'dark' ? '#8ab4f8' : '#1a73e8',
              '&:hover': {
                borderColor: 'rgba(138, 180, 248, 0.5)',
                backgroundColor: 'rgba(138, 180, 248, 0.08)',
              },
            }}
          >
            New channel
          </Button>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, px: 1 }}>
            Channels
          </Typography>
          <List sx={{ flex: 1, minHeight: 0, overflowY: 'auto', py: 0 }}>
            {channels.map((channel) => (
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
                    secondary={channel.type === 'private' ? 'Private' : 'Public'}
                    primaryTypographyProps={{
                      fontSize: '14px',
                      fontWeight: selectedChannel?.id === channel.id ? 500 : 400,
                    }}
                    secondaryTypographyProps={{
                      fontSize: '12px',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          <Divider />
          <List sx={{ py: 0 }}>
            <ListItem disablePadding>
              <ListItemButton sx={{ py: 1.5, px: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <SettingsIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </List>
        </Box>
      </Box>
    </Box>
  );
};

export default Sidebar;
