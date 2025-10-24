import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Typography } from '@mui/material';
import { Send as SendIcon, AttachFile as AttachIcon, Mic as MicIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';

interface ChatInputProps {
  onSendMessage: (message: string, file?: File, isImage?: boolean) => void;
  placeholder?: string;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, placeholder = "Type a message..." }) => {
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isImage, setIsImage] = useState(false);
  const theme = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setIsImage(file.type.startsWith('image/'));
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setIsImage(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() || selectedFile) {
      onSendMessage(message.trim(), selectedFile || undefined, isImage);
      setMessage('');
      setSelectedFile(null);
      setIsImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <Box>
      {/* File preview */}
      {selectedFile && (
        <Box sx={{ mb: 2, p: 2, backgroundColor: theme.palette.background.paper, borderRadius: 2, border: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">
                {isImage ? '🖼️' : '📎'} {selectedFile.name}
              </Typography>
            </Box>
            <IconButton size="small" onClick={handleRemoveFile}>
              ✕
            </IconButton>
          </Box>
        </Box>
      )}

      <Paper
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1,
          borderRadius: 3,
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[1],
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip,.rar,.7z,video/*,audio/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        
        <IconButton 
          size="small" 
          onClick={() => fileInputRef.current?.click()}
          sx={{ mr: 1 }}
        >
          <AttachIcon fontSize="small" />
        </IconButton>
        
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          variant="standard"
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: '14px',
              '& .MuiInputBase-input': {
                padding: '8px 0',
              },
            },
          }}
          sx={{ flex: 1 }}
        />
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton size="small">
            <MicIcon fontSize="small" />
          </IconButton>
          <IconButton
            type="submit"
            size="small"
            disabled={!message.trim() && !selectedFile}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
              },
              '&:disabled': {
                backgroundColor: theme.palette.action.disabled,
              },
            }}
          >
            <SendIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>
    </Box>
  );
};

export default ChatInput;
