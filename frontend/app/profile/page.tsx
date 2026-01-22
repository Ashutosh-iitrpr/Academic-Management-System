'use client';

import React from 'react';
import { Card, CardContent, Box, Typography, Grid, TextField, Button, Avatar } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import EditIcon from '@mui/icons-material/Edit';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <DashboardLayout pageTitle="My Profile">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 4 }}>
            User Profile
          </Typography>

          {/* Profile Header Card */}
          <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    backgroundColor: '#8B3A3A',
                    fontSize: '3rem',
                    fontWeight: 700,
                  }}
                >
                  {user?.name.charAt(0).toUpperCase()}
                </Avatar>
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 0.5 }}>
                    {user?.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                    {user?.email}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Typography variant="caption" sx={{ backgroundColor: '#f5f5f5', px: 1.5, py: 0.5, borderRadius: 1 }}>
                      Role: {user?.role}
                    </Typography>
                    {user?.entryNumber && (
                      <Typography variant="caption" sx={{ backgroundColor: '#f5f5f5', px: 1.5, py: 0.5, borderRadius: 1 }}>
                        Entry: {user.entryNumber}
                      </Typography>
                    )}
                    {user?.branch && (
                      <Typography variant="caption" sx={{ backgroundColor: '#f5f5f5', px: 1.5, py: 0.5, borderRadius: 1 }}>
                        Branch: {user.branch}
                      </Typography>
                    )}
                    {user?.department && (
                      <Typography variant="caption" sx={{ backgroundColor: '#f5f5f5', px: 1.5, py: 0.5, borderRadius: 1 }}>
                        Department: {user.department}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Profile Form */}
          <Card sx={{ border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EditIcon /> Edit Profile
              </Typography>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    defaultValue={user?.name}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    defaultValue={user?.email}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Role"
                    defaultValue={user?.role}
                    disabled
                    variant="outlined"
                  />
                </Grid>
                {user?.entryNumber && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Entry Number"
                      defaultValue={user.entryNumber}
                      disabled
                      variant="outlined"
                    />
                  </Grid>
                )}
                {user?.branch && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Branch"
                      defaultValue={user.branch}
                      disabled
                      variant="outlined"
                    />
                  </Grid>
                )}
                {user?.department && (
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Department"
                      defaultValue={user.department}
                      disabled
                      variant="outlined"
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    Note: Contact your administrator to change profile information.
                  </Typography>
                </Grid>
              </Grid>

              <Box sx={{ mt: 4, pt: 3, borderTop: '1px solid #e0e0e0' }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Account Settings
                </Typography>
                <Button
                  variant="outlined"
                  sx={{
                    borderColor: '#f44336',
                    color: '#f44336',
                    '&:hover': {
                      backgroundColor: '#ffebee',
                    },
                  }}
                >
                  Change Password
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
