'use client';

import React, { useEffect, useState, useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import StatusChip from '@/components/ui/StatusChip';
import studentApi from '@/lib/api/studentApi';
import { toast } from 'sonner';
import { format } from 'date-fns';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import InfoIcon from '@mui/icons-material/Info';

interface EnrollmentDisplay {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  instructor: string;
  instructorEmail: string;
  semester: string;
  timeSlot: string;
  status: string;
  enrollmentType: string;
  grade?: string;
  source: string;
  createdAt: string;
  approvedAt?: string;
  completedAt?: string;
}

const StudentEnrollmentsPage = () => {
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<EnrollmentDisplay[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [semesterFilter, setSemesterFilter] = useState<string>('ALL');
  const [error, setError] = useState<string | null>(null);
  const [selectedEnrollment, setSelectedEnrollment] = useState<EnrollmentDisplay | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionInProgress, setActionInProgress] = useState(false);

  useEffect(() => {
    fetchEnrollments();
  }, []);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getMyEnrollments();
      
      const transformed: EnrollmentDisplay[] = data.map((e: any) => ({
        id: e.id,
        courseCode: e.courseOffering.course.code,
        courseName: e.courseOffering.course.name,
        credits: e.courseOffering.course.credits,
        instructor: e.courseOffering.instructor.name,
        instructorEmail: e.courseOffering.instructor.email,
        semester: e.courseOffering.semester,
        timeSlot: e.courseOffering.timeSlot,
        status: e.status,
        enrollmentType: e.enrollmentType,
        grade: e.grade,
        source: e.source,
        createdAt: e.createdAt,
        approvedAt: e.approvedAt,
        completedAt: e.completedAt,
      }));

      setEnrollments(transformed);
    } catch (err: any) {
      console.error('Failed to fetch enrollments:', err);
      setError(err.response?.data?.message || 'Failed to load enrollments');
      toast.error('Failed to load enrollments');
    } finally {
      setLoading(false);
    }
  };

  // Get unique semesters for filter
  const semesters = useMemo(() => {
    const unique = Array.from(new Set(enrollments.map(e => e.semester)));
    return unique.sort().reverse();
  }, [enrollments]);

  // Filter enrollments
  const filteredEnrollments = useMemo(() => {
    let filtered = enrollments;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((e) => e.status === statusFilter);
    }

    // Filter by semester
    if (semesterFilter !== 'ALL') {
      filtered = filtered.filter((e) => e.semester === semesterFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.courseCode.toLowerCase().includes(query) ||
          e.courseName.toLowerCase().includes(query) ||
          e.instructor.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [enrollments, statusFilter, semesterFilter, searchQuery]);

  const statusCounts = useMemo(() => {
    return {
      PENDING_INSTRUCTOR: enrollments.filter(e => e.status === 'PENDING_INSTRUCTOR').length,
      ENROLLED: enrollments.filter(e => e.status === 'ENROLLED').length,
      COMPLETED: enrollments.filter(e => e.status === 'COMPLETED').length,
      DROPPED: enrollments.filter(e => e.status === 'DROPPED').length,
      REJECTED: enrollments.filter(e => e.status === 'REJECTED').length,
      AUDIT: enrollments.filter(e => e.status === 'AUDIT').length,
    };
  }, [enrollments]);

  const handleDrop = async (enrollmentId: string) => {
    try {
      setActionInProgress(true);
      await studentApi.dropEnrollment(enrollmentId);
      toast.success('Successfully dropped enrollment');
      await fetchEnrollments();
      setDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to drop enrollment:', err);
      toast.error(err.response?.data?.message || 'Failed to drop enrollment');
    } finally {
      setActionInProgress(false);
    }
  };

  const handleAudit = async (enrollmentId: string) => {
    try {
      setActionInProgress(true);
      await studentApi.auditEnrollment(enrollmentId);
      toast.success('Successfully switched to audit');
      await fetchEnrollments();
      setDialogOpen(false);
    } catch (err: any) {
      console.error('Failed to audit enrollment:', err);
      toast.error(err.response?.data?.message || 'Failed to switch to audit');
    } finally {
      setActionInProgress(false);
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'PENDING_INSTRUCTOR':
        return 'warning';
      case 'ENROLLED':
        return 'success';
      case 'COMPLETED':
        return 'info';
      case 'DROPPED':
        return 'default';
      case 'REJECTED':
        return 'error';
      case 'AUDIT':
        return 'primary';
      default:
        return 'default';
    }
  };

  const canDropOrAudit = (enrollment: EnrollmentDisplay): boolean => {
    return enrollment.status === 'ENROLLED' || enrollment.status === 'PENDING_INSTRUCTOR';
  };

  const openDetailsDialog = (enrollment: EnrollmentDisplay) => {
    setSelectedEnrollment(enrollment);
    setDialogOpen(true);
  };

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <DashboardLayout pageTitle="My Enrollments">
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              My Enrollments
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              View and manage all your course enrollments across semesters.
            </Typography>
          </Box>

          {/* Status Overview Cards */}
          {!loading && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ backgroundColor: '#fff3e0', border: '1px solid #ffb74d' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#f57c00' }}>
                      {statusCounts.PENDING_INSTRUCTOR}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#f57c00' }}>
                      Pending
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ backgroundColor: '#e8f5e9', border: '1px solid #81c784' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#388e3c' }}>
                      {statusCounts.ENROLLED}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#388e3c' }}>
                      Enrolled
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ backgroundColor: '#e3f2fd', border: '1px solid #64b5f6' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      {statusCounts.COMPLETED}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#1976d2' }}>
                      Completed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ backgroundColor: '#ede7f6', border: '1px solid #9575cd' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#5e35b1' }}>
                      {statusCounts.AUDIT}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#5e35b1' }}>
                      Audit
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ backgroundColor: '#f5f5f5', border: '1px solid #bdbdbd' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#616161' }}>
                      {statusCounts.DROPPED}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#616161' }}>
                      Dropped
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <Card sx={{ backgroundColor: '#ffebee', border: '1px solid #e57373' }}>
                  <CardContent sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#d32f2f' }}>
                      {statusCounts.REJECTED}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#d32f2f' }}>
                      Rejected
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}

          {/* Filters */}
          <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search by course code, name, or instructor..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#999' }} />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value)}>
                      <MenuItem value="ALL">All Statuses</MenuItem>
                      <MenuItem value="PENDING_INSTRUCTOR">Pending</MenuItem>
                      <MenuItem value="ENROLLED">Enrolled</MenuItem>
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                      <MenuItem value="AUDIT">Audit</MenuItem>
                      <MenuItem value="DROPPED">Dropped</MenuItem>
                      <MenuItem value="REJECTED">Rejected</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Semester</InputLabel>
                    <Select value={semesterFilter} label="Semester" onChange={(e) => setSemesterFilter(e.target.value)}>
                      <MenuItem value="ALL">All Semesters</MenuItem>
                      {semesters.map((sem) => (
                        <MenuItem key={sem} value={sem}>
                          {sem}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Enrollments Table */}
          {loading ? (
            <LoadingSkeleton type="table" count={5} />
          ) : filteredEnrollments.length === 0 ? (
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#999' }}>
                  No enrollments found matching your filters.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <Box sx={{ overflowX: 'auto' }}>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                      <TableCell sx={{ fontWeight: 600 }} align="center">
                        Credits
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Semester</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Time Slot</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredEnrollments.map((enrollment) => (
                      <TableRow key={enrollment.id} hover>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {enrollment.courseCode}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {enrollment.courseName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{enrollment.credits}</TableCell>
                        <TableCell>{enrollment.instructor}</TableCell>
                        <TableCell>{enrollment.semester}</TableCell>
                        <TableCell>{enrollment.timeSlot}</TableCell>
                        <TableCell>
                          <Chip
                            label={enrollment.status.replace('_', ' ')}
                            color={getStatusColor(enrollment.status)}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={enrollment.enrollmentType.replace('_', ' ')}
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {enrollment.grade ? (
                            <Chip label={enrollment.grade} color="success" size="small" />
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<InfoIcon />}
                              onClick={() => openDetailsDialog(enrollment)}
                            >
                              Details
                            </Button>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Card>
          )}

          {/* Details Dialog */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Enrollment Details</DialogTitle>
            <DialogContent>
              {selectedEnrollment && (
                <Box sx={{ pt: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Course
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {selectedEnrollment.courseCode} - {selectedEnrollment.courseName}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Credits
                      </Typography>
                      <Typography variant="body1">{selectedEnrollment.credits}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Time Slot
                      </Typography>
                      <Typography variant="body1">{selectedEnrollment.timeSlot}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Instructor
                      </Typography>
                      <Typography variant="body1">{selectedEnrollment.instructor}</Typography>
                      <Typography variant="caption" color="textSecondary">
                        {selectedEnrollment.instructorEmail}
                      </Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Semester
                      </Typography>
                      <Typography variant="body1">{selectedEnrollment.semester}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Status
                      </Typography>
                      <Chip
                        label={selectedEnrollment.status.replace('_', ' ')}
                        color={getStatusColor(selectedEnrollment.status)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Enrollment Type
                      </Typography>
                      <Typography variant="body1">{selectedEnrollment.enrollmentType.replace('_', ' ')}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Source
                      </Typography>
                      <Typography variant="body1">{selectedEnrollment.source.replace('_', ' ')}</Typography>
                    </Grid>
                    {selectedEnrollment.grade && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Grade
                        </Typography>
                        <Chip label={selectedEnrollment.grade} color="success" size="small" />
                      </Grid>
                    )}
                    <Grid item xs={6}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Enrolled On
                      </Typography>
                      <Typography variant="body2">
                        {format(new Date(selectedEnrollment.createdAt), 'MMM dd, yyyy')}
                      </Typography>
                    </Grid>
                    {selectedEnrollment.approvedAt && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Approved On
                        </Typography>
                        <Typography variant="body2">
                          {format(new Date(selectedEnrollment.approvedAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Grid>
                    )}
                    {selectedEnrollment.completedAt && (
                      <Grid item xs={6}>
                        <Typography variant="subtitle2" color="textSecondary">
                          Completed On
                        </Typography>
                        <Typography variant="body2">
                          {format(new Date(selectedEnrollment.completedAt), 'MMM dd, yyyy')}
                        </Typography>
                      </Grid>
                    )}
                  </Grid>

                  {canDropOrAudit(selectedEnrollment) && (
                    <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid #e0e0e0' }}>
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Available Actions
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2 }}>
                        <Button
                          variant="outlined"
                          color="error"
                          onClick={() => handleDrop(selectedEnrollment.id)}
                          disabled={actionInProgress}
                        >
                          Drop Enrollment
                        </Button>
                        <Button
                          variant="outlined"
                          color="warning"
                          onClick={() => handleAudit(selectedEnrollment.id)}
                          disabled={actionInProgress}
                        >
                          Switch to Audit
                        </Button>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Close</Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentEnrollmentsPage;
