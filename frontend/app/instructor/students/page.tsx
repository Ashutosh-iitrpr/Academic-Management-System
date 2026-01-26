'use client';

import React, { useState } from 'react';
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import { getAxiosClient } from '@/lib/api/axiosClient';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import SearchIcon from '@mui/icons-material/Search';
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

interface StudentTranscript {
  id: string;
  name: string;
  email: string;
  entrynumber?: string;
  enrollments?: Enrollment[];
  mainDegree?: Enrollment[];
  concentration?: Enrollment[];
  minor?: Enrollment[];
}

const InstructorStudentsPage = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [transcript, setTranscript] = useState<StudentTranscript | null>(null);
  const [error, setError] = useState('');
  const [searchAttempted, setSearchAttempted] = useState(false);

  const axiosClient = getAxiosClient();

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a student ID or entry number');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setSearchAttempted(true);

      // Try to search by entry number
      const response = await axiosClient.get(`/instructor/transcript/entry/${searchQuery}`);
      setTranscript(response.data);
    } catch (err) {
      setError('Student not found. Please check the entry number and try again.');
      setTranscript(null);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
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

  const handleDownloadTranscript = () => {
    if (!transcript) return;

    const mainDegree = transcript.mainDegree || [];
    const concentration = transcript.concentration || [];
    const minor = transcript.minor || [];

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
          <p><strong>Name:</strong> ${transcript.name}</p>
          <p><strong>Entry Number:</strong> ${transcript.entrynumber || 'N/A'}</p>
          <p><strong>Email:</strong> ${transcript.email}</p>
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

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="Student Transcripts">
        <Box sx={{ mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <DescriptionIcon sx={{ fontSize: 28, color: '#8B3A3A' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              Student Transcripts
            </Typography>
          </Box>

          {/* Search Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  placeholder="Enter student entry number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleKeyPress}
                  size="small"
                  variant="outlined"
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: '#999' }} />,
                  }}
                />
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#8B3A3A' }}
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} /> : 'Search'}
                </Button>
              </Box>
            </CardContent>
          </Card>

          {/* Error Message */}
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {/* No Results */}
          {searchAttempted && !transcript && !loading && !error && (
            <Alert severity="info" sx={{ mb: 3 }}>
              No student found. Please verify the entry number and try again.
            </Alert>
          )}

          {/* Transcript Display */}
          {transcript && (
            <>
              {/* Student Info */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12}>
                  <Card>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <Box>
                          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                            {transcript.name}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Entry Number: {transcript.entrynumber || 'N/A'}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Email: {transcript.email}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <Button
                            startIcon={<DownloadIcon />}
                            variant="contained"
                            sx={{ backgroundColor: '#8B3A3A' }}
                            onClick={handleDownloadTranscript}
                          >
                            Download PDF
                          </Button>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>

                {/* Summary Stats */}
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Current GPA
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {calculateGPA(
                          [
                            ...(transcript.mainDegree || []),
                            ...(transcript.concentration || []),
                            ...(transcript.minor || []),
                          ]
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Credits Earned
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {calculateCredits(
                          [
                            ...(transcript.mainDegree || []),
                            ...(transcript.concentration || []),
                            ...(transcript.minor || []),
                          ]
                        )}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <Card>
                    <CardContent>
                      <Typography color="textSecondary" gutterBottom>
                        Courses Taken
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700 }}>
                        {(transcript.mainDegree?.length || 0) +
                          (transcript.concentration?.length || 0) +
                          (transcript.minor?.length || 0)}
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
                        {[
                          ...(transcript.mainDegree || []),
                          ...(transcript.concentration || []),
                          ...(transcript.minor || []),
                        ].filter((e) => e.status === 'COMPLETED').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Helper Component for Enrollment Table by Semester */}
              {(() => {
                const renderEnrollmentTable = (
                  enrollments: Enrollment[],
                  typeLabel: string,
                  typeColor: string
                ) => {
                  if (enrollments.length === 0) {
                    return null;
                  }

                  const grouped = groupBySemester(enrollments);
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
                          GPA: {calculateGPA(enrollments)} | Credits: {calculateCredits(enrollments)}
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
                    {renderEnrollmentTable(
                      transcript.mainDegree || [],
                      'Main Degree',
                      '#8B3A3A'
                    )}
                    {renderEnrollmentTable(
                      transcript.concentration || [],
                      'Concentration',
                      '#1976D2'
                    )}
                    {renderEnrollmentTable(
                      transcript.minor || [],
                      'Minor',
                      '#F57C00'
                    )}

                    {((transcript.mainDegree?.length || 0) +
                      (transcript.concentration?.length || 0) +
                      (transcript.minor?.length || 0)) === 0 && (
                      <Box sx={{ p: 3, textAlign: 'center' }}>
                        <Typography color="textSecondary">No enrollments found</Typography>
                      </Box>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorStudentsPage;
