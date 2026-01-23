'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { Grid, Box, Card, CardContent, Typography, Button, Alert } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatCard from '@/components/ui/StatCard';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/lib/auth/AuthContext';
import { getDaysUntilDeadline, formatDate } from '@/lib/utils/academicUtils';
import { getAxiosClient } from '@/lib/api/axiosClient';
import { useRouter } from 'next/navigation';
import DescriptionIcon from '@mui/icons-material/Description'; // Import DescriptionIcon

// Icons
import PeopleIcon from '@mui/icons-material/People';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EventIcon from '@mui/icons-material/Event';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AcademicCalendar {
  id: string;
  enrollmentStart: string;
  enrollmentEnd: string;
  dropDeadline: string;
  auditDeadline: string;
  semester?: string;
  year?: number;
}

interface DashboardStats {
  totalUsers: number;
  totalCourses: number;
  pendingApprovals: number;
  activeSemesters: number;
}

interface CourseOffering {
  id: string;
  course: { name: string; code: string };
  instructor: { name: string };
  status: string;
  semester: string;
}

const AdminDashboard = () => {
  const { user } = useAuth();
  const router = useRouter();
  const axiosClient = getAxiosClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCourses: 0,
    pendingApprovals: 0,
    activeSemesters: 0,
  });
  const [calendar, setCalendar] = useState<AcademicCalendar | null>(null);
  const [pendingOfferings, setPendingOfferings] = useState<CourseOffering[]>([]);
  const [daysUntilEnrollmentEnd, setDaysUntilEnrollmentEnd] = useState<number | null>(null);
  const [actionOfferingId, setActionOfferingId] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [statsRes, calendarRes, pendingRes] = await Promise.all([
        axiosClient.get('/admin/dashboard/stats'),
        axiosClient.get('/admin/academic-calendar'),
        axiosClient.get('/admin/course-offerings'),
      ]);

      setStats({
        totalUsers: statsRes.data?.totalUsers ?? 0,
        totalCourses: statsRes.data?.totalCourses ?? 0,
        pendingApprovals: statsRes.data?.pendingApprovals ?? 0,
        activeSemesters: statsRes.data?.activeSemesters ?? 0,
      });

      if (calendarRes.data) {
        setCalendar(calendarRes.data);
        setDaysUntilEnrollmentEnd(getDaysUntilDeadline(calendarRes.data.enrollmentEnd));
      } else {
        setCalendar(null);
        setDaysUntilEnrollmentEnd(null);
      }

      setPendingOfferings(pendingRes.data || []);
    } catch (error) {
      console.error('Failed to fetch admin dashboard data:', error);
      setError('Unable to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [axiosClient]);

  const handleApproveOffering = async (offeringId: string) => {
    try {
      setActionOfferingId(offeringId);
      await axiosClient.patch(`/admin/course-offerings/${offeringId}/approve`);
      await fetchData();
    } catch (err) {
      console.error('Error approving offering:', err);
      setError('Failed to approve offering. Please try again.');
    } finally {
      setActionOfferingId(null);
    }
  };

  const handleRejectOffering = async (offeringId: string) => {
    const reason = window.prompt('Enter a reason for rejection (optional):', '');
    if (reason === null) return;

    try {
      setActionOfferingId(offeringId);
      await axiosClient.patch(`/admin/course-offerings/${offeringId}/reject`, { reason: reason || 'Rejected from dashboard' });
      await fetchData();
    } catch (err) {
      console.error('Error rejecting offering:', err);
      setError('Failed to reject offering. Please try again.');
    } finally {
      setActionOfferingId(null);
    }
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout pageTitle="Admin Dashboard">
        <Box>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}
          {/* Welcome Section */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Welcome, {user?.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Here's an overview of your academic institution's management system.
            </Typography>
          </Box>

          {/* Stats Grid */}
          {loading ? (
            <LoadingSkeleton type="grid" count={4} />
          ) : (
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Users"
                  value={stats.totalUsers}
                  icon={<PeopleIcon />}
                  color="info"
                  subtitle="Admins, Instructors & Students"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Total Courses"
                  value={stats.totalCourses}
                  icon={<SchoolIcon />}
                  color="success"
                  subtitle="Active Courses"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Pending Approvals"
                  value={stats.pendingApprovals}
                  icon={<AssignmentIcon />}
                  color="warning"
                  subtitle="Course Offerings"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <StatCard
                  title="Active Semesters"
                  value={stats.activeSemesters}
                  icon={<EventIcon />}
                  color="primary"
                  subtitle="Running Currently"
                />
              </Grid>
            </Grid>
          )}

          {/* Academic Calendar Section */}
          {loading ? (
            <LoadingSkeleton type="card" count={1} />
          ) : calendar ? (
            <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Academic Calendar - {calendar.semester} {calendar.year}
                  </Typography>
                  <Button
                    variant="contained"
                    sx={{
                      backgroundColor: '#8B3A3A',
                      '&:hover': { backgroundColor: '#6B2A2A' },
                    }}
                    onClick={() => router.push('/admin/calendar')}
                  >
                    Update Calendar
                  </Button>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        Enrollment Start
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(calendar.enrollmentStart)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        Enrollment End
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(calendar.enrollmentEnd)}
                        {daysUntilEnrollmentEnd !== null && (
                          <Typography variant="caption" sx={{ display: 'block', color: '#ff9800' }}>
                            {daysUntilEnrollmentEnd} days left
                          </Typography>
                        )}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        Drop Deadline
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(calendar.dropDeadline)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <Box sx={{ p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                        Audit Deadline
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {formatDate(calendar.auditDeadline)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : null}

          {/* Quick Actions */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: '2px dashed #8B3A3A', backgroundColor: '#fafafa' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <PeopleIcon sx={{ fontSize: 40, color: '#8B3A3A', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Create New User
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{ color: '#8B3A3A', borderColor: '#8B3A3A' }}
                    onClick={() => router.push('/admin/users')}
                  >
                    Add User
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: '2px dashed #8B3A3A', backgroundColor: '#fafafa' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <SchoolIcon sx={{ fontSize: 40, color: '#8B3A3A', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Create New Course
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AddIcon />}
                    sx={{ color: '#8B3A3A', borderColor: '#8B3A3A' }}
                    onClick={() => router.push('/admin/courses')}
                  >
                    Add Course
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: '2px dashed #D4A574', backgroundColor: '#fafafa' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 40, color: '#D4A574', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    View Approvals
                  </Typography>
                  <Button
                    variant="contained"
                    size="small"
                    startIcon={<CheckCircleIcon />}
                    sx={{ backgroundColor: '#D4A574', color: '#1a1a1a', '&:hover': { backgroundColor: '#B88A5D' } }}
                    onClick={() => router.push('/admin/approvals')}
                  >
                    Review
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: '2px dashed #8B3A3A', backgroundColor: '#fafafa' }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <DescriptionIcon sx={{ fontSize: 40, color: '#8B3A3A', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Student Transcript
                  </Typography>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<AssignmentIcon />}
                    sx={{ color: '#8B3A3A', borderColor: '#8B3A3A' }}
                    onClick={() => router.push('/admin/transcript')}
                  >
                    Search
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Pending Approvals */}
          {loading ? (
            <LoadingSkeleton type="table" count={3} />
          ) : (
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                  Pending Course Offering Approvals
                </Typography>
                {pendingOfferings.length === 0 ? (
                  <Alert severity="info">No pending approvals at the moment.</Alert>
                ) : (
                  <Box>
                    {pendingOfferings.map((offering) => (
                      <Box
                        key={offering.id}
                        sx={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          p: 2,
                          borderBottom: '1px solid #e0e0e0',
                          '&:last-child': { borderBottom: 'none' },
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                            {offering.course.code} - {offering.course.name}
                          </Typography>
                          <Typography variant="caption" sx={{ color: '#666' }}>
                            Instructor: {offering.instructor.name} | Semester: {offering.semester}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <StatusChip status={offering.status} />
                          <Button
                            variant="contained"
                            size="small"
                            sx={{
                              backgroundColor: '#4caf50',
                              '&:hover': { backgroundColor: '#388e3c' },
                            }}
                            onClick={() => handleApproveOffering(offering.id)}
                            disabled={actionOfferingId === offering.id}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            size="small"
                            sx={{
                              borderColor: '#f44336',
                              color: '#f44336',
                            }}
                            onClick={() => handleRejectOffering(offering.id)}
                            disabled={actionOfferingId === offering.id}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          )}
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
