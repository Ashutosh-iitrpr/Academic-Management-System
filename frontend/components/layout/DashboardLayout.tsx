'use client';

import React, { useState } from 'react';
import { Box, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

interface DashboardLayoutProps {
  children: React.ReactNode;
  pageTitle: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, pageTitle }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#fafafa',
        paddingLeft: isMobile ? 0 : '280px', // reserve space for fixed sidebar on desktop
      }}
    >
      {/* Sidebar */}
      {!isMobile && <Sidebar />}
      {isMobile && <Sidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />}

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        {/* Topbar - Sticky Header */}
        <Box
          sx={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            backgroundColor: '#ffffff',
            boxShadow: '0 2px 8px rgba(139, 58, 58, 0.08)',
          }}
        >
          <Topbar pageTitle={pageTitle} onMenuClick={handleDrawerToggle} />
        </Box>

        {/* Page Content */}
        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 3, md: 4 },
            overflow: 'auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default DashboardLayout;
