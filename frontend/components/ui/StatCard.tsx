'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, LinearProgress } from '@mui/material';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
  subtitle?: string;
  progress?: number; // 0-100
}

const colorMap = {
  primary: '#8B3A3A',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'primary',
  subtitle,
  progress,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        borderRadius: 2,
        border: `1px solid #e0e0e0`,
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography color="textSecondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, color: colorMap[color] }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: `${colorMap[color]}20`,
              color: colorMap[color],
              fontSize: '1.5rem',
            }}
          >
            {icon}
          </Box>
        </Box>

        {progress !== undefined && (
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              height: 6,
              borderRadius: 3,
              backgroundColor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                borderRadius: 3,
                backgroundColor: colorMap[color],
              },
            }}
          />
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
