'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Box, Card, CardContent, Typography, Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, Chip, Dialog, DialogTitle, DialogContent, DialogActions, RadioGroup, FormControlLabel, Radio, FormControl, CircularProgress } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatCard from '@/components/ui/StatCard';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/lib/auth/AuthContext';
import studentApi from '@/lib/api/studentApi';
import { toast } from 'sonner';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';

interface DisplayEnrollment {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  credits: number;
  type: string;
  status: string;
  grade?: string;
}

interface CourseSummary {
  courseCode: string;
  courseName: string;
  credits: number;
  enrollmentType: string;
  status: string;
  grade?: string;
  instructor: string;
}

interface DisplayCourseOffering {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  instructor: string;
  timeSlot: string;
  branches: string[];
  enrolled: boolean;
  canEnroll: boolean;
}

interface AcademicStats {
  totalEnrollments: number;
  creditsEarned: number;
  mainGPA: number;
  concentrationGPA: number;
  minorGPA: number;
  cgpa: number;
  currentSemesterGPA: number;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrollments, setEnrollments] = useState<DisplayEnrollment[]>([]);
  const [availableOfferings, setAvailableOfferings] = useState<DisplayCourseOffering[]>([]);
  const [enrollmentTypeDialogOpen, setEnrollmentTypeDialogOpen] = useState(false);
  const [selectedOfferingForEnrollment, setSelectedOfferingForEnrollment] = useState<DisplayCourseOffering | null>(null);
  const [selectedEnrollmentType, setSelectedEnrollmentType] = useState<'CREDIT' | 'CREDIT_CONCENTRATION' | 'CREDIT_MINOR'>('CREDIT');
  const [enrollmentInProgress, setEnrollmentInProgress] = useState(false);
  const [stats, setStats] = useState<AcademicStats>({
    totalEnrollments: 0,
    creditsEarned: 0,
    mainGPA: 0,
    concentrationGPA: 0,
    minorGPA: 0,
    cgpa: 0,
    currentSemesterGPA: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch student record
        const recordResponse = await studentApi.getStudentRecord();
        
        // Transform enrollments for display from semester-wise structure
        const displayEnrollments: DisplayEnrollment[] = [];
        Object.values(recordResponse.semesterWiseEnrollments || {}).forEach((semester: any) => {
          [...(semester.ongoing || []), ...(semester.completed || [])].forEach((course: CourseSummary) => {
            displayEnrollments.push({
              id: course.courseCode, // Use courseCode as ID for now
              courseCode: course.courseCode,
              courseName: course.courseName,
              instructor: course.instructor,
              credits: course.credits,
              type: course.enrollmentType,
              status: course.status,
              grade: course.grade,
            });
          });
        });
        setEnrollments(displayEnrollments);

        // Fetch available offerings
        const offerings = await studentApi.getAvailableOfferings();
        const displayOfferings: DisplayCourseOffering[] = offerings.map((o) => {
          const isEnrolled = displayEnrollments.some((e) => e.courseCode === o.course.code);
          const isBranchAllowed = o.allowedBranches.includes(user?.branch || '');
          const canEnroll = !isEnrolled && isBranchAllowed;
          
          return {
            id: o.id,
            courseCode: o.course.code,
            courseName: o.course.name,
            credits: o.course.credits,
            instructor: o.instructor.name,
            timeSlot: o.timeSlot,
            branches: o.allowedBranches,
            enrolled: isEnrolled,
            canEnroll: canEnroll,
          };
        });
        setAvailableOfferings(displayOfferings);

        // Calculate stats from the response summary
        setStats({
          totalEnrollments: recordResponse.summary.totalEnrollments || 0,
          creditsEarned: recordResponse.summary.cumulativeCreditsCompleted || 0,
          mainGPA: recordResponse.summary.mainGPA || 0,
          concentrationGPA: recordResponse.summary.concentrationGPA || 0,
          minorGPA: recordResponse.summary.minorGPA || 0,
          cgpa: recordResponse.summary.cgpa || 0,
          currentSemesterGPA: recordResponse.summary.currentSemesterGPA || 0,
        });
      } catch (err) {
        console.error('Failed to fetch student dashboard:', err);
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleDropEnrollment = async (enrollmentId: string) => {
    try {
      await studentApi.dropEnrollment(enrollmentId);
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Failed to drop enrollment:', err);
      setError('Failed to drop enrollment. Please try again.');
    }
  };

  const handleAuditEnrollment = async (enrollmentId: string) => {
    try {
      await studentApi.auditEnrollment(enrollmentId);
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Failed to audit enrollment:', err);
      setError('Failed to audit enrollment. Please try again.');
    }
  };

  const handleEnrollClick = (offering: DisplayCourseOffering) => {
    setSelectedOfferingForEnrollment(offering);
    setSelectedEnrollmentType('CREDIT');
    setEnrollmentTypeDialogOpen(true);
  };

  const handleEnrollmentTypeConfirm = async () => {
    if (!selectedOfferingForEnrollment) return;
    
    try {
      setEnrollmentInProgress(true);
      await studentApi.requestEnrollment(selectedOfferingForEnrollment.id, selectedEnrollmentType);
      toast.success(`Successfully enrolled in ${selectedOfferingForEnrollment.courseName}`);
      setEnrollmentTypeDialogOpen(false);
      // Refresh data
      window.location.reload();
    } catch (err) {
      console.error('Failed to enroll:', err);
      setError('Failed to enroll in course. Please try again.');
    } finally {
      setEnrollmentInProgress(false);
    }
  };

  const handleEnrollCourse = async (offeringId: string) => {
    const offering = availableOfferings.find(o => o.id === offeringId);
    if (offering) {
      handleEnrollClick(offering);
    }
  };

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <DashboardLayout pageTitle="Student Dashboard">
        <Box>
          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome, {user?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Entry Number: {user?.entryNumber} | Branch: {user?.branch}
            </Typography>
          </Box>

          {/* Academic Stats */}
          {loading ? (
            <LoadingSkeleton type="grid" count={6} />
          ) : (
            <>
              <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Enrollments"
                    value={stats.totalEnrollments}
                    icon={<SchoolIcon />}
                    color="primary"
                    subtitle="Active Courses"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Credits Earned"
                    value={stats.creditsEarned}
                    icon={<AssignmentIcon />}
                    color="success"
                    subtitle="Completed Courses"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Main GPA"
                    value={stats.mainGPA.toFixed(2)}
                    icon={<TrendingUpIcon />}
                    color="info"
                    subtitle="Core Courses"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <StatCard
                    title="Semester GPA"
                    value={stats.currentSemesterGPA.toFixed(2)}
                    icon={<TrendingUpIcon />}
                    color="success"
                    subtitle="Current Semester"
                  />
                </Grid>
              </Grid>

              {/* Concentration and Minor GPAs if they exist */}
              {(stats.concentrationGPA > 0 || stats.minorGPA > 0) && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                  {stats.concentrationGPA > 0 && (
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard
                        title="Concentration GPA"
                        value={stats.concentrationGPA.toFixed(2)}
                        icon={<TrendingUpIcon />}
                        color="warning"
                        subtitle="Concentration Courses"
                      />
                    </Grid>
                  )}
                  {stats.minorGPA > 0 && (
                    <Grid item xs={12} sm={6} md={3}>
                      <StatCard
                        title="Minor GPA"
                        value={stats.minorGPA.toFixed(2)}
                        icon={<TrendingUpIcon />}
                        color="error"
                        subtitle="Minor Courses"
                      />
                    </Grid>
                  )}
                </Grid>
              )}
            </>
          )}

          {/* My Enrollments */}
          {loading ? (
            <LoadingSkeleton type="table" count={3} />
          ) : (
            <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  My Current Enrollments
                </Typography>

                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                        <TableCell sx={{ fontWeight: 600 }} align="center">
                          Credits
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Grade</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
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
                          <TableCell>
                            <StatusChip status={enrollment.type as any} size="small" />
                          </TableCell>
                          <TableCell>
                            <StatusChip status={enrollment.status as any} size="small" />
                          </TableCell>
                          <TableCell>{enrollment.grade ? <Chip label={enrollment.grade.replace('_MINUS', '-')} variant="outlined" /> : '-'}</TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" sx={{ borderColor: '#8B3A3A', color: '#8B3A3A', mr: 1 }} onClick={() => handleDropEnrollment(enrollment.id)}>
                              Drop
                            </Button>
                            <Button size="small" variant="outlined" sx={{ borderColor: '#D4A574', color: '#D4A574' }} onClick={() => handleAuditEnrollment(enrollment.id)}>
                              Audit
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Available Offerings */}
          {loading ? (
            <LoadingSkeleton type="card" count={2} />
          ) : (
            <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Available Course Offerings
                  </Typography>
                </Box>

                <Box>
                  {availableOfferings.map((offering) => (
                    <Box
                      key={offering.id}
                      sx={{
                        p: 2,
                        border: '1px solid #e0e0e0',
                        borderRadius: 1,
                        mb: 2,
                        '&:last-child': { mb: 0 },
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {offering.courseCode} - {offering.courseName}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                            Instructor: {offering.instructor} | Credits: {offering.credits}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Time Slot: {offering.timeSlot}
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 0.5, mt: 1 }}>
                            {offering.branches.map((branch) => (
                              <Chip key={branch} label={branch} size="small" variant="outlined" />
                            ))}
                          </Box>
                        </Box>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          disabled={!offering.canEnroll}
                          sx={{
                            backgroundColor: offering.canEnroll ? '#4caf50' : '#cccccc',
                            color: offering.canEnroll ? 'white' : '#999999',
                            '&:hover': { 
                              backgroundColor: offering.canEnroll ? '#388e3c' : '#cccccc',
                              cursor: offering.canEnroll ? 'pointer' : 'not-allowed',
                            },
                            ml: 2,
                          }}
                          onClick={() => handleEnrollCourse(offering.id)}
                          title={!offering.canEnroll ? (offering.enrolled ? 'Already enrolled' : 'Not available for your branch') : 'Enroll in this course'}
                        >
                          {offering.enrolled ? 'Already Enrolled' : 'Enroll'}
                        </Button>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box onClick={() => router.push('/student/record')} sx={{ textDecoration: 'none' }}>
                <Card 
                  sx={{ border: '2px dashed #8B3A3A', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' }, height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <DescriptionIcon sx={{ fontSize: 40, color: '#8B3A3A', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      View Transcript
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Download your transcript
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box onClick={() => router.push('/student/feedback')} sx={{ textDecoration: 'none' }}>
                <Card 
                  sx={{ border: '2px dashed #D4A574', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' }, height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ChatIcon sx={{ fontSize: 40, color: '#D4A574', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Feedback Forms
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Provide course feedback
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box onClick={() => router.push('/student/enrollments')} sx={{ textDecoration: 'none' }}>
                <Card 
                  sx={{ border: '2px dashed #8B3A3A', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' }, height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: '#8B3A3A', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      My Enrollments
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      View your enrollments
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box onClick={() => router.push('/courses')} sx={{ textDecoration: 'none' }}>
                <Card 
                  sx={{ border: '2px dashed #D4A574', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' }, height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <SchoolIcon sx={{ fontSize: 40, color: '#D4A574', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Course Catalog
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Browse all courses
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>

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
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentDashboard;
