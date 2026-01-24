'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Grid, Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatCard from '@/components/ui/StatCard';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/lib/auth/AuthContext';
import instructorApi, { CourseOffering as ApiCourseOffering, Enrollment } from '@/lib/api/instructorApi';
import { toast } from 'sonner';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';
import BookIcon from '@mui/icons-material/Book';

const InstructorDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<ApiCourseOffering[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState({ totalOfferings: 0, totalStudents: 0, pendingEnrollments: 0, feedbackForms: 0 });

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch real data from API
      const [offeringsData, pendingData] = await Promise.all([
        instructorApi.getCourseOfferings(),
        instructorApi.getPendingEnrollments(),
      ]);

      setOfferings(offeringsData);
      setPendingEnrollments(pendingData);

      // Calculate stats
      const totalStudents = offeringsData.reduce(
        (sum, offering) => sum + (offering._count?.enrollments || 0),
        0
      );

      setStats({
        totalOfferings: offeringsData.length,
        totalStudents,
        pendingEnrollments: pendingData.length,
        feedbackForms: 0, // TODO: Add feedback forms count
      });
    } catch (error: any) {
      console.error('Failed to fetch instructor dashboard:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (enrollmentId: string) => {
    try {
      await instructorApi.approveEnrollment(enrollmentId);
      toast.success('Enrollment approved successfully');
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Failed to approve enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to approve enrollment');
    }
  };

  const handleReject = async (enrollmentId: string) => {
    try {
      await instructorApi.rejectEnrollment(enrollmentId);
      toast.success('Enrollment rejected successfully');
      fetchData(); // Refresh data
    } catch (error: any) {
      console.error('Failed to reject enrollment:', error);
      toast.error(error.response?.data?.message || 'Failed to reject enrollment');
    }
  };

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="Instructor Dashboard">
        <Box>
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome, {user?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Manage your courses, enrollments, and student feedback.
            </Typography>
          </Box>

          {/* Stats Grid */}
          {loading ? (
            <LoadingSkeleton type="grid" count={4} />
          ) : (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Course Offerings"
                  value={stats.totalOfferings}
                  icon={<SchoolIcon />}
                  color="primary"
                  subtitle="Active & Pending"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Students"
                  value={stats.totalStudents}
                  icon={<PeopleIcon />}
                  color="success"
                  subtitle="Enrolled Across Courses"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pending Enrollments"
                  value={stats.pendingEnrollments}
                  icon={<AssignmentIcon />}
                  color="warning"
                  subtitle="Awaiting Approval"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Feedback Forms"
                  value={stats.feedbackForms}
                  icon={<ChatIcon />}
                  color="info"
                  subtitle="Active Forms"
                />
              </Grid>
            </Grid>
          )}

          {/* Course Offerings Section */}
          {loading ? (
            <LoadingSkeleton type="card" count={1} />
          ) : (
            <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    My Course Offerings
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    sx={{
                      backgroundColor: '#8B3A3A',
                      '&:hover': { backgroundColor: '#6B2A2A' },
                    }}
                  >
                    Request New Offering
                  </Button>
                </Box>

                <Box>
                  {offerings.length === 0 ? (
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Typography variant="body2" sx={{ color: '#666' }}>
                        No course offerings yet. Request a new offering to get started.
                      </Typography>
                    </Box>
                  ) : (
                    offerings.map((offering) => (
                    <Box
                      key={offering.id}
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: { xs: '1fr', md: '2fr 1fr 1fr 1fr auto' },
                        gap: 2,
                        p: 2,
                        borderBottom: '1px solid #e0e0e0',
                        alignItems: 'center',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Box>
                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                          {offering.course.code} - {offering.course.name}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {offering.semester} | {offering.timeSlot}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {offering._count?.enrollments || 0} Students
                        </Typography>
                      </Box>
                      <StatusChip status={offering.status as any} />
                      <Button
                        size="small"
                        variant="outlined"
                        sx={{
                          borderColor: '#8B3A3A',
                          color: '#8B3A3A',
                        }}
                      >
                        View Details
                      </Button>
                    </Box>
                  ))
                  )}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Pending Enrollments */}
          {loading ? (
            <LoadingSkeleton type="table" count={3} />
          ) : (
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Pending Enrollment Requests
                </Typography>

                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Entry Number</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {pendingEnrollments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              No pending enrollment requests
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        pendingEnrollments.map((enrollment) => (
                          <TableRow key={enrollment.id}>
                            <TableCell>{enrollment.student.name}</TableCell>
                            <TableCell>{enrollment.student.entryNumber || 'N/A'}</TableCell>
                            <TableCell>{enrollment.studentId}</TableCell>
                            <TableCell>
                              <StatusChip status={enrollment.enrollmentType as any} size="small" />
                            </TableCell>
                            <TableCell>
                              <StatusChip status={enrollment.status as any} size="small" />
                            </TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', gap: 1 }}>
                                <Button 
                                  size="small" 
                                  variant="contained" 
                                  sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}
                                  onClick={() => handleApprove(enrollment.id)}
                                >
                                  Approve
                                </Button>
                                <Button 
                                  size="small" 
                                  variant="outlined" 
                                  sx={{ borderColor: '#f44336', color: '#f44336' }}
                                  onClick={() => handleReject(enrollment.id)}
                                >
                                  Reject
                                </Button>
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Quick Links */}
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Box onClick={() => router.push('/courses')} sx={{ textDecoration: 'none' }}>
                <Card 
                  sx={{ border: '2px dashed #8B3A3A', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' }, height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <BookIcon sx={{ fontSize: 40, color: '#8B3A3A', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Course Catalog
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Browse and request courses
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box onClick={() => router.push('/instructor/all-offerings')} sx={{ textDecoration: 'none' }}>
                <Card 
                  sx={{ border: '2px dashed #D4A574', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' }, height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <SchoolIcon sx={{ fontSize: 40, color: '#D4A574', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      All Offerings
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      View all course offerings
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box onClick={() => router.push('/instructor/grades')} sx={{ textDecoration: 'none' }}>
                <Card 
                  sx={{ border: '2px dashed #8B3A3A', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' }, height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <AssignmentIcon sx={{ fontSize: 40, color: '#8B3A3A', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Manage Grades
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      Submit grades for students
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box onClick={() => router.push('/instructor/feedback')} sx={{ textDecoration: 'none' }}>
                <Card 
                  sx={{ border: '2px dashed #D4A574', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' }, height: '100%' }}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <ChatIcon sx={{ fontSize: 40, color: '#D4A574', mb: 1 }} />
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                      Course Feedback
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      View student feedback
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            </Grid>
          </Grid>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorDashboard;
