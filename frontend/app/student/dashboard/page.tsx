'use client';

import React, { useEffect, useState } from 'react';
import { Grid, Box, Card, CardContent, Typography, Button, Alert, Table, TableBody, TableCell, TableHead, TableRow, Chip } from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatCard from '@/components/ui/StatCard';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/lib/auth/AuthContext';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import ChatIcon from '@mui/icons-material/Chat';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AddIcon from '@mui/icons-material/Add';

interface Enrollment {
  id: string;
  courseCode: string;
  courseName: string;
  instructor: string;
  credits: number;
  type: string;
  status: string;
  grade?: string;
}

interface CourseOffering {
  id: string;
  courseCode: string;
  courseName: string;
  credits: number;
  instructor: string;
  timeSlot: string;
  branches: string[];
  enrolled: boolean;
}

interface AcademicStats {
  totalEnrollments: number;
  creditsEarned: number;
  cgpa: number;
  currentSemesterGPA: number;
}

const StudentDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [availableOfferings, setAvailableOfferings] = useState<CourseOffering[]>([]);
  const [stats, setStats] = useState<AcademicStats>({
    totalEnrollments: 0,
    creditsEarned: 0,
    cgpa: 0,
    currentSemesterGPA: 0,
  });

  useEffect(() => {
    // Mock API calls
    const fetchData = async () => {
      try {
        setLoading(true);

        // Mock enrollments
        setEnrollments([
          {
            id: '1',
            courseCode: 'CS101',
            courseName: 'Data Structures',
            instructor: 'Dr. Smith',
            credits: 3,
            type: 'REGULAR',
            status: 'ACTIVE',
            grade: 'A',
          },
          {
            id: '2',
            courseCode: 'CS201',
            courseName: 'Algorithms',
            instructor: 'Prof. Johnson',
            credits: 4,
            type: 'REGULAR',
            status: 'ACTIVE',
          },
          {
            id: '3',
            courseCode: 'MATH101',
            courseName: 'Calculus I',
            instructor: 'Dr. Patel',
            credits: 3,
            type: 'AUDIT',
            status: 'ACTIVE',
          },
        ]);

        // Mock available offerings
        setAvailableOfferings([
          {
            id: '1',
            courseCode: 'CS301',
            courseName: 'Database Design',
            credits: 4,
            instructor: 'Prof. Kumar',
            timeSlot: 'Mon, Wed, Fri 10:00 AM',
            branches: ['CSB', 'ECB'],
            enrolled: false,
          },
          {
            id: '2',
            courseCode: 'PHYS201',
            courseName: 'Physics II',
            credits: 3,
            instructor: 'Dr. Sharma',
            timeSlot: 'Tue, Thu 2:00 PM',
            branches: ['CSB', 'ECB', 'MMB'],
            enrolled: false,
          },
        ]);

        setStats({
          totalEnrollments: 3,
          creditsEarned: 45,
          cgpa: 3.85,
          currentSemesterGPA: 3.9,
        });
      } catch (error) {
        console.error('Failed to fetch student dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <DashboardLayout pageTitle="Student Dashboard">
        <Box>
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
            <LoadingSkeleton type="grid" count={4} />
          ) : (
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
                  title="CGPA"
                  value={stats.cgpa.toFixed(2)}
                  icon={<TrendingUpIcon />}
                  color="info"
                  subtitle="Cumulative"
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
                          <TableCell>{enrollment.grade ? <Chip label={enrollment.grade} variant="outlined" /> : '-'}</TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined" sx={{ borderColor: '#8B3A3A', color: '#8B3A3A', mr: 1 }}>
                              Drop
                            </Button>
                            <Button size="small" variant="outlined" sx={{ borderColor: '#D4A574', color: '#D4A574' }}>
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
                          sx={{
                            backgroundColor: '#4caf50',
                            '&:hover': { backgroundColor: '#388e3c' },
                            ml: 2,
                          }}
                        >
                          Enroll
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
              <Card sx={{ border: '2px dashed #8B3A3A', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' } }}>
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
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: '2px dashed #D4A574', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' } }}>
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
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: '2px dashed #8B3A3A', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' } }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <AssignmentIcon sx={{ fontSize: 40, color: '#8B3A3A', mb: 1 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                    Academic Record
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    View your academic record
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ border: '2px dashed #D4A574', backgroundColor: '#fafafa', cursor: 'pointer', '&:hover': { backgroundColor: '#f0f0f0' } }}>
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
            </Grid>
          </Grid>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentDashboard;
