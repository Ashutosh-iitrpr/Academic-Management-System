'use client';

import React, { ReactNode, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';
import type { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole | UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!isAuthenticated || !user)) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, user, router]);

  useEffect(() => {
    if (!loading && user && requiredRole) {
      const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!roles.includes(user.role)) {
        router.push('/unauthorized');
      }
    }
  }, [loading, user, requiredRole, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    if (!roles.includes(user.role)) {
      return null;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;
