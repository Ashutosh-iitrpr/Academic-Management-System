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
  Checkbox,
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
import FilterListIcon from '@mui/icons-material/FilterList';
import FileUploadIcon from '@mui/icons-material/FileUpload';
import DownloadIcon from '@mui/icons-material/Download';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  entryNumber?: string;
  department?: string;
  isFacultyAdvisor?: boolean;
  isActive: boolean;
  createdAt: string;
}

interface CreateUserForm {
  name: string;
  email: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'ADMIN';
  entryNumber?: string;
  department?: string;
  isFacultyAdvisor?: boolean;
}

interface EditUserForm extends CreateUserForm {
  id: string;
}

const DEPARTMENT_OPTIONS = [
  'Computer Science',
  'Mathematics',
  'Electrical Engineering',
  'Mechanical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Physics',
  'Chemistry',
];

const UsersPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState('');
  const [instructorDeptFilter, setInstructorDeptFilter] = useState('');
  const [studentBatchFilter, setStudentBatchFilter] = useState('');
  const [studentBranchFilter, setStudentBranchFilter] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState<EditUserForm | null>(null);
  const [updatingUser, setUpdatingUser] = useState(false);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [uploadingCsv, setUploadingCsv] = useState(false);
  const [togglingAdvisor, setTogglingAdvisor] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateUserForm>({
    name: '',
    email: '',
    role: 'STUDENT',
  });

  const axiosClient = getAxiosClient();

  useEffect(() => {
    fetchUsers();
  }, []);

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

  const handleDownloadStudents = async () => {
    try {
      setError('');
      const response = await axiosClient.get('/admin/users/download/students', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `students_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setSuccess('Students data downloaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to download students data';
      console.error('Error downloading students:', error);
      setError(errorMsg);
    }
  };

  const handleDownloadInstructors = async () => {
    try {
      setError('');
      const response = await axiosClient.get('/admin/users/download/instructors', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `instructors_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setSuccess('Instructors data downloaded successfully');
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || 'Failed to download instructors data';
      console.error('Error downloading instructors:', error);
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

  const handleOpenCsvDialog = () => {
    setCsvFile(null);
    setError('');
    setSuccess('');
    setCsvDialogOpen(true);
  };

  const handleCloseCsvDialog = () => {
    setCsvDialogOpen(false);
    setCsvFile(null);
    setError('');
    setSuccess('');
  };

  const handleCsvFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setError('Please select a valid CSV file');
        return;
      }
      setCsvFile(file);
      setError('');
    }
  };

  const handleCsvUpload = async () => {
    if (!csvFile) {
      setError('Please select a CSV file');
      return;
    }

    try {
      setUploadingCsv(true);
      setError('');

      const formDataToSend = new FormData();
      formDataToSend.append('file', csvFile);

      const response = await axiosClient.post('/admin/users/bulk-upload', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(`${response.data.createdCount} users created successfully!`);
      
      setTimeout(() => {
        handleCloseCsvDialog();
        fetchUsers();
      }, 1500);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'Failed to upload CSV';
      setError(errorMsg);
      console.error('Error uploading CSV:', err);
    } finally {
      setUploadingCsv(false);
    }
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

  const handleEditInputChange = (field: keyof EditUserForm, value: string | boolean) => {
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
    if (formData.role === 'INSTRUCTOR' && !formData.department?.trim()) {
      setError('Department is required for instructors');
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
        payload.isFacultyAdvisor = editFormData.isFacultyAdvisor;
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

  const handleToggleFacultyAdvisor = async (userId: string, currentStatus: boolean) => {
    try {
      setTogglingAdvisor(userId);
      setError('');
      setSuccess('');
      
      const payload = { isFacultyAdvisor: !currentStatus };
      console.log('Sending payload:', payload);
      
      const response = await axiosClient.patch(`/admin/users/${userId}`, payload);
      console.log('Response:', response.data);

      // Optimistically update local list using API response (fallback to toggled value)
      const newAdvisorValue =
        response?.data?.isFacultyAdvisor !== undefined
          ? response.data.isFacultyAdvisor
          : !currentStatus;

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, isFacultyAdvisor: newAdvisorValue } : u))
      );

      setSuccess(`Instructor ${newAdvisorValue ? 'set as' : 'removed from'} faculty advisor`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error: any) {
      const errorMsg = error?.response?.data?.message || error?.message || 'Failed to update faculty advisor status';
      console.error('Error toggling faculty advisor:', error);
      console.error('Error details:', error?.response?.data);
      setError(errorMsg);
    } finally {
      setTogglingAdvisor(null);
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

  const getBatch = (entryNumber?: string) => (entryNumber ? entryNumber.slice(0, 4) : '');
  const getBranch = (entryNumber?: string) => (entryNumber ? entryNumber.slice(4, 7) : '');

  const matchesSearch = (u: User) => {
    const term = search.trim().toLowerCase();
    if (!term) return true;
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.entryNumber && u.entryNumber.toLowerCase().includes(term))
    );
  };

  const matchesInstructorFilters = (u: User) => {
    if (!instructorDeptFilter.trim()) return true;
    return (u.department || '').toLowerCase().includes(instructorDeptFilter.trim().toLowerCase());
  };

  const matchesStudentFilters = (u: User) => {
    const batch = getBatch(u.entryNumber).toLowerCase();
    const branch = getBranch(u.entryNumber).toLowerCase();
    const batchOk = !studentBatchFilter.trim() || batch === studentBatchFilter.trim().toLowerCase();
    const branchOk = !studentBranchFilter.trim() || branch === studentBranchFilter.trim().toLowerCase();
    return batchOk && branchOk;
  };

  const admins = users.filter((u) => u.role === 'ADMIN' && matchesSearch(u));
  const instructors = users.filter((u) => u.role === 'INSTRUCTOR' && matchesSearch(u) && matchesInstructorFilters(u));
  const students = users.filter((u) => u.role === 'STUDENT' && matchesSearch(u) && matchesStudentFilters(u));
  const sortedStudents = [...students].sort((a, b) => (a.entryNumber || '').localeCompare(b.entryNumber || ''));

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
            <Typography variant="h4" sx={{ fontWeight: 700 }}>
              User Management
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                startIcon={<FileUploadIcon />}
                sx={{ borderColor: '#8B3A3A', color: '#8B3A3A' }}
                onClick={handleOpenCsvDialog}
              >
                Add from CSV
              </Button>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{ backgroundColor: '#8B3A3A' }}
                onClick={handleOpenDialog}
              >
                Add User
              </Button>
            </Box>
          </Box>

          {/* Global search */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12}>
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
          </Grid>

          {/* Students Table */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 1 }}>
            <TextField
              label="Student Batch"
              placeholder="e.g., 2023"
              value={studentBatchFilter}
              onChange={(e) => setStudentBatchFilter(e.target.value)}
              size="small"
              InputProps={{ startAdornment: <FilterListIcon fontSize="small" sx={{ mr: 1, color: '#999' }} /> }}
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Student Branch"
              placeholder="e.g., CSB"
              value={studentBranchFilter}
              onChange={(e) => setStudentBranchFilter(e.target.value)}
              size="small"
              InputProps={{ startAdornment: <FilterListIcon fontSize="small" sx={{ mr: 1, color: '#999' }} /> }}
              sx={{ minWidth: 180 }}
            />
          </Box>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0, overflow: 'auto' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Students</Typography>
                  <Chip label={`${sortedStudents.length}`} size="small" />
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ borderColor: '#8B3A3A', color: '#8B3A3A' }}
                  onClick={handleDownloadStudents}
                >
                  Download
                </Button>
              </Box>
              {students.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">No students found</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Entry Number</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Batch</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Branch</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortedStudents.map((user) => (
                      <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>{user.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>{user.email}</Typography>
                        </TableCell>
                        <TableCell>{user.entryNumber || '-'}</TableCell>
                        <TableCell>{getBatch(user.entryNumber) || '-'}</TableCell>
                        <TableCell>{getBranch(user.entryNumber) || '-'}</TableCell>
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

          {/* Instructors Table */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 1, gap: 2 }}>
            <TextField
              label="Instructor Department"
              placeholder="e.g., Computer Science"
              value={instructorDeptFilter}
              onChange={(e) => setInstructorDeptFilter(e.target.value)}
              size="small"
              InputProps={{ startAdornment: <FilterListIcon fontSize="small" sx={{ mr: 1, color: '#999' }} /> }}
              sx={{ minWidth: 260 }}
            />
          </Box>
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0, overflow: 'auto' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>Instructors</Typography>
                  <Chip label={`${instructors.length}`} size="small" />
                </Box>
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<DownloadIcon />}
                  sx={{ borderColor: '#8B3A3A', color: '#8B3A3A' }}
                  onClick={handleDownloadInstructors}
                >
                  Download
                </Button>
              </Box>
              {instructors.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">No instructors found</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Department</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {instructors.map((user) => (
                      <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography sx={{ fontWeight: 500 }}>{user.name}</Typography>
                            {user.isFacultyAdvisor && (
                              <Chip 
                                label="Faculty Advisor" 
                                size="small" 
                                variant="filled"
                                sx={{ 
                                  backgroundColor: '#FFC107', 
                                  color: '#333',
                                  fontWeight: 600,
                                  height: '24px'
                                }}
                              />
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>{user.email}</Typography>
                        </TableCell>
                        <TableCell>{user.department || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            label={user.isActive ? 'Active' : 'Inactive'}
                            color={user.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {user.role === 'INSTRUCTOR' ? (
                            <Tooltip title={user.isFacultyAdvisor ? 'Remove as Faculty Advisor' : 'Set as Faculty Advisor'}>
                              <Button
                                size="small"
                                variant={user.isFacultyAdvisor ? 'contained' : 'outlined'}
                                sx={{
                                  backgroundColor: user.isFacultyAdvisor ? '#FFC107' : 'transparent',
                                  color: user.isFacultyAdvisor ? '#333' : '#FFC107',
                                  borderColor: '#FFC107',
                                  marginRight: '8px',
                                  minWidth: '110px',
                                  '&:hover': {
                                    backgroundColor: user.isFacultyAdvisor ? '#FFB300' : 'rgba(255, 193, 7, 0.08)',
                                  },
                                }}
                                onClick={() => handleToggleFacultyAdvisor(user.id, user.isFacultyAdvisor || false)}
                                disabled={togglingAdvisor === user.id}
                              >
                                {togglingAdvisor === user.id ? (
                                  <CircularProgress size={16} sx={{ color: user.isFacultyAdvisor ? '#333' : '#FFC107' }} />
                                ) : user.isFacultyAdvisor ? (
                                'Unset Advisor'
                              ) : (
                                'Set Advisor'
                              )}
                            </Button>
                          </Tooltip>
                          ) : (
                            <Typography variant="body2" color="text.secondary" sx={{ marginRight: '8px', minWidth: '110px' }}>
                              -
                            </Typography>
                          )}
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
                                  isFacultyAdvisor: user.isFacultyAdvisor || false,
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

          {/* Admins Table */}
          <Card sx={{ mb: 3 }}>
            <CardContent sx={{ p: 0, overflow: 'auto' }}>
              <Box sx={{ p: 2, borderBottom: '1px solid #eee', display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>Admins</Typography>
                <Chip label={`${admins.length}`} size="small" />
              </Box>
              {admins.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">No admins found</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {admins.map((user) => (
                      <TableRow key={user.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>{user.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>{user.email}</Typography>
                        </TableCell>
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
                </Typography>
              </CardContent>
            </Card>
          </Box>
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
                  placeholder="e.g., john@iitrpr.ac.in"
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
                    row
                    sx={{ gap: 3 }}
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
                    select
                    fullWidth
                    label="Department"
                    placeholder="Select department"
                    value={formData.department || ''}
                    onChange={(e) => handleInputChange('department', e.target.value)}
                    disabled={creatingUser}
                  >
                    {DEPARTMENT_OPTIONS.map((dept) => (
                      <MenuItem key={dept} value={dept}>
                        {dept}
                      </MenuItem>
                    ))}
                  </TextField>
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

          {/* Edit User Dialog */}
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
                  placeholder="e.g., john@iitrpr.ac.in"
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
                  <>
                    <TextField
                      fullWidth
                      label="Department"
                      placeholder="e.g., Computer Science"
                      value={editFormData.department || ''}
                      onChange={(e) => handleEditInputChange('department', e.target.value)}
                      disabled={updatingUser}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={editFormData.isFacultyAdvisor || false}
                          onChange={(e) => handleEditInputChange('isFacultyAdvisor', e.target.checked)}
                          disabled={updatingUser}
                        />
                      }
                      label="Is Faculty Advisor"
                    />
                  </>
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

          {/* CSV Upload Dialog */}
          <Dialog open={csvDialogOpen} onClose={handleCloseCsvDialog} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>Bulk Upload Users from CSV</DialogTitle>
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
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1 }}>
                    CSV Format Required:
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    • <strong>name</strong> - User's full name (required)
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    • <strong>email</strong> - User's email address (required)
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    • <strong>role</strong> - STUDENT, INSTRUCTOR, or ADMIN (required)
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                    • <strong>entryNumber</strong> - Entry number (required for STUDENT)
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block' }}>
                    • <strong>department</strong> - Department name (required for INSTRUCTOR)
                  </Typography>
                </Alert>
                
                <TextField
                  fullWidth
                  type="file"
                  inputProps={{ accept: '.csv' }}
                  onChange={handleCsvFileChange}
                  disabled={uploadingCsv}
                  InputLabelProps={{ shrink: true }}
                  label="Select CSV File"
                />
                
                {csvFile && (
                  <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                    ✓ File selected: {csvFile.name}
                  </Typography>
                )}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseCsvDialog} disabled={uploadingCsv}>
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: '#8B3A3A' }}
                onClick={handleCsvUpload}
                disabled={uploadingCsv || !csvFile}
              >
                {uploadingCsv ? <CircularProgress size={24} /> : 'Upload'}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default UsersPage;
