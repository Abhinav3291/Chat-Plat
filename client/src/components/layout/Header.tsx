import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  IconButton,
  Avatar,
  FormControl,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  Settings as SettingsIcon,
} from '@mui/icons-material';
import { useThemeContext } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const theme = useTheme();
  const { mode, toggleTheme } = useThemeContext();
  const { user } = useAuth();
  
  const isDarkMode = mode === 'dark';

  return (
    <Box
      sx={{
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 3,
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: '100%',
        backgroundColor: theme.palette.background.paper,
      }}
    >
      <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
        Chat Platform
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <Select
            value="general"
            displayEmpty
            sx={{
              '& .MuiSelect-select': {
                py: 0.5,
              },
            }}
          >
            <MenuItem value="general">General Chat</MenuItem>
            <MenuItem value="technical">Technical Support</MenuItem>
            <MenuItem value="business">Business Analytics</MenuItem>
            <MenuItem value="creative">Creative Writing</MenuItem>
            <MenuItem value="research">Research Assistant</MenuItem>
          </Select>
        </FormControl>
        <IconButton
          onClick={toggleTheme}
          size="small"
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          {isDarkMode ? <Brightness7 /> : <Brightness4 />}
        </IconButton>
        <IconButton
          size="small"
          sx={{ 
            color: theme.palette.text.secondary,
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
            }
          }}
        >
          <SettingsIcon />
        </IconButton>
        <Avatar 
          sx={{ 
            width: 32, 
            height: 32,
            backgroundColor: theme.palette.primary.main,
            fontSize: '14px',
            fontWeight: 500,
          }}
        >
          {user?.displayName?.charAt(0)?.toUpperCase() || user?.username?.charAt(0)?.toUpperCase() || 'U'}
        </Avatar>
      </Box>
    </Box>
  );
};

export default Header;
