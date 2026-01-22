'use client';

import React, { useEffect, useState } from 'react';
import {
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
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Chip,
  TextField,
  InputAdornment,
  Grid,
  IconButton,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import instructorApi, { CourseOffering, Enrollment } from '@/lib/api/instructorApi';
import { toast } from 'sonner';

// Icons
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import PeopleIcon from '@mui/icons-material/People';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import ClearIcon from '@mui/icons-material/Clear';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`enrollments-tabpanel-${index}`}
      aria-labelledby={`enrollments-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const InstructorEnrollments = () => {
  const [loading, setLoading] = useState(true);
  const [tabValue, setTabValue] = useState(0);
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([]);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<string>('all');
  const [offeringEnrollments, setOfferingEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    type: 'approve' | 'reject' | null;
    enrollment: Enrollment | null;
  }>({ open: false, type: null, enrollment: null });
  const [actionLoading, setActionLoading] = useState(false);

  // Filters for Pending Requests Tab
  const [pendingTypeFilter, setPendingTypeFilter] = useState<string>('ALL');
  const [pendingCourseFilter, setPendingCourseFilter] = useState<string>('ALL');
  const [pendingSearchQuery, setPendingSearchQuery] = useState<string>('');

  // Filters for All Enrollments Tab
  const [enrollmentTypeFilter, setEnrollmentTypeFilter] = useState<string>('ALL');
  const [enrollmentStatusFilter, setEnrollmentStatusFilter] = useState<string>('ALL');
  const [enrollmentSearchQuery, setEnrollmentSearchQuery] = useState<string>('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [pendingData, offeringsData] = await Promise.all([
        instructorApi.getPendingEnrollments(),
        instructorApi.getCourseOfferings(),
      ]);

      setPendingEnrollments(pendingData);
      setOfferings(offeringsData.filter(o => o.status === 'ENROLLING' || o.status === 'COMPLETED'));
    } catch (error: any) {
      console.error('Failed to fetch enrollments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch enrollments');
    } finally {
      setLoading(false);
    }
  };

  const fetchOfferingEnrollments = async (offeringId: string) => {
    try {
      setLoadingEnrollments(true);
      const data = await instructorApi.getEnrollmentsList(offeringId);
      setOfferingEnrollments(data);
    } catch (error: any) {
      console.error('Failed to fetch offering enrollments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch enrollments');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedOffering && selectedOffering !== 'all') {
      fetchOfferingEnrollments(selectedOffering);
    } else {
      setOfferingEnrollments([]);
    }
  }, [selectedOffering]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenConfirmDialog = (type: 'approve' | 'reject', enrollment: Enrollment) => {
    setConfirmDialog({
      open: true,
      type,
      enrollment,
    });
  };

  const handleCloseConfirmDialog = () => {
    setConfirmDialog({ open: false, type: null, enrollment: null });
  };

  const handleApprove = async () => {
    if (!confirmDialog.enrollment) return;

    try {
      setActionLoading(true);
      await instructorApi.approveEnrollment(confirmDialog.enrollment.id);
      toast.success('Enrollment approved successfully');
      handleCloseConfirmDialog();
      fetchData();
      if (selectedOffering && selectedOffering !== 'all') {
        fetchOfferingEnrollments(selectedOffering);
      }
    } catch (error: any) {
      console.error('Failed to approve enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to approve enrollment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!confirmDialog.enrollment) return;

    try {
      setActionLoading(true);
      await instructorApi.rejectEnrollment(confirmDialog.enrollment.id);
      toast.success('Enrollment rejected successfully');
      handleCloseConfirmDialog();
      fetchData();
      if (selectedOffering && selectedOffering !== 'all') {
        fetchOfferingEnrollments(selectedOffering);
      }
    } catch (error: any) {
      console.error('Failed to reject enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to reject enrollment');
    } finally {
      setActionLoading(false);
    }
  };

  const getEnrollmentTypeColor = (type: string) => {
    switch (type) {
      case 'CREDIT':
        return 'success';
      case 'AUDIT':
        return 'info';
      default:
        return 'default';
    }
  };

  // Filter pending enrollments
  const filteredPendingEnrollments = pendingEnrollments.filter((enrollment) => {
    // Type filter
    if (pendingTypeFilter !== 'ALL' && enrollment.enrollmentType !== pendingTypeFilter) {
      return false;
    }

    // Course filter
    if (pendingCourseFilter !== 'ALL' && enrollment.courseOfferingId !== pendingCourseFilter) {
      return false;
    }

    // Search filter (by student name or entry number)
    if (pendingSearchQuery) {
      const query = pendingSearchQuery.toLowerCase();
      const matchesName = enrollment.student.name.toLowerCase().includes(query);
      const matchesEntry = enrollment.student.entryNumber?.toLowerCase().includes(query);
      const matchesEmail = enrollment.student.email.toLowerCase().includes(query);
      if (!matchesName && !matchesEntry && !matchesEmail) {
        return false;
      }
    }

    return true;
  });

  // Filter offering enrollments
  const filteredOfferingEnrollments = offeringEnrollments.filter((enrollment) => {
    // Type filter
    if (enrollmentTypeFilter !== 'ALL' && enrollment.enrollmentType !== enrollmentTypeFilter) {
      return false;
    }

    // Status filter
    if (enrollmentStatusFilter !== 'ALL' && enrollment.status !== enrollmentStatusFilter) {
      return false;
    }

    // Search filter (by student name or entry number)
    if (enrollmentSearchQuery) {
      const query = enrollmentSearchQuery.toLowerCase();
      const matchesName = enrollment.student.name.toLowerCase().includes(query);
      const matchesEntry = enrollment.student.entryNumber?.toLowerCase().includes(query);
      const matchesEmail = enrollment.student.email.toLowerCase().includes(query);
      if (!matchesName && !matchesEntry && !matchesEmail) {
        return false;
      }
    }

    return true;
  });

  // Get unique course offerings from pending enrollments
  const pendingCourseOfferings = Array.from(
    new Set(pendingEnrollments.map(e => e.courseOfferingId))
  ).map(id => {
    const enrollment = pendingEnrollments.find(e => e.courseOfferingId === id);
    return {
      id,
      label: enrollment?.courseOffering 
        ? `${enrollment.courseOffering.course.code} - ${enrollment.courseOffering.course.name}`
        : 'Unknown Course'
    };
  });

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="Enrollment Management">
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Enrollment Management
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Review and manage student enrollment requests for your courses
            </Typography>
          </Box>

          {/* Tabs */}
          <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              sx={{
                borderBottom: '1px solid #e0e0e0',
                '& .MuiTab-root': {
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: 600,
                },
                '& .Mui-selected': {
                  color: '#8B3A3A',
                },
                '& .MuiTabs-indicator': {
                  backgroundColor: '#8B3A3A',
                },
              }}
            >
              <Tab
                icon={<HourglassEmptyIcon />}
                iconPosition="start"
                label={`Pending Requests (${filteredPendingEnrollments.length}${filteredPendingEnrollments.length !== pendingEnrollments.length ? `/${pendingEnrollments.length}` : ''})`}
              />
              <Tab
                icon={<PeopleIcon />}
                iconPosition="start"
                label="All Enrollments by Course"
              />
            </Tabs>

            {/* Tab Panel 0: Pending Requests */}
            <TabPanel value={tabValue} index={0}>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton type="table" count={5} />
                ) : (
                  <>
                    {/* Filters Section */}
                    <Box sx={{ mb: 3 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                        <FilterListIcon sx={{ color: '#666' }} />
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          Filters
                        </Typography>
                        {(pendingTypeFilter !== 'ALL' || pendingCourseFilter !== 'ALL' || pendingSearchQuery) && (
                          <Button
                            size="small"
                            startIcon={<ClearIcon />}
                            onClick={() => {
                              setPendingTypeFilter('ALL');
                              setPendingCourseFilter('ALL');
                              setPendingSearchQuery('');
                            }}
                            sx={{ ml: 'auto', textTransform: 'none' }}
                          >
                            Clear All
                          </Button>
                        )}
                      </Box>

                      <Grid container spacing={2}>
                        {/* Search Field */}
                        <Grid item xs={12} md={4}>
                          <TextField
                            fullWidth
                            size="small"
                            placeholder="Search by name, entry number, or email..."
                            value={pendingSearchQuery}
                            onChange={(e) => setPendingSearchQuery(e.target.value)}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <SearchIcon sx={{ color: '#666' }} />
                                </InputAdornment>
                              ),
                              endAdornment: pendingSearchQuery && (
                                <InputAdornment position="end">
                                  <IconButton
                                    size="small"
                                    onClick={() => setPendingSearchQuery('')}
                                  >
                                    <ClearIcon fontSize="small" />
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>

                        {/* Enrollment Type Filter */}
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Enrollment Type</InputLabel>
                            <Select
                              value={pendingTypeFilter}
                              label="Enrollment Type"
                              onChange={(e) => setPendingTypeFilter(e.target.value)}
                            >
                              <MenuItem value="ALL">All Types</MenuItem>
                              <MenuItem value="CREDIT">Credit</MenuItem>
                              <MenuItem value="AUDIT">Audit</MenuItem>
                            </Select>
                          </FormControl>
                        </Grid>

                        {/* Course Filter */}
                        <Grid item xs={12} sm={6} md={4}>
                          <FormControl fullWidth size="small">
                            <InputLabel>Course</InputLabel>
                            <Select
                              value={pendingCourseFilter}
                              label="Course"
                              onChange={(e) => setPendingCourseFilter(e.target.value)}
                            >
                              <MenuItem value="ALL">All Courses</MenuItem>
                              {pendingCourseOfferings.map((course) => (
                                <MenuItem key={course.id} value={course.id}>
                                  {course.label}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Grid>
                      </Grid>

                      {/* Results Count */}
                      <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Showing <strong>{filteredPendingEnrollments.length}</strong> of{' '}
                          <strong>{pendingEnrollments.length}</strong> pending requests
                        </Typography>
                      </Box>
                    </Box>

                    {/* Enrollments Table */}
                    {filteredPendingEnrollments.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <HourglassEmptyIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                          {pendingEnrollments.length === 0 ? 'No Pending Requests' : 'No Matching Requests'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          {pendingEnrollments.length === 0 
                            ? 'All enrollment requests have been processed'
                            : 'Try adjusting your filters to see more results'}
                        </Typography>
                      </Box>
                    ) : (
                  <Box sx={{ overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Entry Number</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Enrollment Type</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Actions</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredPendingEnrollments.map((enrollment) => (
                          <TableRow
                            key={enrollment.id}
                            sx={{
                              '&:hover': { backgroundColor: '#f9f9f9' },
                            }}
                          >
                            <TableCell>{enrollment.student.name}</TableCell>
                            <TableCell>{enrollment.student.entryNumber || 'N/A'}</TableCell>
                            <TableCell>{enrollment.student.email}</TableCell>
                            <TableCell>
                              {enrollment.courseOffering 
                                ? `${enrollment.courseOffering.course.code} - ${enrollment.courseOffering.course.name}`
                                : 'N/A'}
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={enrollment.enrollmentType}
                                size="small"
                                color={getEnrollmentTypeColor(enrollment.enrollmentType) as any}
                                sx={{ fontWeight: 600 }}
                              />
                            </TableCell>
                            <TableCell>
                              <StatusChip status={enrollment.status as any} size="small" />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<CheckCircleIcon />}
                                  sx={{
                                    backgroundColor: '#4caf50',
                                    '&:hover': { backgroundColor: '#388e3c' },
                                    textTransform: 'none',
                                  }}
                                  onClick={() => handleOpenConfirmDialog('approve', enrollment)}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="small"
                                  variant="outlined"
                                  startIcon={<CancelIcon />}
                                  sx={{
                                    borderColor: '#f44336',
                                    color: '#f44336',
                                    textTransform: 'none',
                                    '&:hover': {
                                      borderColor: '#d32f2f',
                                      backgroundColor: 'rgba(244, 67, 54, 0.04)',
                                    },
                                  }}
                                  onClick={() => handleOpenConfirmDialog('reject', enrollment)}
                                >
                                  Reject
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>
                    )}
                  </>
                )}
              </CardContent>
            </TabPanel>

            {/* Tab Panel 1: All Enrollments by Course */}
            <TabPanel value={tabValue} index={1}>
              <CardContent>
                {loading ? (
                  <LoadingSkeleton type="card" count={1} />
                ) : (
                  <>
                    {/* Course Filter */}
                    <Box sx={{ mb: 3 }}>
                      <FormControl fullWidth>
                        <InputLabel>Select Course Offering</InputLabel>
                        <Select
                          value={selectedOffering}
                          label="Select Course Offering"
                          onChange={(e) => setSelectedOffering(e.target.value)}
                        >
                          <MenuItem value="all">Select a course to view enrollments</MenuItem>
                          {offerings.map((offering) => (
                            <MenuItem key={offering.id} value={offering.id}>
                              {offering.course.code} - {offering.course.name} ({offering.semester})
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Box>

                    {/* Enrollments Table */}
                    {selectedOffering === 'all' ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <PeopleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                          Select a Course Offering
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          Choose a course from the dropdown to view its enrollments
                        </Typography>
                      </Box>
                    ) : loadingEnrollments ? (
                      <LoadingSkeleton type="table" count={5} />
                    ) : offeringEnrollments.length === 0 ? (
                      <Box sx={{ textAlign: 'center', py: 6 }}>
                        <PeopleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                        <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                          No Enrollments Yet
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#999' }}>
                          This course has no student enrollments
                        </Typography>
                      </Box>
                    ) : (
                      <>
                        {/* Filters Section */}
                        <Box sx={{ mb: 3 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <FilterListIcon sx={{ color: '#666' }} />
                            <Typography variant="h6" sx={{ fontWeight: 600 }}>
                              Filters
                            </Typography>
                            {(enrollmentTypeFilter !== 'ALL' || enrollmentStatusFilter !== 'ALL' || enrollmentSearchQuery) && (
                              <Button
                                size="small"
                                startIcon={<ClearIcon />}
                                onClick={() => {
                                  setEnrollmentTypeFilter('ALL');
                                  setEnrollmentStatusFilter('ALL');
                                  setEnrollmentSearchQuery('');
                                }}
                                sx={{ ml: 'auto', textTransform: 'none' }}
                              >
                                Clear All
                              </Button>
                            )}
                          </Box>

                          <Grid container spacing={2}>
                            {/* Search Field */}
                            <Grid item xs={12} md={4}>
                              <TextField
                                fullWidth
                                size="small"
                                placeholder="Search by name, entry number, or email..."
                                value={enrollmentSearchQuery}
                                onChange={(e) => setEnrollmentSearchQuery(e.target.value)}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <SearchIcon sx={{ color: '#666' }} />
                                    </InputAdornment>
                                  ),
                                  endAdornment: enrollmentSearchQuery && (
                                    <InputAdornment position="end">
                                      <IconButton
                                        size="small"
                                        onClick={() => setEnrollmentSearchQuery('')}
                                      >
                                        <ClearIcon fontSize="small" />
                                      </IconButton>
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>

                            {/* Enrollment Type Filter */}
                            <Grid item xs={12} sm={6} md={4}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Enrollment Type</InputLabel>
                                <Select
                                  value={enrollmentTypeFilter}
                                  label="Enrollment Type"
                                  onChange={(e) => setEnrollmentTypeFilter(e.target.value)}
                                >
                                  <MenuItem value="ALL">All Types</MenuItem>
                                  <MenuItem value="CREDIT">Credit</MenuItem>
                                  <MenuItem value="AUDIT">Audit</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>

                            {/* Status Filter */}
                            <Grid item xs={12} sm={6} md={4}>
                              <FormControl fullWidth size="small">
                                <InputLabel>Status</InputLabel>
                                <Select
                                  value={enrollmentStatusFilter}
                                  label="Status"
                                  onChange={(e) => setEnrollmentStatusFilter(e.target.value)}
                                >
                                  <MenuItem value="ALL">All Statuses</MenuItem>
                                  <MenuItem value="PENDING">Pending</MenuItem>
                                  <MenuItem value="APPROVED">Approved</MenuItem>
                                  <MenuItem value="REJECTED">Rejected</MenuItem>
                                  <MenuItem value="DROPPED">Dropped</MenuItem>
                                </Select>
                              </FormControl>
                            </Grid>
                          </Grid>

                          {/* Results Count */}
                          <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Showing <strong>{filteredOfferingEnrollments.length}</strong> of{' '}
                              <strong>{offeringEnrollments.length}</strong> enrollments
                            </Typography>
                          </Box>
                        </Box>

                        {/* Summary Stats */}
                        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                          <Card sx={{ flex: 1, minWidth: 200, border: '1px solid #e0e0e0' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                                {filteredOfferingEnrollments.length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                Filtered Enrollments
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card sx={{ flex: 1, minWidth: 200, border: '1px solid #e0e0e0' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                                {filteredOfferingEnrollments.filter(e => e.enrollmentType === 'CREDIT').length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                Credit Enrollments
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card sx={{ flex: 1, minWidth: 200, border: '1px solid #e0e0e0' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#2196f3' }}>
                                {filteredOfferingEnrollments.filter(e => e.enrollmentType === 'AUDIT').length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                Audit Enrollments
                              </Typography>
                            </CardContent>
                          </Card>
                          <Card sx={{ flex: 1, minWidth: 200, border: '1px solid #e0e0e0' }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                              <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                                {filteredOfferingEnrollments.filter(e => e.status === 'APPROVED').length}
                              </Typography>
                              <Typography variant="body2" sx={{ color: '#666' }}>
                                Approved
                              </Typography>
                            </CardContent>
                          </Card>
                        </Box>

                        {/* Enrollments Table */}
                        {filteredOfferingEnrollments.length === 0 ? (
                          <Box sx={{ textAlign: 'center', py: 6 }}>
                            <PeopleIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                            <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                              No Matching Enrollments
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#999' }}>
                              Try adjusting your filters to see more results
                            </Typography>
                          </Box>
                        ) : (
                        <Box sx={{ overflowX: 'auto' }}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Entry Number</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredOfferingEnrollments.map((enrollment) => (
                                <TableRow
                                  key={enrollment.id}
                                  sx={{
                                    '&:hover': { backgroundColor: '#f9f9f9' },
                                  }}
                                >
                                  <TableCell>{enrollment.student.name}</TableCell>
                                  <TableCell>{enrollment.student.entryNumber || 'N/A'}</TableCell>
                                  <TableCell>{enrollment.student.email}</TableCell>
                                  <TableCell>
                                    <Chip
                                      label={enrollment.enrollmentType}
                                      size="small"
                                      color={getEnrollmentTypeColor(enrollment.enrollmentType) as any}
                                      sx={{ fontWeight: 600 }}
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <StatusChip status={enrollment.status as any} size="small" />
                                  </TableCell>
                                  <TableCell>
                                    {enrollment.grade ? (
                                      <Chip
                                        label={enrollment.grade.replace('_MINUS', '-')}
                                        size="small"
                                        sx={{
                                          fontWeight: 700,
                                          backgroundColor: '#4caf50',
                                          color: 'white',
                                        }}
                                      />
                                    ) : (
                                      <Typography variant="caption" sx={{ color: '#999' }}>
                                        Not graded
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                        )}
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </TabPanel>
          </Card>
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog.open}
          onClose={handleCloseConfirmDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {confirmDialog.type === 'approve' ? 'Approve Enrollment' : 'Reject Enrollment'}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Alert severity={confirmDialog.type === 'approve' ? 'success' : 'error'} sx={{ mb: 2 }}>
              {confirmDialog.type === 'approve'
                ? 'This will approve the student enrollment request.'
                : 'This will reject the student enrollment request.'}
            </Alert>
            {confirmDialog.enrollment && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Student:</strong> {confirmDialog.enrollment.student.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Email:</strong> {confirmDialog.enrollment.student.email}
                </Typography>
                <Typography variant="body2">
                  <strong>Type:</strong> {confirmDialog.enrollment.enrollmentType}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseConfirmDialog} sx={{ color: '#666' }} disabled={actionLoading}>
              Cancel
            </Button>
            <Button
              onClick={confirmDialog.type === 'approve' ? handleApprove : handleReject}
              variant="contained"
              sx={{
                backgroundColor: confirmDialog.type === 'approve' ? '#4caf50' : '#f44336',
                '&:hover': {
                  backgroundColor: confirmDialog.type === 'approve' ? '#388e3c' : '#d32f2f',
                },
              }}
              disabled={actionLoading}
            >
              {actionLoading ? 'Processing...' : confirmDialog.type === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorEnrollments;
