'use client';

import React from 'react';
import { Box, Container, Typography, Button } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import ErrorIcon from '@mui/icons-material/Error';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0b0b0b 0%, #1a1a1a 100%)',
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center', color: '#ffffff' }}>
          <ErrorIcon sx={{ fontSize: 80, mb: 2, opacity: 0.8 }} />
          <Typography variant="h3" sx={{ fontWeight: 700, mb: 1 }}>
            Access Denied
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 400, mb: 3, opacity: 0.8 }}>
            You don't have permission to access this page.
          </Typography>

          <Typography variant="body2" sx={{ mb: 4, opacity: 0.7 }}>
            Your role is: <strong>{user?.role}</strong>
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#4caf50',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: '#388e3c',
                },
              }}
              onClick={() => router.back()}
            >
              Go Back
            </Button>
            <Button
              variant="outlined"
              sx={{
                borderColor: '#ffffff',
                color: '#ffffff',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                },
              }}
              onClick={() => router.push('/admin/dashboard')}
            >
              Go to Dashboard
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
