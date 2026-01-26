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
  Alert,
  Button,
  CircularProgress,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import StatCard from '@/components/ui/StatCard';
import { useAuth } from '@/lib/auth/AuthContext';
import studentApi from '@/lib/api/studentApi';
import { toast } from 'sonner';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import DownloadIcon from '@mui/icons-material/Download';

interface Enrollment {
  id: string;
  status: string;
  grade?: string;
  enrollmentType?: string;
  semester?: string;
  courseOffering: {
    course: {
      name: string;
      code: string;
      credits: number;
    };
    instructor: { name: string };
  };
}

const StudentRecordPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [downloadLoading, setDownloadLoading] = useState(false);

  useEffect(() => {
    fetchStudentRecord();
  }, []);

  const fetchStudentRecord = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await studentApi.getStudentTranscriptByType();
      // Combine all enrollments from the response
      const allEnrollments = [
        ...(data.mainDegree || []),
        ...(data.concentration || []),
        ...(data.minor || []),
      ];
      setEnrollments(allEnrollments);
    } catch (err: any) {
      console.error('Failed to fetch student record:', err);
      setError(err.response?.data?.message || 'Failed to load student record');
      toast.error('Failed to load student record');
    } finally {
      setLoading(false);
    }
  };

  const getGradeColor = (grade?: string) => {
    if (!grade) return '#999';
    const colors: { [key: string]: string } = {
      'A': '#2E7D32',
      'B': '#1976D2',
      'C': '#F57C00',
      'D': '#D32F2F',
      'F': '#C62828',
    };
    return colors[grade.charAt(0)] || '#999';
  };

  const calculateGPA = (enrollments?: Enrollment[]) => {
    if (!enrollments || enrollments.length === 0) return 0;
    const completedEnrollments = enrollments.filter(
      (e) => e.status === 'COMPLETED' && e.grade
    );
    if (completedEnrollments.length === 0) return 0;

    const gradePoints: { [key: string]: number } = {
      A: 4.0,
      B: 3.0,
      C: 2.0,
      D: 1.0,
      F: 0.0,
    };

    const totalPoints = completedEnrollments.reduce((sum, e) => {
      const gradeKey = e.grade?.charAt(0) || 'F';
      return sum + (gradePoints[gradeKey] || 0);
    }, 0);

    return (totalPoints / completedEnrollments.length).toFixed(2);
  };

  const calculateCredits = (enrollments?: Enrollment[]) => {
    if (!enrollments || enrollments.length === 0) return 0;
    return enrollments.reduce((sum, e) => {
      if (e.status === 'COMPLETED') {
        return sum + e.courseOffering.course.credits;
      }
      return sum;
    }, 0);
  };

  const groupBySemester = (enrollments?: Enrollment[]) => {
    if (!enrollments || enrollments.length === 0) return {};

    const grouped: { [key: string]: Enrollment[] } = {};
    enrollments.forEach((enrollment) => {
      const semester = enrollment.semester || 'Unknown';
      if (!grouped[semester]) {
        grouped[semester] = [];
      }
      grouped[semester].push(enrollment);
    });

    return grouped;
  };

  const handleDownloadTranscript = () => {
    if (enrollments.length === 0) {
      toast.error('No enrollments to download');
      return;
    }

    const mainDegree = enrollments.filter(e => e.enrollmentType === 'CREDIT');
    const concentration = enrollments.filter(e => e.enrollmentType === 'CREDIT_CONCENTRATION');
    const minor = enrollments.filter(e => e.enrollmentType === 'CREDIT_MINOR');

    // Create HTML content for PDF
    let htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Student Transcript</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          h1 {
            text-align: center;
            color: #8B3A3A;
            margin-bottom: 20px;
          }
          .student-info {
            margin-bottom: 20px;
            padding: 10px;
            background-color: #f5f5f5;
            border-radius: 5px;
          }
          .student-info p {
            margin: 5px 0;
          }
          .section-title {
            font-size: 16px;
            font-weight: bold;
            color: white;
            padding: 8px 12px;
            margin-top: 20px;
            margin-bottom: 10px;
            border-radius: 4px;
          }
          .section-main { background-color: #8B3A3A; }
          .section-concentration { background-color: #1976D2; }
          .section-minor { background-color: #F57C00; }
          .section-stats {
            font-size: 12px;
            margin-bottom: 10px;
            color: #666;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 12px;
          }
          th {
            background-color: #e0e0e0;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #999;
          }
          td {
            padding: 6px 8px;
            border: 1px solid #ddd;
          }
          tr:nth-child(even) {
            background-color: #f9f9f9;
          }
          .semester-header {
            font-weight: bold;
            background-color: #f0f0f0;
            padding: 8px;
            margin-top: 10px;
            border-left: 4px solid #8B3A3A;
          }
          .empty-section {
            color: #999;
            font-style: italic;
            padding: 10px;
          }
        </style>
      </head>
      <body>
        <h1>STUDENT TRANSCRIPT</h1>
        
        <div class="student-info">
          <p><strong>Name:</strong> ${user?.name || 'N/A'}</p>
          <p><strong>Entry Number:</strong> ${user?.entryNumber || 'N/A'}</p>
          <p><strong>Email:</strong> ${user?.email || 'N/A'}</p>
          <p><strong>Date Generated:</strong> ${new Date().toLocaleDateString()}</p>
        </div>
    `;

    const addSection = (
      title: string,
      sectionEnrollments: Enrollment[],
      className: string
    ) => {
      if (sectionEnrollments.length === 0) {
        htmlContent += `<div class="section-title ${className}">${title}</div>`;
        htmlContent += `<div class="empty-section">No enrollments in this category</div>`;
        return;
      }

      htmlContent += `<div class="section-title ${className}">${title}</div>`;
      htmlContent += `<div class="section-stats">GPA: ${calculateGPA(
        sectionEnrollments
      )} | Credits Earned: ${calculateCredits(sectionEnrollments)}</div>`;

      const grouped = groupBySemester(sectionEnrollments);
      const semesters = Object.keys(grouped).sort();

      semesters.forEach((semester) => {
        htmlContent += `<div class="semester-header">${semester}</div>`;
        htmlContent += `
          <table>
            <thead>
              <tr>
                <th>Course Code</th>
                <th>Course Name</th>
                <th>Credits</th>
                <th>Instructor</th>
                <th>Status</th>
                <th>Grade</th>
              </tr>
            </thead>
            <tbody>
        `;

        grouped[semester].forEach((e) => {
          htmlContent += `
            <tr>
              <td>${e.courseOffering.course.code}</td>
              <td>${e.courseOffering.course.name}</td>
              <td>${e.courseOffering.course.credits}</td>
              <td>${e.courseOffering.instructor.name}</td>
              <td>${e.status}</td>
              <td>${e.grade || 'Pending'}</td>
            </tr>
          `;
        });

        htmlContent += `
            </tbody>
          </table>
        `;
      });
    };

    addSection('MAIN DEGREE', mainDegree, 'section-main');
    addSection('CONCENTRATION', concentration, 'section-concentration');
    addSection('MINOR', minor, 'section-minor');

    htmlContent += `
      </body>
      </html>
    `;

    // Open in new window for printing to PDF
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.onload = () => {
        printWindow.print();
      };
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="STUDENT">
        <DashboardLayout pageTitle="Student Transcript">
          <LoadingSkeleton type="grid" count={4} />
          <Box sx={{ mt: 3 }}>
            <LoadingSkeleton type="card" count={3} />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredRole="STUDENT">
        <DashboardLayout pageTitle="Student Transcript">
          <Alert severity="error">{error}</Alert>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  const mainDegree = enrollments.filter(e => e.enrollmentType === 'CREDIT');
  const concentration = enrollments.filter(e => e.enrollmentType === 'CREDIT_CONCENTRATION');
  const minor = enrollments.filter(e => e.enrollmentType === 'CREDIT_MINOR');

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <DashboardLayout pageTitle="Student Transcript">
        <Box sx={{ mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <SchoolIcon sx={{ fontSize: 28, color: '#8B3A3A' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              Student Transcript
            </Typography>
            <Button
              startIcon={downloadLoading ? <CircularProgress size={20} /> : <DownloadIcon />}
              variant="contained"
              sx={{ backgroundColor: '#8B3A3A', ml: 'auto' }}
              onClick={handleDownloadTranscript}
              disabled={downloadLoading}
            >
              Download PDF
            </Button>
          </Box>

          {/* Summary Stats */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Overall GPA
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {calculateGPA([...mainDegree, ...concentration, ...minor])}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Credits Earned
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {calculateCredits([...mainDegree, ...concentration, ...minor])}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total Courses
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {enrollments.length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Completed
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {enrollments.filter(e => e.status === 'COMPLETED').length}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Helper Component for Enrollment Table by Semester */}
          {(() => {
            const renderEnrollmentTable = (
              enrollmentList: Enrollment[],
              typeLabel: string,
              typeColor: string
            ) => {
              if (enrollmentList.length === 0) {
                return null;
              }

              const grouped = groupBySemester(enrollmentList);
              const semesters = Object.keys(grouped).sort();

              return (
                <Box sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      mb: 2,
                      pb: 2,
                      borderBottom: `3px solid ${typeColor}`,
                    }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        borderRadius: '50%',
                        backgroundColor: typeColor,
                      }}
                    />
                    <Typography variant="h6" sx={{ fontWeight: 700, color: typeColor }}>
                      {typeLabel}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ ml: 'auto' }}>
                      GPA: {calculateGPA(enrollmentList)} | Credits: {calculateCredits(enrollmentList)}
                    </Typography>
                  </Box>

                  {semesters.map((semester) => (
                    <Card key={semester} sx={{ mb: 2, ml: 2 }}>
                      <CardContent sx={{ pb: 0, '&:last-child': { pb: 2 } }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5 }}>
                          {semester}
                        </Typography>
                        <Box sx={{ overflow: 'auto' }}>
                          <Table size="small">
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  Course Code
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  Course Name
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  Credits
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  Instructor
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  Status
                                </TableCell>
                                <TableCell sx={{ fontWeight: 700, fontSize: '0.85rem' }}>
                                  Grade
                                </TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {grouped[semester]?.map((enrollment) => (
                                <TableRow
                                  key={enrollment.id}
                                  sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                                >
                                  <TableCell sx={{ fontSize: '0.9rem' }}>
                                    <Typography sx={{ fontWeight: 700, color: typeColor }}>
                                      {enrollment.courseOffering.course.code}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ fontSize: '0.9rem' }}>
                                    <Typography sx={{ fontWeight: 500 }}>
                                      {enrollment.courseOffering.course.name}
                                    </Typography>
                                  </TableCell>
                                  <TableCell sx={{ fontSize: '0.9rem' }}>
                                    <Chip
                                      label={`${enrollment.courseOffering.course.credits}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontSize: '0.9rem' }}>
                                    {enrollment.courseOffering.instructor.name}
                                  </TableCell>
                                  <TableCell sx={{ fontSize: '0.9rem' }}>
                                    <Chip
                                      label={enrollment.status}
                                      size="small"
                                      color={
                                        enrollment.status === 'COMPLETED'
                                          ? 'success'
                                          : enrollment.status === 'ACTIVE'
                                          ? 'info'
                                          : 'default'
                                      }
                                    />
                                  </TableCell>
                                  <TableCell sx={{ fontSize: '0.9rem' }}>
                                    {enrollment.grade ? (
                                      <Chip
                                        label={enrollment.grade.replace('_MINUS', '-')}
                                        sx={{
                                          backgroundColor: getGradeColor(enrollment.grade),
                                          color: '#fff',
                                          fontWeight: 700,
                                        }}
                                        size="small"
                                      />
                                    ) : (
                                      <Typography sx={{ fontSize: '0.85rem', color: '#999' }}>
                                        Pending
                                      </Typography>
                                    )}
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              );
            };

            return (
              <>
                {renderEnrollmentTable(mainDegree, 'Main Degree', '#8B3A3A')}
                {renderEnrollmentTable(concentration, 'Concentration', '#1976D2')}
                {renderEnrollmentTable(minor, 'Minor', '#F57C00')}

                {(mainDegree.length + concentration.length + minor.length) === 0 && (
                  <Box sx={{ p: 3, textAlign: 'center' }}>
                    <Typography color="textSecondary">No enrollments found</Typography>
                  </Box>
                )}
              </>
            );
          })()}
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentRecordPage;
