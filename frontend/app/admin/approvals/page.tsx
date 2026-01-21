'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
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
  TextField,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/lib/auth/AuthContext';
import { getAxiosClient } from '@/lib/api/axiosClient';

// Icons
import DescriptionIcon from '@mui/icons-material/Description';
import CheckIcon from '@mui/icons-material/Check';
import CloseIcon from '@mui/icons-material/Close';
import VisibilityIcon from '@mui/icons-material/Visibility';

interface CourseOffering {
  id: string;
  course: { name: string; code: string };
  instructor: { id: string; name: string; email: string };
  status: string;
  enrollments: Array<{ id: string }>;
  createdAt: string;
}

const ApprovalsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [approving, setApproving] = useState(false);

  const axiosClient = getAxiosClient();

  useEffect(() => {
    fetchPendingOfferings();
  }, []);

  const fetchPendingOfferings = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/admin/course-offerings');
      setOfferings(response.data);
    } catch (error) {
      console.error('Error fetching pending offerings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (offeringId: string) => {
    try {
      setApproving(true);
      await axiosClient.patch(`/admin/course-offerings/${offeringId}/approve`);
      fetchPendingOfferings();
      setDetailsOpen(false);
    } catch (error) {
      console.error('Error approving offering:', error);
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (offeringId: string) => {
    try {
      setApproving(true);
      await axiosClient.patch(`/admin/course-offerings/${offeringId}/reject`, {
        reason: rejectReason,
      });
      fetchPendingOfferings();
      setRejectOpen(false);
      setRejectReason('');
    } catch (error) {
      console.error('Error rejecting offering:', error);
    } finally {
      setApproving(false);
    }
  };

  const handleViewDetails = (offering: CourseOffering) => {
    setSelectedOffering(offering);
    setDetailsOpen(true);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout pageTitle="Course Approvals">
          <LoadingSkeleton count={5} />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout pageTitle="Course Approvals">
        <Box sx={{ mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
            <DescriptionIcon sx={{ fontSize: 28, color: '#8B3A3A' }} />
            <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
              Instructor Course Approvals
            </Typography>
            <Chip
              label={`${offerings.length} Pending`}
              color="warning"
              sx={{ ml: 'auto' }}
            />
          </Box>

          {/* Pending Approvals Table */}
          <Card>
            <CardContent sx={{ p: 0, overflow: 'auto' }}>
              {offerings.length === 0 ? (
                <Box sx={{ p: 3, textAlign: 'center' }}>
                  <Typography color="textSecondary">No pending instructor course approvals</Typography>
                </Box>
              ) : (
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                      <TableCell sx={{ fontWeight: 700 }}>Course</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Instructor Name</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Instructor Email</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Submission Date</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {offerings.map((offering) => (
                      <TableRow key={offering.id} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                        <TableCell>
                          <Box>
                            <Typography sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                              {offering.course.code}
                            </Typography>
                            <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                              {offering.course.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontWeight: 500 }}>
                            {offering.instructor.name}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.9rem', color: '#666' }}>
                            {offering.instructor.email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography sx={{ fontSize: '0.9rem', color: '#999' }}>
                            {new Date(offering.createdAt).toLocaleDateString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewDetails(offering)}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Approve Instructor">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => handleApprove(offering.id)}
                              disabled={approving}
                            >
                              <CheckIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Reject">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedOffering(offering);
                                setRejectOpen(true);
                              }}
                              disabled={approving}
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Statistics */}
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Card sx={{ flex: 1 }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending Instructor Approvals
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#FFA500' }}>
                  {offerings.length}
                </Typography>
              </CardContent>
            </Card>
          </Box>
        </Box>

        {/* Details Dialog */}
        <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Instructor Course Offering Details</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {selectedOffering && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666' }}>
                    Course
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedOffering.course.code} - {selectedOffering.course.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666' }}>
                    Instructor Name
                  </Typography>
                  <Typography sx={{ fontWeight: 500 }}>
                    {selectedOffering.instructor.name}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666' }}>
                    Instructor Email
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#999' }}>
                    {selectedOffering.instructor.email}
                  </Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#666' }}>
                    Course Submission Date
                  </Typography>
                  <Typography sx={{ fontSize: '0.9rem', color: '#999' }}>
                    {new Date(selectedOffering.createdAt).toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDetailsOpen(false)}>Close</Button>
            {selectedOffering && (
              <>
                <Button
                  color="error"
                  onClick={() => {
                    setRejectOpen(true);
                    setDetailsOpen(false);
                  }}
                  disabled={approving}
                >
                  Reject
                </Button>
                <Button
                  variant="contained"
                  sx={{ backgroundColor: '#8B3A3A' }}
                  onClick={() => handleApprove(selectedOffering.id)}
                  disabled={approving}
                >
                  Approve Instructor
                </Button>
              </>
            )}
          </DialogActions>
        </Dialog>

        {/* Reject Dialog */}
        <Dialog open={rejectOpen} onClose={() => setRejectOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Reject Instructor Course Offering</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <TextField
              fullWidth
              multiline
              rows={4}
              label="Reason for Rejection"
              placeholder="Enter reason..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              variant="outlined"
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectOpen(false)} disabled={approving}>
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => selectedOffering && handleReject(selectedOffering.id)}
              disabled={approving || !rejectReason.trim()}
            >
              Reject
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default ApprovalsPage;
