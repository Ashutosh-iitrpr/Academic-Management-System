'use client';

import React from 'react';
import { Skeleton, Box, Grid } from '@mui/material';

interface LoadingSkeletonProps {
  type?: 'card' | 'table' | 'list' | 'grid';
  count?: number;
  height?: number | string;
}

export const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({
  type = 'card',
  count = 1,
  height = 'auto',
}) => {
  if (type === 'card') {
    return (
      <Box sx={{ mb: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="100%" height={60} sx={{ mb: 1 }} />
            <Skeleton variant="text" width="80%" height={24} />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'table') {
    return (
      <Box sx={{ mb: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
            <Skeleton variant="circular" width={40} height={40} />
            <Skeleton variant="text" width="100%" height={40} />
            <Skeleton variant="text" width="20%" height={40} />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'list') {
    return (
      <Box sx={{ mb: 2 }}>
        {Array.from({ length: count }).map((_, i) => (
          <Box key={i} sx={{ mb: 1.5, p: 1.5, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Skeleton variant="text" width="40%" height={24} sx={{ mb: 0.5 }} />
            <Skeleton variant="text" width="100%" height={20} />
          </Box>
        ))}
      </Box>
    );
  }

  if (type === 'grid') {
    return (
      <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, i) => (
          <Grid item xs={12} sm={6} md={4} key={i}>
            <Box sx={{ p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
              <Skeleton variant="rectangular" width="100%" height={200} sx={{ mb: 1, borderRadius: 1 }} />
              <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
              <Skeleton variant="text" width="100%" height={20} />
            </Box>
          </Grid>
        ))}
      </Grid>
    );
  }

  return null;
};

export default LoadingSkeleton;
