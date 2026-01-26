'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import { useAuth } from '@/lib/auth/AuthContext';
import advisorApi, { PendingAdvisorEnrollment } from '@/lib/api/advisorApi';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

const AdvisorDashboardPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<PendingAdvisorEnrollment[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedEnrollment, setSelectedEnrollment] = useState<PendingAdvisorEnrollment | null>(null);
  const [actionDialog, setActionDialog] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (user?.isFacultyAdvisor) {
      fetchEnrollments();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const data = await advisorApi.getPendingEnrollments();
      setEnrollments(data);
    } catch (err: any) {
      console.error('Error fetching enrollments:', err);
      setError(err.response?.data?.message || 'Failed to fetch pending enrollments');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (enrollment: PendingAdvisorEnrollment) => {
    setSelectedEnrollment(enrollment);
    setAction('approve');
    setActionDialog(true);
  };

  const handleReject = (enrollment: PendingAdvisorEnrollment) => {
    setSelectedEnrollment(enrollment);
    setAction('reject');
    setActionDialog(true);
  };

  const confirmAction = async () => {
    if (!selectedEnrollment || !action) return;

    try {
      setActionLoading(true);
      if (action === 'approve') {
        await advisorApi.approveEnrollment(selectedEnrollment.id);
        setSuccess('Enrollment approved successfully');
      } else {
        await advisorApi.rejectEnrollment(selectedEnrollment.id);
        setSuccess('Enrollment rejected successfully');
      }
      setActionDialog(false);
      setSelectedEnrollment(null);
      setAction(null);
      await fetchEnrollments();
    } catch (err: any) {
      console.error('Error processing enrollment:', err);
      setError(err.response?.data?.message || 'Failed to process enrollment');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="INSTRUCTOR">
        <DashboardLayout pageTitle="Faculty Advisor Dashboard">
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <CircularProgress />
          </Box>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="Faculty Advisor Dashboard">
        <Box sx={{ p: 3 }}>
          {!user?.isFacultyAdvisor ? (
            <Card>
              <CardContent sx={{ textAlign: 'center', py: 8 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 2, color: '#d32f2f' }}>
                  Cannot Access Page
                </Typography>
                <Typography variant="h6" sx={{ color: '#666', mb: 4 }}>
                  Not a Faculty Advisor
                </Typography>
                <Typography variant="body1" sx={{ color: '#999' }}>
                  You do not have permission to access the Faculty Advisor Dashboard.
                </Typography>
                <Typography variant="body2" sx={{ color: '#999' }}>
                  Only instructors marked as faculty advisors can access this page.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <>
              <Box sx={{ mb: 4 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  Faculty Advisor Dashboard
                </Typography>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Review and approve student course enrollments
                </Typography>
              </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
              {success}
            </Alert>
          )}

          <Card>
            <CardContent>
              <Box sx={{ mb: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Pending Enrollments ({enrollments.length})
                </Typography>
              </Box>

              {enrollments.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" sx={{ color: '#999' }}>
                    No pending enrollments for approval
                  </Typography>
                </Box>
              ) : (
                <Box sx={{ overflowX: 'auto' }}>
                  <Table>
                    <TableHead>
                      <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                        <TableCell sx={{ fontWeight: 600 }}>Student</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Entry Number</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Course</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Code</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Credits</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Instructor</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Semester</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Requested</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {enrollments.map((enrollment) => (
                        <TableRow key={enrollment.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                          <TableCell>{enrollment.student.name}</TableCell>
                          <TableCell>{enrollment.student.entryNumber}</TableCell>
                          <TableCell>{enrollment.courseOffering.course.name}</TableCell>
                          <TableCell>{enrollment.courseOffering.course.code}</TableCell>
                          <TableCell>{enrollment.courseOffering.course.credits}</TableCell>
                          <TableCell>{enrollment.courseOffering.instructor.name}</TableCell>
                          <TableCell>{enrollment.courseOffering.semester}</TableCell>
                          <TableCell>
                            {new Date(enrollment.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <Button
                                size="small"
                                variant="contained"
                                sx={{
                                  backgroundColor: '#4CAF50',
                                  color: 'white',
                                  '&:hover': { backgroundColor: '#45a049' },
                                }}
                                startIcon={<CheckCircleIcon />}
                                onClick={() => handleApprove(enrollment)}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="contained"
                                sx={{
                                  backgroundColor: '#f44336',
                                  color: 'white',
                                  '&:hover': { backgroundColor: '#da190b' },
                                }}
                                startIcon={<CancelIcon />}
                                onClick={() => handleReject(enrollment)}
                              >
                                Reject
                              </Button>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Action Confirmation Dialog */}
          <Dialog open={actionDialog} onClose={() => setActionDialog(false)} maxWidth="sm" fullWidth>
            <DialogTitle sx={{ fontWeight: 700 }}>
              {action === 'approve' ? 'Approve Enrollment' : 'Reject Enrollment'}
            </DialogTitle>
            <DialogContent sx={{ pt: 2 }}>
              {selectedEnrollment && (
                <Box>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Student:</strong> {selectedEnrollment.student.name} ({selectedEnrollment.student.entryNumber})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    <strong>Course:</strong> {selectedEnrollment.courseOffering.course.name} (
                    {selectedEnrollment.courseOffering.course.code})
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    <strong>Instructor:</strong> {selectedEnrollment.courseOffering.instructor.name}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      backgroundColor: action === 'approve' ? '#e8f5e9' : '#ffebee',
                      p: 2,
                      borderRadius: 1,
                      color: action === 'approve' ? '#2e7d32' : '#c62828',
                    }}
                  >
                    {action === 'approve'
                      ? 'This will mark the enrollment as "Enrolled" and the student will be able to see the course in their dashboard.'
                      : 'This will reject the enrollment and the student will see "Rejected" status.'}
                  </Typography>
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setActionDialog(false)} disabled={actionLoading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                sx={{
                  backgroundColor: action === 'approve' ? '#4CAF50' : '#f44336',
                  color: 'white',
                }}
                onClick={confirmAction}
                disabled={actionLoading}
              >
                {actionLoading ? <CircularProgress size={24} /> : action === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogActions>
          </Dialog>
            </>
          )}
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdvisorDashboardPage;
