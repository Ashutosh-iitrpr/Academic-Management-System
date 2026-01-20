'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { Box, CircularProgress, Container, Typography } from '@mui/material';

export default function Home() {
  const router = useRouter();
  const { user, loading, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && user) {
        // Redirect based on role
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (user.role === 'INSTRUCTOR') {
          router.push('/instructor/dashboard');
        } else if (user.role === 'STUDENT') {
          router.push('/student/dashboard');
        }
      } else {
        // Redirect to login if not authenticated
        router.push('/login');
      }
    }
  }, [loading, isAuthenticated, user, router]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #f8f7f5 0%, #faf9f7 100%)',
        backgroundImage: 
          `radial-gradient(circle at 10% 20%, rgba(139, 58, 58, 0.04) 0%, transparent 50%),
           radial-gradient(circle at 90% 80%, rgba(212, 165, 116, 0.05) 0%, transparent 50%)`,
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress sx={{ color: '#8B3A3A', mb: 3 }} />
          <Typography variant="h5" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
            Academic Portal
          </Typography>
          <Typography variant="body2" sx={{ color: '#999', mt: 1 }}>
            Loading your dashboard...
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
