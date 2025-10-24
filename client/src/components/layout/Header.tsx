import React from 'react';
import {
  Box,
  Typography,
  useTheme,
  IconButton,
  Avatar,
} from '@mui/material';
import {
  Brightness4,
  Brightness7,
  AccountCircle as AccountIcon,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
          <Typography variant="body2" color="text.secondary">
            {user?.displayName || user?.username}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
