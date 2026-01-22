'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import instructorApi, { CourseOffering, Enrollment } from '@/lib/api/instructorApi';
import { toast } from 'sonner';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import VisibilityIcon from '@mui/icons-material/Visibility';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';

const AllOfferingsPage = () => {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [filteredOfferings, setFilteredOfferings] = useState<CourseOffering[]>([]);
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  
  // Dialog
  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    fetchAllOfferings();
  }, []);

  useEffect(() => {
    filterOfferings();
  }, [searchQuery, statusFilter, semesterFilter, offerings]);

  const fetchAllOfferings = async () => {
    try {
      setLoading(true);
      const data = await instructorApi.getAllCourseOfferings();
      setOfferings(data);
    } catch (error: any) {
      console.error('Failed to fetch offerings:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch course offerings');
    } finally {
      setLoading(false);
    }
  };

  const filterOfferings = () => {
    let filtered = [...offerings];

    // Search filter (course code, name, or instructor)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.course.code.toLowerCase().includes(query) ||
          o.course.name.toLowerCase().includes(query) ||
          o.instructor?.name.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Semester filter
    if (semesterFilter !== 'ALL') {
      filtered = filtered.filter((o) => o.semester === semesterFilter);
    }

    setFilteredOfferings(filtered);
  };

  const handleViewEnrollments = async (offering: CourseOffering) => {
    setSelectedOffering(offering);
    setDialogOpen(true);
    setLoadingEnrollments(true);

    try {
      const data = await instructorApi.getEnrollmentsList(offering.id);
      setEnrollments(data);
    } catch (error: any) {
      console.error('Failed to fetch enrollments:', error);
      toast.error('Failed to load enrollments');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedOffering(null);
    setEnrollments([]);
  };

  // Get unique semesters for filter
  const uniqueSemesters = Array.from(new Set(offerings.map((o) => o.semester)));

  // Status badge mapping
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'ENROLLING':
        return 'info';
      case 'COMPLETED':
        return 'success';
      case 'REJECTED':
      case 'WITHDRAWN':
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="INSTRUCTOR">
        <DashboardLayout pageTitle="All Course Offerings">
          <LoadingSkeleton />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="All Course Offerings">
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
            All Course Offerings
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Browse all approved course offerings across all instructors and semesters
          </Typography>

          {/* Filters */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search by course code, name, or instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />,
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    label="Status"
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Statuses</MenuItem>
                    <MenuItem value="ENROLLING">Enrolling</MenuItem>
                    <MenuItem value="COMPLETED">Completed</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Semester</InputLabel>
                  <Select
                    value={semesterFilter}
                    label="Semester"
                    onChange={(e) => setSemesterFilter(e.target.value)}
                  >
                    <MenuItem value="ALL">All Semesters</MenuItem>
                    {uniqueSemesters.map((sem) => (
                      <MenuItem key={sem} value={sem}>
                        {sem}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Typography variant="body2" color="text.secondary" align="center">
                  {filteredOfferings.length} of {offerings.length} offerings
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          {/* Offerings Table */}
          {filteredOfferings.length === 0 ? (
            <Paper sx={{ p: 4, textAlign: 'center' }}>
              <Typography color="text.secondary">No course offerings found</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 600 }}>Course Code</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Course Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Semester</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Time Slot</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Credits</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }} align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredOfferings.map((offering) => (
                    <TableRow key={offering.id} hover>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {offering.course.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{offering.course.name}</Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <PersonIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          <Typography variant="body2">
                            {offering.instructor?.name || 'Unknown'}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip label={offering.semester} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>
                        <Chip label={offering.timeSlot} size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{offering.course.credits}</Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={offering.status}
                          size="small"
                          color={getStatusColor(offering.status) as any}
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="View Enrollments">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleViewEnrollments(offering)}
                          >
                            <VisibilityIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {/* Enrollments Dialog */}
          <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <DialogTitle>
              <Typography variant="h6">
                Enrollments for {selectedOffering?.course.code} - {selectedOffering?.course.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Instructor: {selectedOffering?.instructor?.name} | Semester: {selectedOffering?.semester}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 1, alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PeopleIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Total Enrollments: {selectedOffering?._count?.enrollments || 0}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Allowed Branches:
                  </Typography>
                  {selectedOffering?.allowedBranches.map((branch) => (
                    <Chip key={branch} label={branch} size="small" />
                  ))}
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              {loadingEnrollments ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <LoadingSkeleton />
                </Box>
              ) : enrollments.length === 0 ? (
                <Typography color="text.secondary" align="center" sx={{ py: 3 }}>
                  No enrollments found
                </Typography>
              ) : (
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600 }}>Entry Number</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>{enrollment.student.entryNumber || 'N/A'}</TableCell>
                          <TableCell>{enrollment.student.name}</TableCell>
                          <TableCell>{enrollment.student.email}</TableCell>
                          <TableCell>
                            <Chip
                              label={enrollment.enrollmentType}
                              size="small"
                              variant="outlined"
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={enrollment.status}
                              size="small"
                              color={
                                enrollment.status === 'ENROLLED'
                                  ? 'success'
                                  : enrollment.status === 'DROPPED'
                                  ? 'error'
                                  : 'warning'
                              }
                            />
                          </TableCell>
                          <TableCell>
                            {enrollment.grade ? (
                              <Chip label={enrollment.grade} size="small" color="primary" />
                            ) : (
                              <Typography variant="body2" color="text.secondary">
                                -
                              </Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AllOfferingsPage;
