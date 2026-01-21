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
import PrintIcon from '@mui/icons-material/Print';

interface Enrollment {
  id: string;
  status: string;
  grade?: string;
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
  enrollments: Enrollment[];
}

const TranscriptLookupPage = () => {
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

      // Try to search by entry number first
      const response = await axiosClient.get(`/admin/transcript/entry/${searchQuery}`);
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

  const calculateGPA = (enrollments: Enrollment[]) => {
    if (enrollments.length === 0) return 0;
    // Mock calculation - you can implement actual GPA calculation
    return (3.5 + Math.random() * 0.5).toFixed(2);
  };

  const calculateCredits = (enrollments: Enrollment[]) => {
    return enrollments.reduce((sum, e) => {
      if (e.status === 'COMPLETED') {
        return sum + e.courseOffering.course.credits;
      }
      return sum;
    }, 0);
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

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout pageTitle="Transcript Lookup">
        <Box sx={{ mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <DescriptionIcon sx={{ fontSize: 28, color: '#8B3A3A' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              Transcript Lookup
            </Typography>
          </Box>

          {/* Search Section */}
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <TextField
                  fullWidth
                  placeholder="Enter student entry number or ID..."
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
                            variant="outlined"
                            size="small"
                          >
                            Download
                          </Button>
                          <Button
                            startIcon={<PrintIcon />}
                            variant="outlined"
                            size="small"
                          >
                            Print
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
                        {calculateGPA(transcript.enrollments)}
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
                        {calculateCredits(transcript.enrollments)}
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
                        {transcript.enrollments.length}
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
                        {transcript.enrollments.filter((e) => e.status === 'COMPLETED').length}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>

              {/* Enrollment Details */}
              <Card>
                <CardContent sx={{ p: 0, overflow: 'auto' }}>
                  {transcript.enrollments.length === 0 ? (
                    <Box sx={{ p: 3, textAlign: 'center' }}>
                      <Typography color="textSecondary">No enrollments found</Typography>
                    </Box>
                  ) : (
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 700 }}>Course Code</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Course Name</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Credits</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Instructor</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Grade</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {transcript.enrollments.map((enrollment) => (
                          <TableRow
                            key={enrollment.id}
                            sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}
                          >
                            <TableCell>
                              <Typography sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                                {enrollment.courseOffering.course.code}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontWeight: 500 }}>
                                {enrollment.courseOffering.course.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`${enrollment.courseOffering.course.credits} Credits`}
                                size="small"
                                variant="outlined"
                              />
                            </TableCell>
                            <TableCell>
                              <Typography sx={{ fontSize: '0.9rem' }}>
                                {enrollment.courseOffering.instructor.name}
                              </Typography>
                            </TableCell>
                            <TableCell>
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
                            <TableCell>
                              {enrollment.grade ? (
                                <Chip
                                  label={enrollment.grade}
                                  sx={{
                                    backgroundColor: getGradeColor(enrollment.grade),
                                    color: '#fff',
                                    fontWeight: 700,
                                  }}
                                  size="small"
                                />
                              ) : (
                                <Typography sx={{ fontSize: '0.9rem', color: '#999' }}>
                                  Pending
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default TranscriptLookupPage;
