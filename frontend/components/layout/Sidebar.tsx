'use client';

import React, { useState } from 'react';
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Typography,
  Avatar,
  Button,
  IconButton,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '@/lib/auth/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

// Icons
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

interface NavigationItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  roles: string[];
}

const navigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: <DashboardIcon />,
    roles: ['ADMIN', 'INSTRUCTOR', 'STUDENT'],
  },
  // Admin items
  {
    label: 'Academic Calendar',
    path: '/admin/calendar',
    icon: <AssignmentIcon />,
    roles: ['ADMIN'],
  },
  {
    label: 'User Management',
    path: '/admin/users',
    icon: <PeopleIcon />,
    roles: ['ADMIN'],
  },
  {
    label: 'Course Management',
    path: '/admin/courses',
    icon: <SchoolIcon />,
    roles: ['ADMIN'],
  },
  {
    label: 'Course Approvals',
    path: '/admin/approvals',
    icon: <DescriptionIcon />,
    roles: ['ADMIN'],
  },
  {
    label: 'Transcript Lookup',
    path: '/admin/transcript',
    icon: <DescriptionIcon />,
    roles: ['ADMIN'],
  },
  // Instructor items
  {
    label: 'My Offerings',
    path: '/instructor/offerings',
    icon: <SchoolIcon />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'Enrollments',
    path: '/instructor/enrollments',
    icon: <PeopleIcon />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'Batch Enrollment',
    path: '/instructor/batch-enrollment',
    icon: <AssignmentIcon />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'Grade Upload',
    path: '/instructor/grades',
    icon: <DescriptionIcon />,
    roles: ['INSTRUCTOR'],
  },
  {
    label: 'Feedback',
    path: '/instructor/feedback',
    icon: <ChatIcon />,
    roles: ['INSTRUCTOR'],
  },
  // Student items
  {
    label: 'Course Catalog',
    path: '/student/catalog',
    icon: <SchoolIcon />,
    roles: ['STUDENT'],
  },
  {
    label: 'Available Offerings',
    path: '/student/offerings',
    icon: <AssignmentIcon />,
    roles: ['STUDENT'],
  },
  {
    label: 'My Enrollments',
    path: '/student/enrollments',
    icon: <PeopleIcon />,
    roles: ['STUDENT'],
  },
  {
    label: 'Academic Record',
    path: '/student/record',
    icon: <DescriptionIcon />,
    roles: ['STUDENT'],
  },
  {
    label: 'Transcript',
    path: '/student/transcript',
    icon: <DescriptionIcon />,
    roles: ['STUDENT'],
  },
  {
    label: 'Feedback Forms',
    path: '/student/feedback',
    icon: <ChatIcon />,
    roles: ['STUDENT'],
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ open = true, onClose }) => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const filteredNavItems = navigationItems.filter((item) => item.roles.includes(user?.role || ''));

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleNavigate = (path: string) => {
    router.push(path);
  };

  const sidebarContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#1a1a1a',
        color: '#ffffff',
      }}
    >
      {/* User Profile Section */}
      <Box
        sx={{
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          backgroundColor: '#0d0d0d',
        }}
      >
        <Avatar sx={{ backgroundColor: '#4caf50', width: 40, height: 40 }}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </Avatar>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle2" sx={{ color: '#ffffff', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.name || 'User'}
          </Typography>
          <Typography variant="caption" sx={{ color: '#999', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.role || 'Guest'}
          </Typography>
        </Box>
      </Box>
      <Divider sx={{ backgroundColor: '#333' }} />

      {/* Navigation List */}
      <List sx={{ flex: 1, px: 1, py: 2 }}>
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(item.path.split('/').slice(0, 3).join('/'));
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 1,
                  color: isActive ? '#4caf50' : '#b0b0b0',
                  backgroundColor: isActive ? 'rgba(76, 175, 80, 0.1)' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'rgba(76, 175, 80, 0.08)',
                    color: '#ffffff',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? '#4caf50' : '#b0b0b0',
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ backgroundColor: '#333' }} />

      {/* Logout Button */}
      <Box sx={{ p: 2 }}>
        <Button
          fullWidth
          variant="outlined"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            color: '#b0b0b0',
            borderColor: '#333',
            '&:hover': {
              borderColor: '#f44336',
              color: '#f44336',
              backgroundColor: 'rgba(244, 67, 54, 0.1)',
            },
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="left"
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: {
            width: 280,
            backgroundColor: '#0b0b0b',
            color: '#ffffff',
          },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <Box
      sx={{
        width: 280,
        backgroundColor: '#0b0b0b',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        overflowY: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          backgroundColor: '#1a1a1a',
        },
        '&::-webkit-scrollbar-thumb': {
          backgroundColor: '#333',
          borderRadius: '3px',
          '&:hover': {
            backgroundColor: '#444',
          },
        },
      }}
    >
      {sidebarContent}
    </Box>
  );
};

export default Sidebar;
