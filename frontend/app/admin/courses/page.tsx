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
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/lib/auth/AuthContext';
import { getAxiosClient } from '@/lib/api/axiosClient';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import SearchIcon from '@mui/icons-material/Search';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  description?: string;
  offerings: Array<{
    id: string;
    status: string;
    instructor: { id: string; name: string };
  }>;
  createdAt: string;
}

interface CreateCourseForm {
  name: string;
  code: string;
  credits: number;
  description?: string;
}

const CoursesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [creatingCourse, setCreatingCourse] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateCourseForm>({
    name: '',
    code: '',
    credits: 3,
  });

  const axiosClient = getAxiosClient();

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    filterCourses();
  }, [search, courses]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/courses');
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCourses = () => {
    let filtered = courses;

    if (search) {
      filtered = filtered.filter(
        (c) =>
          c.name.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase())
      );
    }

    setFilteredCourses(filtered);
  };

  const handleOpenDialog = () => {
    setFormData({
      name: '',
      code: '',
      credits: 3,
    });
    setError('');
    setSuccess('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setFormData({ name: '', code: '', credits: 3 });
    setError('');
    setSuccess('');
    setEditingCourseId(null);
  };

  const handleInputChange = (field: keyof CreateCourseForm, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Course name is required');
      return false;
    }
    if (!formData.code.trim()) {
      setError('Course code is required');
      return false;
    }
    if (formData.credits <= 0) {
      setError('Credits must be greater than 0');
      return false;
    }
    return true;
  };

  const handleCreateCourse = async () => {
    if (!validateForm()) return;

    try {
      setCreatingCourse(true);
      setError('');

      const payload = {
        name: formData.name,
        code: formData.code,
        credits: formData.credits,
        description: formData.description || '',
      };

      const response = await axiosClient.post('/courses', payload);
      setSuccess('Course created successfully!');
      setCourses([response.data, ...courses]);
    
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setCreatingCourse(false);
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourseId(course.id);
    setFormData({
      name: course.name,
      code: course.code,
      credits: course.credits,
      description: course.description || '',
    });
    setError('');
    setSuccess('');
    setOpenDialog(true);
  };

  const handleSaveEditCourse = async () => {
    if (!validateForm()) return;

    try {
      setCreatingCourse(true);
      setError('');

      const payload = {
        name: formData.name,
        code: formData.code,
        credits: formData.credits,
      };

      await axiosClient.patch(`/admin/courses/${editingCourseId}`, payload);
      setSuccess('Course updated successfully!');
      
      setCourses(
        courses.map((c) =>
          c.id === editingCourseId
            ? { ...c, ...payload }
            : c
        )
      );
    
      setTimeout(() => {
        handleCloseDialog();
        setEditingCourseId(null);
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setCreatingCourse(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout pageTitle="Course Management">
          <LoadingSkeleton count={5} />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout pageTitle="Course Management">
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
              <SchoolIcon sx={{ fontSize: 28, color: '#8B3A3A' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Course Management
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{ backgroundColor: '#8B3A3A' }}
              onClick={handleOpenDialog}
            >
              Add Course
            </Button>
          </Box>

          {/* Search */}
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by course name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} /> }}
              size="small"
              variant="outlined"
            />
          </Box>

          {/* Courses Table */}
          <Card>
            <CardContent sx={{ p: 0, overflow: 'auto' }}>
              {filteredCourses.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">No courses found</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Code</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Credits</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredCourses.map((course) => (
                      <TableRow key={course.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <Typography sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                            {course.code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>{course.name}</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={`${course.credits} Credits`}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Edit Course">
                            <IconButton size="small" color="primary" onClick={() => handleEditCourse(course)}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
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
                  Total Courses
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  {courses.length}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Create/Edit Course Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editingCourseId ? 'Edit Course' : 'Create New Course'}
          </DialogTitle>
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
                label="Course Code"
                placeholder="e.g., CS101"
                value={formData.code}
                onChange={(e) => handleInputChange('code', e.target.value)}
                disabled={creatingCourse}
              />
              <TextField
                fullWidth
                label="Course Name"
                placeholder="e.g., Data Structures"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                disabled={creatingCourse}
              />
              <TextField
                fullWidth
                label="Credits"
                type="number"
                value={formData.credits}
                onChange={(e) => handleInputChange('credits', parseInt(e.target.value) || 0)}
                disabled={creatingCourse}
                inputProps={{ min: 1 }}
              />
              <TextField
                fullWidth
                label="Description"
                placeholder="Enter course description (optional)"
                multiline
                rows={3}
                value={formData.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={creatingCourse}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={creatingCourse}>
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#8B3A3A' }}
              onClick={editingCourseId ? handleSaveEditCourse : handleCreateCourse}
              disabled={creatingCourse}
            >
              {creatingCourse ? <CircularProgress size={24} /> : editingCourseId ? 'Save Changes' : 'Create Course'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Enrollments Dialog - REMOVED */}
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CoursesPage;
