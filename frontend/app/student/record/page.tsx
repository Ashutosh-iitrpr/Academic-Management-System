'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Divider,
  Paper,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/lib/auth/AuthContext';
import studentApi from '@/lib/api/studentApi';
import { toast } from 'sonner';

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface CourseSummary {
  courseCode: string;
  courseName: string;
  credits: number;
  enrollmentType: string;
  status: string;
  grade?: string;
  instructor: string;
}

interface SemesterBucket {
  ongoing: CourseSummary[];
  completed: CourseSummary[];
  dropped: CourseSummary[];
  creditsEarned: number;
  creditsRegistered: number;
}

interface StudentRecordData {
  student: {
    id?: string;
    name: string;
    entryNumber: string;
    branch?: string;
    admissionYear?: string;
  };
  semesterWiseEnrollments: Record<string, SemesterBucket>;
  summary: {
    cumulativeCreditsCompleted: number;
    creditsOngoing: number;
    totalEnrollments: number;
    cgpa: number;
    currentSemesterGPA: number;
  };
}

const StudentRecordPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [recordData, setRecordData] = useState<StudentRecordData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedSemester, setExpandedSemester] = useState<string | false>(false);

  useEffect(() => {
    fetchStudentRecord();
  }, []);

  const fetchStudentRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getStudentRecord();
      setRecordData(data);

      // Auto-expand the first semester
      const semesters = Object.keys(data.semesterWiseEnrollments);
      if (semesters.length > 0) {
        setExpandedSemester(semesters[semesters.length - 1]); // Most recent semester
      }
    } catch (err: any) {
      console.error('Failed to fetch student record:', err);
      setError(err.response?.data?.message || 'Failed to load student record');
      toast.error('Failed to load student record');
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (semester: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
    setExpandedSemester(isExpanded ? semester : false);
  };

  const getGradeColor = (grade: string): string => {
    const gradeColors: Record<string, string> = {
      'A': '#4caf50',
      'A_MINUS': '#66bb6a',
      'B': '#81c784',
      'B_MINUS': '#aed581',
      'C': '#ffeb3b',
      'C_MINUS': '#fdd835',
      'D': '#ff9800',
      'E': '#ff5722',
      'F': '#f44336',
    };
    return gradeColors[grade] || '#999';
  };

  const getStatusChipColor = (
    status: string
  ): 'default' | 'primary' | 'success' | 'warning' | 'error' | 'info' => {
    switch (status) {
      case 'COMPLETED':
        return 'success';
      case 'ENROLLED':
        return 'info';
      case 'AUDIT':
        return 'primary';
      case 'DROPPED':
        return 'default';
      default:
        return 'default';
    }
  };

  const calculateSemesterGPA = (courses: CourseSummary[]): number => {
    const GRADE_POINTS: Record<string, number> = {
      A: 10,
      A_MINUS: 9,
      B: 8,
      B_MINUS: 7,
      C: 6,
      C_MINUS: 5,
      D: 4,
      E: 2,
      F: 0,
    };

    let totalPoints = 0;
    let totalCredits = 0;

    courses.forEach((course) => {
      if (course.grade && GRADE_POINTS[course.grade] !== undefined) {
        totalPoints += GRADE_POINTS[course.grade] * course.credits;
        totalCredits += course.credits;
      }
    });

    return totalCredits > 0 ? parseFloat((totalPoints / totalCredits).toFixed(2)) : 0;
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="STUDENT">
        <DashboardLayout pageTitle="Academic Record">
          <LoadingSkeleton type="grid" count={4} />
          <Box sx={{ mt: 3 }}>
            <LoadingSkeleton type="card" count={3} />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error || !recordData) {
    return (
      <ProtectedRoute requiredRole="STUDENT">
        <DashboardLayout pageTitle="Academic Record">
          <Alert severity="error">{error || 'Failed to load record data'}</Alert>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  // Sort semesters in reverse chronological order (most recent first)
  const sortedSemesters = Object.keys(recordData.semesterWiseEnrollments).sort().reverse();

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <DashboardLayout pageTitle="Academic Record">
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Academic Record
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
              Complete academic history with semester-wise performance
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Chip
                label={`Entry Number: ${recordData.student.entryNumber}`}
                variant="outlined"
                color="primary"
              />
              {recordData.student.branch && (
                <Chip label={`Branch: ${recordData.student.branch}`} variant="outlined" color="primary" />
              )}
              {recordData.student.admissionYear && (
                <Chip
                  label={`Admission Year: ${recordData.student.admissionYear}`}
                  variant="outlined"
                  color="primary"
                />
              )}
            </Box>
          </Box>

          {/* Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="CGPA"
                value={recordData.summary.cgpa.toFixed(2)}
                icon={<TrendingUpIcon />}
                color="primary"
                subtitle="Cumulative Grade Point Average"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Semester GPA"
                value={recordData.summary.currentSemesterGPA.toFixed(2)}
                icon={<TrendingUpIcon />}
                color="success"
                subtitle="Current Semester"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Credits Completed"
                value={recordData.summary.cumulativeCreditsCompleted}
                icon={<CheckCircleIcon />}
                color="info"
                subtitle="Total Credits Earned"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Ongoing Credits"
                value={recordData.summary.creditsOngoing}
                icon={<AssignmentIcon />}
                color="warning"
                subtitle="Current Semester"
              />
            </Grid>
          </Grid>

          {/* Semester-wise Records */}
          <Card sx={{ mb: 4, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                Semester-wise Performance
              </Typography>

              {sortedSemesters.length === 0 ? (
                <Alert severity="info">No enrollment records found.</Alert>
              ) : (
                sortedSemesters.map((semester) => {
                  const semesterData = recordData.semesterWiseEnrollments[semester];
                  const allCourses = [
                    ...semesterData.ongoing,
                    ...semesterData.completed,
                    ...semesterData.dropped,
                  ];
                  const semesterGPA = calculateSemesterGPA(semesterData.completed);

                  return (
                    <Accordion
                      key={semester}
                      expanded={expandedSemester === semester}
                      onChange={handleAccordionChange(semester)}
                      sx={{
                        mb: 2,
                        border: '1px solid #e0e0e0',
                        '&:before': { display: 'none' },
                        boxShadow: 'none',
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          backgroundColor: '#f5f5f5',
                          '&:hover': { backgroundColor: '#eeeeee' },
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', pr: 2 }}>
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                              {semester}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#666' }}>
                              {allCourses.length} course(s) • {semesterData.creditsEarned} credits earned •{' '}
                              {semesterData.creditsRegistered} credits registered
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                            {semesterGPA > 0 && (
                              <Chip
                                label={`GPA: ${semesterGPA.toFixed(2)}`}
                                color="primary"
                                size="small"
                                variant="outlined"
                              />
                            )}
                            {semesterData.ongoing.length > 0 && (
                              <Chip
                                label={`${semesterData.ongoing.length} Ongoing`}
                                color="info"
                                size="small"
                              />
                            )}
                            {semesterData.completed.length > 0 && (
                              <Chip
                                label={`${semesterData.completed.length} Completed`}
                                color="success"
                                size="small"
                              />
                            )}
                          </Box>
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {/* Completed Courses */}
                        {semesterData.completed.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#388e3c' }}>
                              Completed Courses ({semesterData.completed.length})
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                                  <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }} align="center">
                                    Credits
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }} align="center">
                                    Grade
                                  </TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {semesterData.completed.map((course, idx) => (
                                  <TableRow key={idx} hover>
                                    <TableCell>
                                      <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {course.courseCode}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#666' }}>
                                          {course.courseName}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">{course.credits}</TableCell>
                                    <TableCell>{course.instructor}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={course.enrollmentType.replace('_', ' ')}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell align="center">
                                      {course.grade ? (
                                        <Chip
                                          label={course.grade.replace('_MINUS', '-')}
                                          size="small"
                                          sx={{
                                            backgroundColor: getGradeColor(course.grade),
                                            color: '#fff',
                                            fontWeight: 600,
                                          }}
                                        />
                                      ) : (
                                        '-'
                                      )}
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        )}

                        {/* Ongoing Courses */}
                        {semesterData.ongoing.length > 0 && (
                          <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#1976d2' }}>
                              Ongoing Courses ({semesterData.ongoing.length})
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                                  <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }} align="center">
                                    Credits
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {semesterData.ongoing.map((course, idx) => (
                                  <TableRow key={idx} hover>
                                    <TableCell>
                                      <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {course.courseCode}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#666' }}>
                                          {course.courseName}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">{course.credits}</TableCell>
                                    <TableCell>{course.instructor}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={course.enrollmentType.replace('_', ' ')}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <Chip
                                        label={course.status}
                                        color={getStatusChipColor(course.status)}
                                        size="small"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        )}

                        {/* Dropped Courses */}
                        {semesterData.dropped.length > 0 && (
                          <Box>
                            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#757575' }}>
                              Dropped Courses ({semesterData.dropped.length})
                            </Typography>
                            <Table size="small">
                              <TableHead>
                                <TableRow sx={{ backgroundColor: '#f9f9f9' }}>
                                  <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }} align="center">
                                    Credits
                                  </TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                                  <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {semesterData.dropped.map((course, idx) => (
                                  <TableRow key={idx} hover sx={{ opacity: 0.6 }}>
                                    <TableCell>
                                      <Box>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                                          {course.courseCode}
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: '#666' }}>
                                          {course.courseName}
                                        </Typography>
                                      </Box>
                                    </TableCell>
                                    <TableCell align="center">{course.credits}</TableCell>
                                    <TableCell>{course.instructor}</TableCell>
                                    <TableCell>
                                      <Chip
                                        label={course.enrollmentType.replace('_', ' ')}
                                        size="small"
                                        variant="outlined"
                                      />
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </Box>
                        )}

                        {/* Semester Summary */}
                        <Divider sx={{ my: 2 }} />
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', px: 1 }}>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Credits Earned: <strong>{semesterData.creditsEarned}</strong>
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#666' }}>
                            Credits Registered: <strong>{semesterData.creditsRegistered}</strong>
                          </Typography>
                          {semesterGPA > 0 && (
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Semester GPA: <strong>{semesterGPA.toFixed(2)}</strong>
                            </Typography>
                          )}
                        </Box>
                      </AccordionDetails>
                    </Accordion>
                  );
                })
              )}
            </CardContent>
          </Card>

          {/* Overall Summary */}
          <Paper sx={{ p: 3, border: '1px solid #e0e0e0' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
              Overall Summary
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    Total Enrollments
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#1976d2' }}>
                    {recordData.summary.totalEnrollments}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    Credits Completed
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#388e3c' }}>
                    {recordData.summary.cumulativeCreditsCompleted}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    Ongoing Credits
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#f57c00' }}>
                    {recordData.summary.creditsOngoing}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box>
                  <Typography variant="body2" sx={{ color: '#666', mb: 0.5 }}>
                    Cumulative GPA
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 700, color: '#7b1fa2' }}>
                    {recordData.summary.cgpa.toFixed(2)}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentRecordPage;
