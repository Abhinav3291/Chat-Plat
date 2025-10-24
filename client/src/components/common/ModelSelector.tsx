import React, { useState } from 'react';
import { Box, Card, CardContent, Typography, IconButton } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface ModelCard {
  id: string;
  title: string;
  description: string;
  icon: string;
  logo?: string;
}

const models: ModelCard[] = [
  {
    id: 'general',
    title: 'General Chat',
    description: 'General conversation and assistance',
    icon: '💬',
  },
  {
    id: 'technical',
    title: 'Technical Support',
    description: 'Technical help and troubleshooting',
    icon: '🔧',
  },
  {
    id: 'business',
    title: 'Business Analytics',
    description: 'Business insights and data analysis',
    icon: '📊',
  },
  {
    id: 'creative',
    title: 'Creative Writing',
    description: 'Creative content and writing assistance',
    icon: '✍️',
  },
  {
    id: 'research',
    title: 'Research Assistant',
    description: 'Research and information gathering',
    icon: '🔍',
  },
];

interface ModelSelectorProps {
  selectedModel: string;
  onModelSelect: (modelId: string) => void;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ selectedModel, onModelSelect }) => {
  const theme = useTheme();

  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 500 }}>
        Choose a semantic model:
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(3, 1fr)' },
          gap: 2,
          maxWidth: '800px',
        }}
      >
        {models.map((model) => (
          <Card
            key={model.id}
            onClick={() => onModelSelect(model.id)}
            sx={{
              cursor: 'pointer',
              border: selectedModel === model.id ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
              borderRadius: 2,
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-2px)',
                boxShadow: theme.shadows[4],
              },
            }}
          >
            <CardContent sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Typography sx={{ fontSize: '24px', mr: 1 }}>
                  {model.icon}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 500 }}>
                  {model.title}
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                {model.description}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>
    </Box>
  );
};

export default ModelSelector;
