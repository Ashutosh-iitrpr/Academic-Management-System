'use client';

import React, { useEffect, useState } from 'react';
import { Grid, Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatCard from '@/components/ui/StatCard';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/lib/auth/AuthContext';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import ChatIcon from '@mui/icons-material/Chat';
import AddIcon from '@mui/icons-material/Add';

interface CourseOffering {
  id: string;
  courseCode: string;
  courseName: string;
  semester: string;
  timeSlot: string;
  enrolledStudents: number;
  status: string;
}

interface PendingEnrollment {
  id: string;
  studentName: string;
  studentEntry: string;
  courseCode: string;
  enrollmentType: string;
  status: string;
}

const InstructorDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [pendingEnrollments, setPendingEnrollments] = useState<PendingEnrollment[]>([]);
  const [stats, setStats] = useState({ totalOfferings: 0, totalStudents: 0, pendingEnrollments: 0, feedbackForms: 0 });

  useEffect(() => {
    // Mock API calls
    const fetchData = async () => {
      try {
        setLoading(true);

        // Mock offerings
        setOfferings([
          {
            id: '1',
            courseCode: 'CS101',
            courseName: 'Data Structures',
            semester: 'Odd 2024',
            timeSlot: 'Mon, Wed, Fri 10:00 AM',
            enrolledStudents: 45,
            status: 'APPROVED',
          },
          {
            id: '2',
            courseCode: 'CS201',
            courseName: 'Algorithms',
            semester: 'Odd 2024',
            timeSlot: 'Tue, Thu 2:00 PM',
            enrolledStudents: 38,
            status: 'APPROVED',
          },
          {
            id: '3',
            courseCode: 'CS301',
            courseName: 'Database Design',
            semester: 'Even 2024',
            timeSlot: 'Mon, Wed, Fri 1:00 PM',
            enrolledStudents: 0,
            status: 'PENDING',
          },
        ]);

        // Mock pending enrollments
        setPendingEnrollments([
          {
            id: '1',
            studentName: 'Raj Kumar',
            studentEntry: '2023CSB001',
            courseCode: 'CS101',
            enrollmentType: 'REGULAR',
            status: 'PENDING',
          },
          {
            id: '2',
            studentName: 'Priya Singh',
            studentEntry: '2023CSB002',
            courseCode: 'CS201',
            enrollmentType: 'AUDIT',
            status: 'PENDING',
          },
        ]);

        setStats({
          totalOfferings: 3,
          totalStudents: 83,
          pendingEnrollments: 2,
          feedbackForms: 2,
        });
      } catch (error) {
        console.error('Failed to fetch instructor dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
                  {offerings.map((offering) => (
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
                          {offering.courseCode} - {offering.courseName}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {offering.semester} | {offering.timeSlot}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {offering.enrolledStudents} Students
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
                  ))}
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
                      {pendingEnrollments.map((enrollment) => (
                        <TableRow key={enrollment.id}>
                          <TableCell>{enrollment.studentName}</TableCell>
                          <TableCell>{enrollment.studentEntry}</TableCell>
                          <TableCell>{enrollment.courseCode}</TableCell>
                          <TableCell>
                            <StatusChip status={enrollment.enrollmentType as any} size="small" />
                          </TableCell>
                          <TableCell>
                            <StatusChip status={enrollment.status as any} size="small" />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button size="small" variant="contained" sx={{ backgroundColor: '#4caf50', '&:hover': { backgroundColor: '#388e3c' } }}>
                                Approve
                              </Button>
                              <Button size="small" variant="outlined" sx={{ borderColor: '#f44336', color: '#f44336' }}>
                                Reject
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorDashboard;
