'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  InputAdornment,
  Paper,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import coursesApi, { Course } from '@/lib/api/coursesApi';
import instructorApi, { CreateOfferingDto } from '@/lib/api/instructorApi';
import { useAuth } from '@/lib/auth/AuthContext';
import { toast } from 'sonner';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';
import BookIcon from '@mui/icons-material/Book';

const CoursesPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'request'>('view');
  const [submitting, setSubmitting] = useState(false);

  // Form state for requesting offering
  const [offeringForm, setOfferingForm] = useState({
    semester: '',
    timeSlot: '',
    allowedBranches: [] as string[],
  });

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await coursesApi.getAllCourses();
      setCourses(data);
      setFilteredCourses(data);
    } catch (error: any) {
      console.error('Failed to fetch courses:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredCourses(courses);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = courses.filter(
        course =>
          course.code.toLowerCase().includes(query) ||
          course.name.toLowerCase().includes(query)
      );
      setFilteredCourses(filtered);
    }
  }, [searchQuery, courses]);

  const handleOpenViewDialog = (course: Course) => {
    setSelectedCourse(course);
    setDialogType('view');
    setOpenDialog(true);
  };

  const handleOpenRequestDialog = (course: Course) => {
    setSelectedCourse(course);
    setDialogType('request');
    setOfferingForm({
      semester: '',
      timeSlot: '',
      allowedBranches: [],
    });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCourse(null);
  };

  const handleBranchToggle = (branch: string) => {
    setOfferingForm(prev => ({
      ...prev,
      allowedBranches: prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter(b => b !== branch)
        : [...prev.allowedBranches, branch],
    }));
  };

  const handleRequestOffering = async () => {
    try {
      if (!selectedCourse || !offeringForm.semester || !offeringForm.timeSlot) {
        toast.error('Please fill all required fields');
        return;
      }

      setSubmitting(true);
      const dto: CreateOfferingDto = {
        courseId: selectedCourse.id,
        semester: offeringForm.semester,
        timeSlot: offeringForm.timeSlot,
        allowedBranches: offeringForm.allowedBranches,
      };

      await instructorApi.requestCourseOffering(dto);
      toast.success('Course offering requested successfully');
      handleCloseDialog();
    } catch (error: any) {
      console.error('Failed to request offering:', error);
      toast.error(error.response?.data?.message || 'Failed to request offering');
    } finally {
      setSubmitting(false);
    }
  };

  const BRANCHES = ['CSB', 'MEB', 'ECB', 'EEB', 'CEB'];
  const SEMESTERS = ['Spring 2026', 'Summer 2026', 'Fall 2026', 'Spring 2027'];
  const TIME_SLOTS = ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6'];

  const isInstructor = user?.role === 'INSTRUCTOR';
  const isStudent = user?.role === 'STUDENT';

  return (
    <ProtectedRoute>
      <DashboardLayout pageTitle="Course Catalog">
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Course Catalog
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 3 }}>
              {isInstructor
                ? 'Browse courses and request offerings'
                : isStudent
                ? 'Explore available courses'
                : 'Manage all courses'}
            </Typography>

            {/* Search Bar */}
            <TextField
              fullWidth
              placeholder="Search courses by code or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                backgroundColor: '#f5f5f5',
                borderRadius: 1,
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: '#e0e0e0',
                  },
                  '&:hover fieldset': {
                    borderColor: '#8B3A3A',
                  },
                },
              }}
            />
          </Box>

          {/* Courses Grid */}
          {loading ? (
            <LoadingSkeleton type="grid" count={6} />
          ) : filteredCourses.length === 0 ? (
            <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center', py: 6 }}>
              <BookIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                No Courses Found
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                {searchQuery ? 'Try adjusting your search query' : 'No courses available at the moment'}
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {filteredCourses.map(course => (
                <Grid item xs={12} sm={6} md={4} key={course.id}>
                  <Card
                    sx={{
                      border: '1px solid #e0e0e0',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                      {/* Course Code */}
                      <Box>
                        <Typography variant="overline" sx={{ color: '#999', fontWeight: 600, letterSpacing: 0.5 }}>
                          Course Code
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                          {course.code}
                        </Typography>
                      </Box>

                      {/* Course Name */}
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {course.name}
                        </Typography>
                        {course.description && (
                          <Typography variant="body2" sx={{ color: '#666', lineHeight: 1.5 }}>
                            {course.description}
                          </Typography>
                        )}
                      </Box>

                      {/* Course Details */}
                      <Box sx={{ display: 'flex', gap: 2, pb: 1, borderTop: '1px solid #e0e0e0', pt: 2 }}>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, display: 'block', mb: 0.5 }}>
                            Credits
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: '#8B3A3A' }}>
                            {course.credits}
                          </Typography>
                        </Box>
                        {course.department && (
                          <Box>
                            <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, display: 'block', mb: 0.5 }}>
                              Department
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              {course.department}
                            </Typography>
                          </Box>
                        )}
                      </Box>

                      {/* Prerequisites */}
                      {course.prerequisites && (
                        <Box sx={{ pt: 1, borderTop: '1px solid #e0e0e0' }}>
                          <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, display: 'block', mb: 0.5 }}>
                            Prerequisites
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', fontSize: '0.875rem' }}>
                            {course.prerequisites}
                          </Typography>
                        </Box>
                      )}

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1, mt: 'auto', pt: 2 }}>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#8B3A3A',
                            color: '#8B3A3A',
                            textTransform: 'none',
                          }}
                          onClick={() => handleOpenViewDialog(course)}
                        >
                          View Details
                        </Button>
                        {isInstructor && (
                          <Button
                            fullWidth
                            size="small"
                            variant="contained"
                            startIcon={<AddIcon />}
                            sx={{
                              backgroundColor: '#8B3A3A',
                              '&:hover': { backgroundColor: '#6B2A2A' },
                              textTransform: 'none',
                            }}
                            onClick={() => handleOpenRequestDialog(course)}
                          >
                            Request Offering
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* View Details Dialog */}
        <Dialog open={openDialog && dialogType === 'view'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {selectedCourse?.code} - Course Details
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {selectedCourse && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                    COURSE NAME
                  </Typography>
                  <Typography variant="body2">{selectedCourse.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                    CREDITS
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#8B3A3A' }}>
                    {selectedCourse.credits}
                  </Typography>
                </Box>
                {selectedCourse.department && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                      DEPARTMENT
                    </Typography>
                    <Typography variant="body2">{selectedCourse.department}</Typography>
                  </Box>
                )}
                {selectedCourse.description && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                      DESCRIPTION
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                      {selectedCourse.description}
                    </Typography>
                  </Box>
                )}
                {selectedCourse.prerequisites && (
                  <Box>
                    <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                      PREREQUISITES
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                      {selectedCourse.prerequisites}
                    </Typography>
                  </Box>
                )}
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
              Close
            </Button>
            {isInstructor && selectedCourse && (
              <Button
                onClick={() => {
                  handleCloseDialog();
                  handleOpenRequestDialog(selectedCourse);
                }}
                variant="contained"
                sx={{
                  backgroundColor: '#8B3A3A',
                  '&:hover': { backgroundColor: '#6B2A2A' },
                }}
              >
                Request Offering
              </Button>
            )}
          </DialogActions>
        </Dialog>

        {/* Request Offering Dialog */}
        <Dialog open={openDialog && dialogType === 'request'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            Request Offering for {selectedCourse?.code}
          </DialogTitle>
          <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Paper sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                {selectedCourse?.name}
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Credits: <strong>{selectedCourse?.credits}</strong>
              </Typography>
            </Paper>

            <FormControl fullWidth>
              <InputLabel>Semester *</InputLabel>
              <Select
                value={offeringForm.semester}
                label="Semester *"
                onChange={(e) => setOfferingForm(prev => ({ ...prev, semester: e.target.value }))}
              >
                {SEMESTERS.map(sem => (
                  <MenuItem key={sem} value={sem}>
                    {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Time Slot *</InputLabel>
              <Select
                value={offeringForm.timeSlot}
                label="Time Slot *"
                onChange={(e) => setOfferingForm(prev => ({ ...prev, timeSlot: e.target.value }))}
              >
                {TIME_SLOTS.map(slot => (
                  <MenuItem key={slot} value={slot}>
                    {slot}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Allowed Branches
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {BRANCHES.map(branch => (
                  <Chip
                    key={branch}
                    label={branch}
                    onClick={() => handleBranchToggle(branch)}
                    variant={offeringForm.allowedBranches.includes(branch) ? 'filled' : 'outlined'}
                    sx={{
                      backgroundColor: offeringForm.allowedBranches.includes(branch) ? '#8B3A3A' : 'transparent',
                      color: offeringForm.allowedBranches.includes(branch) ? 'white' : '#8B3A3A',
                      borderColor: '#8B3A3A',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestOffering}
              variant="contained"
              sx={{
                backgroundColor: '#8B3A3A',
                '&:hover': { backgroundColor: '#6B2A2A' },
              }}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 'Request Offering'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CoursesPage;
