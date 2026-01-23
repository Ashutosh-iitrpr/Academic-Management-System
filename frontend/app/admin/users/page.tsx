'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  CircularProgress,
  IconButton,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from '@mui/material';
import Alert from '@mui/material/Alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/lib/auth/AuthContext';
import { getAxiosClient } from '@/lib/api/axiosClient';

// Icons
import PeopleIcon from '@mui/icons-material/People';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  entryNumber?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
}

interface CreateUserForm {
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  entryNumber?: string;
  department?: string;
}

interface EditUserForm extends CreateUserForm {
  id: string;
}

const UsersPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditUserForm | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    email: '',
    role: 'STUDENT',
  });

  const axiosClient = getAxiosClient();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [search, roleFilter, users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (search) {
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (u.entryNumber && u.entryNumber.toLowerCase().includes(search.toLowerCase()))
      );
    }

    if (roleFilter) {
      filtered = filtered.filter((u) => u.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleDeactivate = async (userId: string) => {
    try {
      setError('');
      await axiosClient.patch(`/admin/users/${userId}/deactivate`);
      setSuccess('User deactivated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to deactivate user';
      console.error('Error deactivating user:', error);
      setError(errorMsg);
    }
  };

  const handleActivate = async (userId: string) => {
    try {
      setError('');
      await axiosClient.patch(`/admin/users/${userId}/activate`);
      setSuccess('User activated successfully');
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to activate user';
      console.error('Error activating user:', error);
      setError(errorMsg);
    }
  };

  const handleEditDepartment = (user: User) => {
    if (user.role !== 'INSTRUCTOR') {
      setError('Only instructors can have departments');
      return;
    }
    setEditFormData({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as EditUserForm['role'],
      entryNumber: user.entryNumber || '',
      department: user.department || '',
    });
    setError('');
    setSuccess('');
    setEditDialogOpen(true);
  };

  const handleUpdateDepartment = async () => {
    if (!editFormData || !editFormData.department?.trim()) {
      setError('Department cannot be empty');
      return;
    }

    try {
      setUpdatingUser(true);
      setError('');
      await axiosClient.patch(`/admin/users/${editFormData.id}`, {
        department: editFormData.department,
      });
      setSuccess('User updated successfully');
      setEditDialogOpen(false);
      setEditFormData(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to update user';
      console.error('Error updating user:', error);
      setError(errorMsg);
    } finally {
      setUpdatingUser(false);
    }
  };

  const handleCloseDepartmentDialog = () => {
    setEditDialogOpen(false);
    setEditFormData(null);
  };

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      email: '',
      role: 'STUDENT',
    });
    setError('');
    setSuccess('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', email: '', role: 'STUDENT' });
    setError('');
    setSuccess('');
  };

  const handleInputChange = (field: keyof CreateUserForm, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEditInputChange = (field: keyof EditUserForm, value: string) => {
    setEditFormData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    if (!formData.email.trim()) {
      setError('Email is required');
      return false;
    }
    if (formData.role === 'STUDENT' && !formData.entryNumber?.trim()) {
      setError('Entry number is required for students');
      return false;
    }
    return true;
  };

  const validateEditForm = () => {
    if (!editFormData) return false;

    if (!editFormData.name.trim()) {
      setError('Name is required');
      return false;
    }

    if (!editFormData.email.trim()) {
      setError('Email is required');
      return false;
    }

    if (editFormData.role === 'STUDENT' && !editFormData.entryNumber?.trim()) {
      setError('Entry number is required for students');
      return false;
    }

    if (editFormData.role === 'INSTRUCTOR' && !editFormData.department?.trim()) {
      setError('Department is required for instructors');
      return false;
    }

    return true;
  };

  const handleCreateUser = async () => {
    if (!validateForm()) return;

    try {
      setCreatingUser(true);
      setError('');

      const payload: any = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
      };

      if (formData.role === 'STUDENT') {
        payload.entryNumber = formData.entryNumber;
      }

      if (formData.role === 'INSTRUCTOR' && formData.department) {
        payload.department = formData.department;
      }

      const response = await axiosClient.post('/admin/users', payload);
      setSuccess('User created successfully!');
      
      // Add the new user to the list
      setUsers([response.data, ...users]);
      
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!editFormData) return;
    if (!validateEditForm()) return;

    try {
      setUpdatingUser(true);
      setError('');

      const payload: any = {
        name: editFormData.name,
        email: editFormData.email,
      };

      if (editFormData.role === 'STUDENT') {
        payload.entryNumber = editFormData.entryNumber;
      }

      if (editFormData.role === 'INSTRUCTOR') {
        payload.department = editFormData.department;
      }

      await axiosClient.patch(`/admin/users/${editFormData.id}`, payload);
      setSuccess('User updated successfully');
      setEditDialogOpen(false);
      setEditFormData(null);
      setTimeout(() => setSuccess(''), 3000);
      fetchUsers();
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to update user';
      console.error('Error updating user:', error);
      setError(errorMsg);
    } finally {
      setUpdatingUser(false);
    }
  };

  const getRoleColor = (role: string) => {
    const colors: { [key: string]: string } = {
      ADMIN: '#8B3A3A',
      INSTRUCTOR: '#2E5090',
      STUDENT: '#4CAF50',
    };
    return colors[role] || '#999';
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout pageTitle="User Management">
          <LoadingSkeleton count={5} />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout pageTitle="User Management">
        <Box sx={{ mb: 4 }}>
                    {/* Messages */}
                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                        {error}
                      </Alert>
                    )}
                    {success && (
                      <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                        {success}
                      </Alert>
                    )}

          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <PeopleIcon sx={{ fontSize: 28, color: '#8B3A3A' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                User Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ backgroundColor: '#8B3A3A' }}
              onClick={handleOpenDialog}
            >
              Add User
            </Button>
          </Box>

          {/* Filters */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                placeholder="Search by name, email, or entry number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} /> }}
                size="small"
                variant="outlined"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                select
                label="Filter by Role"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                size="small"
              >
                <MenuItem value="">All Roles</MenuItem>
                <MenuItem value="ADMIN">Admin</MenuItem>
                <MenuItem value="INSTRUCTOR">Instructor</MenuItem>
                <MenuItem value="STUDENT">Student</MenuItem>
              </TextField>
            </Grid>
          </Grid>

          {/* Users Table */}
          <Card>
            <CardContent sx={{ p: 0, overflow: 'auto' }}>
              {filteredUsers.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">No users found</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Role</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Entry Number</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredUsers.map((user) => (
                      <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>{user.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>{user.email}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={user.role}
                            sx={{
                              backgroundColor: getRoleColor(user.role),
                              color: '#fff',
                              fontWeight: 600,
                            }}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{user.entryNumber || '-'}</TableCell>
                        <TableCell>{user.department || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit user">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => {
                                setEditFormData({
                                  id: user.id,
                                  name: user.name,
                                  email: user.email,
                                  role: user.role as EditUserForm['role'],
                                  entryNumber: user.entryNumber || '',
                                  department: user.department || '',
                                });
                                setError('');
                                setSuccess('');
                                setEditDialogOpen(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          {user.isActive ? (
                            <Tooltip title="Deactivate">
                              <IconButton
                                size="small"
                                color="warning"
                                onClick={() => handleDeactivate(user.id)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          ) : (
                            <Tooltip title="Activate">
                              <IconButton
                                size="small"
                                color="success"
                                onClick={() => handleActivate(user.id)}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Summary */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Card sx={{ flex: 1, minWidth: '200px' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Users
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {users.length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, minWidth: '200px' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Active Users
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {users.filter((u) => u.isActive).length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, minWidth: '200px' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Instructors
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {users.filter((u) => u.role === 'INSTRUCTOR').length}
                </Typography>
              </CardContent>
            </Card>
            <Card sx={{ flex: 1, minWidth: '200px' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Students
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {users.filter((u) => u.role === 'STUDENT').length}

                        {/* Create User Dialog */}
                        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                          <DialogTitle sx={{ fontWeight: 700 }}>Create New User</DialogTitle>
                          <DialogContent sx={{ pt: 2 }}>
                            {error && (
                              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                                {error}
                              </Alert>
                            )}
                            {success && (
                              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                                {success}
                              </Alert>
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <TextField
                                fullWidth
                                label="Full Name"
                                placeholder="e.g., John Doe"
                                value={formData.name}
                                onChange={(e) => handleInputChange('name', e.target.value)}
                                disabled={creatingUser}
                              />
                              <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                placeholder="e.g., john@university.edu"
                                value={formData.email}
                                onChange={(e) => handleInputChange('email', e.target.value)}
                                disabled={creatingUser}
                              />
                              <FormControl component="fieldset" disabled={creatingUser}>
                                <FormLabel component="legend" sx={{ fontWeight: 600, color: '#1a1a1a', mb: 1 }}>
                                  Role
                                </FormLabel>
                                <RadioGroup
                                  value={formData.role}
                                  onChange={(e) => handleInputChange('role', e.target.value as any)}
                                >
                                  <FormControlLabel 
                                    value="STUDENT" 
                                    control={<Radio sx={{ color: '#4CAF50', '&.Mui-checked': { color: '#4CAF50' } }} />} 
                                    label="Student" 
                                  />
                                  <FormControlLabel 
                                    value="INSTRUCTOR" 
                                    control={<Radio sx={{ color: '#2E5090', '&.Mui-checked': { color: '#2E5090' } }} />} 
                                    label="Instructor" 
                                  />
                                  <FormControlLabel 
                                    value="ADMIN" 
                                    control={<Radio sx={{ color: '#8B3A3A', '&.Mui-checked': { color: '#8B3A3A' } }} />} 
                                    label="Admin" 
                                  />
                                </RadioGroup>
                              </FormControl>
                              {formData.role === 'STUDENT' && (
                                <TextField
                                  fullWidth
                                  label="Entry Number"
                                  placeholder="e.g., CS2024001"
                                  value={formData.entryNumber || ''}
                                  onChange={(e) => handleInputChange('entryNumber', e.target.value)}
                                  disabled={creatingUser}
                                />
                              )}
                              {formData.role === 'INSTRUCTOR' && (
                                <TextField
                                  fullWidth
                                  label="Department"
                                  placeholder="e.g., Computer Science"
                                  value={formData.department || ''}
                                  onChange={(e) => handleInputChange('department', e.target.value)}
                                  disabled={creatingUser}
                                />
                              )}
                            </Box>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={handleCloseDialog} disabled={creatingUser}>
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              sx={{ backgroundColor: '#8B3A3A' }}
                              onClick={handleCreateUser}
                              disabled={creatingUser}
                            >
                              {creatingUser ? <CircularProgress size={24} /> : 'Create User'}
                            </Button>
                          </DialogActions>
                        </Dialog>

                        {/* Department Edit Dialog */}
                        <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
                          <DialogTitle sx={{ fontWeight: 700 }}>Edit User</DialogTitle>
                          <DialogContent sx={{ pt: 2 }}>
                            {error && (
                              <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
                                {error}
                              </Alert>
                            )}
                            {success && (
                              <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
                                {success}
                              </Alert>
                            )}
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                              <TextField
                                fullWidth
                                label="Full Name"
                                placeholder="e.g., John Doe"
                                value={editFormData?.name || ''}
                                onChange={(e) => handleEditInputChange('name', e.target.value)}
                                disabled={updatingUser || !editFormData}
                              />
                              <TextField
                                fullWidth
                                label="Email"
                                type="email"
                                placeholder="e.g., john@university.edu"
                                value={editFormData?.email || ''}
                                onChange={(e) => handleEditInputChange('email', e.target.value)}
                                disabled={updatingUser || !editFormData}
                              />
                              <TextField fullWidth label="Role" value={editFormData?.role || ''} disabled />
                              {editFormData?.role === 'STUDENT' && (
                                <TextField
                                  fullWidth
                                  label="Entry Number"
                                  placeholder="e.g., 2023CSB1289"
                                  value={editFormData.entryNumber || ''}
                                  onChange={(e) => handleEditInputChange('entryNumber', e.target.value)}
                                  disabled={updatingUser}
                                />
                              )}
                              {editFormData?.role === 'INSTRUCTOR' && (
                                <TextField
                                  fullWidth
                                  label="Department"
                                  placeholder="e.g., Computer Science"
                                  value={editFormData.department || ''}
                                  onChange={(e) => handleEditInputChange('department', e.target.value)}
                                  disabled={updatingUser}
                                />
                              )}
                            </Box>
                          </DialogContent>
                          <DialogActions>
                            <Button onClick={() => setEditDialogOpen(false)} disabled={updatingUser}>
                              Cancel
                            </Button>
                            <Button
                              variant="contained"
                              sx={{ backgroundColor: '#8B3A3A' }}
                              onClick={handleUpdateUser}
                              disabled={updatingUser || !editFormData}
                            >
                              {updatingUser ? <CircularProgress size={24} /> : 'Save Changes'}
                            </Button>
                          </DialogActions>
                        </Dialog>
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UsersPage;
