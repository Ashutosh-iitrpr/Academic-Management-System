'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
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
  CircularProgress,
  Alert,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  FormControlLabel,
  Radio,
  IconButton,
  Tooltip,
  Divider,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import StatusChip from '@/components/ui/StatusChip';
import studentApi from '@/lib/api/studentApi';
import { toast } from 'sonner';
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Pie, PieChart, Cell } from 'recharts';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import InsightsIcon from '@mui/icons-material/Insights';

interface CourseOfferingDisplay {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  instructor: string;
  timeSlot: string;
  semester: string;
  status: 'FLOATED' | 'ENROLLING' | 'COMPLETED';
  branches: string[];
  enrolled: boolean;
  enrollmentId?: string;
  canEnroll: boolean;
}

interface EnrollmentRecord {
  id: string;
  courseOfferingId: string;
  status: string;
  courseOffering?: {
    id: string;
    course: {
      code: string;
    };
  };
}

interface GradeSlice {
  grade: string;
  count: number;
  percentage: number;
}

const StudentOfferingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<CourseOfferingDisplay[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FLOATED' | 'ENROLLING' | 'COMPLETED'>('ALL');
  const [enrollmentInProgress, setEnrollmentInProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [enrollmentTypeDialogOpen, setEnrollmentTypeDialogOpen] = useState(false);
  const [selectedOfferingForEnrollment, setSelectedOfferingForEnrollment] = useState<CourseOfferingDisplay | null>(null);
  const [selectedEnrollmentType, setSelectedEnrollmentType] = useState<'CREDIT' | 'CREDIT_CONCENTRATION' | 'CREDIT_MINOR'>('CREDIT');
  const [gradeDialogOpen, setGradeDialogOpen] = useState(false);
  const [selectedOfferingForGrades, setSelectedOfferingForGrades] = useState<CourseOfferingDisplay | null>(null);
  const [gradeDistribution, setGradeDistribution] = useState<GradeSlice[]>([]);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  const [gradeStatsLoading, setGradeStatsLoading] = useState(false);

  useEffect(() => {
    const fetchOfferings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch available offerings
        const offeringsData = await studentApi.getAvailableOfferings();
        
        // Fetch student record to get current enrollments
        const recordData = await studentApi.getStudentRecord();
        const enrolledCourses = new Set<string>();
        const enrollmentMap: Record<string, string> = {};
        
        Object.values(recordData.semesterWiseEnrollments || {}).forEach((semester: any) => {
          [...(semester.ongoing || []), ...(semester.completed || [])].forEach((course: any) => {
            enrolledCourses.add(course.courseCode);
          });
        });

        // Also get enrollments data
        recordData.enrollments?.forEach((enrollment: EnrollmentRecord) => {
          if (enrollment.courseOffering?.course?.code) {
            enrollmentMap[enrollment.courseOffering.course.code] = enrollment.id;
          }
        });

        // Transform offerings
        const displayOfferings: CourseOfferingDisplay[] = offeringsData.map((offering: any) => {
          // Determine status based on offering status
          let offeringStatus: 'FLOATED' | 'ENROLLING' | 'COMPLETED' = 'ENROLLING';
          if (offering.status === 'COMPLETED') {
            offeringStatus = 'COMPLETED';
          } else if (offering.status === 'FLOATED') {
            offeringStatus = 'FLOATED';
          }

          const isEnrolled = enrolledCourses.has(offering.course.code);
          const isBranchAllowed = offering.allowedBranches.includes(user?.branch || '');
          const canEnroll = !isEnrolled && isBranchAllowed;

          return {
            id: offering.id,
            courseCode: offering.course.code,
            courseName: offering.course.name,
            credits: offering.course.credits,
            instructor: offering.instructor.name,
            timeSlot: offering.timeSlot,
            semester: offering.semester || 'Current',
            status: offeringStatus,
            branches: offering.allowedBranches,
            enrolled: isEnrolled,
            enrollmentId: enrollmentMap[offering.course.code],
            canEnroll: canEnroll,
          };
        });

        setOfferings(displayOfferings);
      } catch (err: any) {
        console.error('Failed to fetch offerings:', err);
        setError(err.response?.data?.message || 'Failed to load course offerings');
        toast.error('Failed to load course offerings');
      } finally {
        setLoading(false);
      }
    };

    fetchOfferings();
  }, []);

  // Filter offerings
  const filteredOfferings = useMemo(() => {
    let filtered = offerings;

    // Filter by status
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((o) => o.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.courseCode.toLowerCase().includes(query) ||
          o.courseName.toLowerCase().includes(query) ||
          o.instructor.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [offerings, statusFilter, searchQuery]);

  const handleEnrollClick = (offering: CourseOfferingDisplay) => {
    setSelectedOfferingForEnrollment(offering);
    setSelectedEnrollmentType('CREDIT');
    setEnrollmentTypeDialogOpen(true);
  };

  const openGradeDistribution = async (offering: CourseOfferingDisplay) => {
    setSelectedOfferingForGrades(offering);
    setGradeDialogOpen(true);
    setGradeStatsLoading(true);
    try {
      const data = await studentApi.getGradeDistribution(offering.id);
      setGradeDistribution(data.distribution);
      setTotalEnrollments(data.total);
    } catch (err: any) {
      console.error('Failed to load grade distribution', err);
      toast.error(err?.response?.data?.message || 'Could not load grade distribution');
      setGradeDialogOpen(false);
    } finally {
      setGradeStatsLoading(false);
    }
  };

  const handleEnrollmentTypeConfirm = async () => {
    if (!selectedOfferingForEnrollment) return;
    
    try {
      setEnrollmentInProgress(true);
      await studentApi.requestEnrollment(selectedOfferingForEnrollment.id, selectedEnrollmentType);
      toast.success(`Successfully enrolled in ${selectedOfferingForEnrollment.courseName} as ${selectedEnrollmentType.replace('CREDIT_', '').replace('CREDIT', 'Credit')}`);
      setEnrollmentTypeDialogOpen(false);
      // Refresh the data
      const offeringsData = await studentApi.getAvailableOfferings();
      const recordData = await studentApi.getStudentRecord();
      
      const enrolledCourses = new Set<string>();
      Object.values(recordData.semesterWiseEnrollments || {}).forEach((semester: any) => {
        [...(semester.ongoing || []), ...(semester.completed || [])].forEach((course: any) => {
          enrolledCourses.add(course.courseCode);
        });
      });

      const displayOfferings: CourseOfferingDisplay[] = offeringsData.map((offering: any) => {
        let offeringStatus: 'FLOATED' | 'ENROLLING' | 'COMPLETED' = 'ENROLLING';
        if (offering.status === 'COMPLETED') {
          offeringStatus = 'COMPLETED';
        } else if (offering.status === 'FLOATED') {
          offeringStatus = 'FLOATED';
        }

        const isEnrolled = enrolledCourses.has(offering.course.code);
        const isBranchAllowed = offering.allowedBranches.includes(user?.branch || '');
        const canEnroll = !isEnrolled && isBranchAllowed;

        return {
          id: offering.id,
          courseCode: offering.course.code,
          courseName: offering.course.name,
          credits: offering.course.credits,
          instructor: offering.instructor.name,
          timeSlot: offering.timeSlot,
          semester: offering.semester || 'Current',
          status: offeringStatus,
          branches: offering.allowedBranches,
          enrolled: isEnrolled,
          canEnroll: canEnroll,
        };
      });

      setOfferings(displayOfferings);
    } catch (err: any) {
      console.error('Failed to enroll:', err);
      toast.error(err.response?.data?.message || 'Failed to enroll in course');
    } finally {
      setEnrollmentInProgress(false);
    }
  };

  const getStatusColor = (status: string): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'FLOATED':
        return 'info';
      case 'ENROLLING':
        return 'success';
      case 'COMPLETED':
        return 'default';
      default:
        return 'default';
    }
  };

  const statusCounts = {
    FLOATED: offerings.filter((o) => o.status === 'FLOATED').length,
    ENROLLING: offerings.filter((o) => o.status === 'ENROLLING').length,
    COMPLETED: offerings.filter((o) => o.status === 'COMPLETED').length,
  };

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <DashboardLayout pageTitle="Course Offerings">
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
              Available Course Offerings
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Browse and enroll in courses offered this semester. Filter by status to find courses that match your needs.
            </Typography>
          </Box>

          {/* Status Overview Cards */}
          {!loading && (
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e3f2fd', border: '1px solid #90caf9' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                      {statusCounts.FLOATED}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#1976d2' }}>
                      Floated
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#e8f5e9', border: '1px solid #81c784' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#388e3c' }}>
                      {statusCounts.ENROLLING}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#388e3c' }}>
                      Enrolling
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#f5f5f5', border: '1px solid #bdbdbd' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#616161' }}>
                      {statusCounts.COMPLETED}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#616161' }}>
                      Completed
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ backgroundColor: '#fce4ec', border: '1px solid #f48fb1' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h5" sx={{ fontWeight: 700, color: '#c2185b' }}>
                      {offerings.length}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#c2185b' }}>
                      Total
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
                <Grid item xs={12} sm={6}>
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
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={(e) => setStatusFilter(e.target.value as any)}>
                      <MenuItem value="ALL">All Statuses</MenuItem>
                      <MenuItem value="FLOATED">Floated</MenuItem>
                      <MenuItem value="ENROLLING">Enrolling</MenuItem>
                      <MenuItem value="COMPLETED">Completed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Offerings Table */}
          {loading ? (
            <LoadingSkeleton type="table" count={5} />
          ) : filteredOfferings.length === 0 ? (
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="body1" sx={{ color: '#999' }}>
                  No course offerings found matching your filters.
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
                      <TableCell sx={{ fontWeight: 600 }}>Time Slot</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Branches</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Enrollment</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Action</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredOfferings.map((offering) => (
                      <TableRow key={offering.id}>
                        <TableCell>
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                              {offering.courseCode}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {offering.courseName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell align="center">{offering.credits}</TableCell>
                        <TableCell>{offering.instructor}</TableCell>
                        <TableCell>{offering.timeSlot}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={offering.status}
                              color={getStatusColor(offering.status)}
                              size="small"
                              variant="outlined"
                            />
                            {offering.status === 'COMPLETED' && (
                              <Tooltip title="View grade distribution">
                                <span>
                                  <IconButton
                                    size="small"
                                    onClick={() => openGradeDistribution(offering)}
                                    disabled={gradeStatsLoading && selectedOfferingForGrades?.id === offering.id}
                                  >
                                    <InsightsIcon fontSize="small" />
                                  </IconButton>
                                </span>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                            {offering.branches.map((branch) => (
                              <Chip key={branch} label={branch} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={offering.enrolled ? 'Enrolled' : 'Not Enrolled'}
                            color={offering.enrolled ? 'success' : 'default'}
                            size="small"
                            variant={offering.enrolled ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="contained"
                            startIcon={<AddIcon />}
                            disabled={!offering.canEnroll || enrollmentInProgress}
                            onClick={() => handleEnrollClick(offering)}
                            sx={{
                              backgroundColor: offering.canEnroll ? '#4caf50' : '#cccccc',
                              color: offering.canEnroll ? 'white' : '#999999',
                              '&:hover': {
                                backgroundColor: offering.canEnroll ? '#388e3c' : '#cccccc',
                                cursor: offering.canEnroll ? 'pointer' : 'not-allowed',
                              },
                            }}
                            title={!offering.canEnroll ? (offering.enrolled ? 'Already enrolled' : 'Not available for your branch') : 'Enroll in this course'}
                          >
                            {enrollmentInProgress && offering.id ? (
                              <CircularProgress size={16} sx={{ mr: 1 }} />
                            ) : offering.enrolled ? (
                              'Already Enrolled'
                            ) : (
                              'Enroll'
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Card>
          )}

        {/* Grade Distribution Dialog */}
        <Dialog open={gradeDialogOpen} onClose={() => setGradeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <InsightsIcon sx={{ color: '#8B3A3A' }} />
            Grade Distribution
          </DialogTitle>
          <Divider />
          <DialogContent sx={{ pt: 3 }}>
            {selectedOfferingForGrades && (
              <>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedOfferingForGrades.courseCode} - {selectedOfferingForGrades.courseName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                  Instructor: {selectedOfferingForGrades.instructor}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666', fontWeight: 600, mb: 3 }}>
                  Total Students Enrolled: {totalEnrollments}
                </Typography>
              </>
            )}

            {gradeStatsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress />
              </Box>
            ) : gradeDistribution.length > 0 ? (
              <Box>
                {/* Pie Chart */}
                <Box sx={{ display: 'flex', justifyContent: 'center', mb: 4 }}>
                  <ChartContainer
                    config={{
                      count: { label: 'Count' },
                    }}
                    className="w-full"
                  >
                    <PieChart width={350} height={250} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Pie
                        data={gradeDistribution.filter((g) => g.count > 0).map((g) => ({
                          name: g.grade,
                          value: g.count,
                        }))}
                        cx={175}
                        cy={125}
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {[
                          '#2E7D32',
                          '#558B2F',
                          '#7CB342',
                          '#1976D2',
                          '#42A5F5',
                          '#FFA726',
                          '#F57C00',
                          '#D32F2F',
                          '#C62828',
                        ].map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ChartContainer>
                </Box>
              </Box>
            ) : (
              <Typography variant="body2" sx={{ color: '#999' }}>
                No grade distribution data available.
              </Typography>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setGradeDialogOpen(false)} variant="contained" sx={{ backgroundColor: '#8B3A3A' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Enrollment Type Selection Dialog */}
        <Dialog open={enrollmentTypeDialogOpen} onClose={() => setEnrollmentTypeDialogOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            Select Enrollment Type
          </DialogTitle>
          <DialogContent sx={{ pt: 3 }}>
            {selectedOfferingForEnrollment && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  {selectedOfferingForEnrollment.courseCode} - {selectedOfferingForEnrollment.courseName}
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Credits: {selectedOfferingForEnrollment.credits} | Instructor: {selectedOfferingForEnrollment.instructor}
                </Typography>
              </Box>
            )}

            <FormControl fullWidth>
              <RadioGroup
                value={selectedEnrollmentType}
                onChange={(e) => setSelectedEnrollmentType(e.target.value as any)}
              >
                <FormControlLabel
                  value="CREDIT"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Credit (Main Course)
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Regular course enrollment, counts towards credit limit and main GPA
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, alignItems: 'flex-start' }}
                />
                <FormControlLabel
                  value="CREDIT_CONCENTRATION"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Concentration Course
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Specialization course, separate GPA calculation, requires instructor approval
                      </Typography>
                    </Box>
                  }
                  sx={{ mb: 2, alignItems: 'flex-start' }}
                />
                <FormControlLabel
                  value="CREDIT_MINOR"
                  control={<Radio />}
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Minor Course
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#666' }}>
                        Minor specialization, separate GPA calculation, requires instructor approval
                      </Typography>
                    </Box>
                  }
                  sx={{ alignItems: 'flex-start' }}
                />
              </RadioGroup>
            </FormControl>

            <Alert severity="info" sx={{ mt: 3 }}>
              <Typography variant="body2">
                <strong>Note:</strong> You can choose either Concentration OR Minor, not both. Main courses don't count against this restriction.
              </Typography>
            </Alert>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEnrollmentTypeDialogOpen(false)} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button
              onClick={handleEnrollmentTypeConfirm}
              variant="contained"
              sx={{
                backgroundColor: '#8B3A3A',
                '&:hover': { backgroundColor: '#6B2A2A' },
              }}
              disabled={enrollmentInProgress}
            >
              {enrollmentInProgress ? <CircularProgress size={20} /> : 'Confirm Enrollment'}
            </Button>
          </DialogActions>
        </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentOfferingsPage;
