'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import courseProposalApi, { CourseProposal } from '@/lib/api/courseProposalApi';
import { toast } from 'sonner';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';

const AdminCourseProposals = () => {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<CourseProposal[]>([]);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await courseProposalApi.getAllPendingProposals();
      setProposals(data);
    } catch (error: any) {
      console.error('Failed to fetch proposals:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch proposals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProposals();
  }, []);

  const handleApprove = async (proposalId: string) => {
    try {
      setProcessingId(proposalId);
      await courseProposalApi.approveProposal(proposalId);
      toast.success('Course proposal approved successfully');
      fetchProposals();
    } catch (error: any) {
      console.error('Failed to approve proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to approve proposal');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (proposalId: string) => {
    try {
      setProcessingId(proposalId);
      await courseProposalApi.rejectProposal(proposalId);
      toast.success('Course proposal rejected');
      fetchProposals();
    } catch (error: any) {
      console.error('Failed to reject proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to reject proposal');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout pageTitle="Course Proposals">
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
              Pending Course Proposals
            </Typography>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Review and approve new course proposals from instructors
            </Typography>
          </Box>

          {/* Proposals Grid */}
          {loading ? (
            <LoadingSkeleton type="grid" count={3} />
          ) : proposals.length === 0 ? (
            <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center', py: 6 }}>
              <InfoIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                No Pending Proposals
              </Typography>
              <Typography variant="body2" sx={{ color: '#999' }}>
                All course proposals have been reviewed
              </Typography>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {proposals.map(proposal => (
                <Grid item xs={12} sm={6} md={4} key={proposal.id}>
                  <Card
                    sx={{
                      border: '1px solid #e0e0e0',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                        transform: 'translateY(-2px)',
                      },
                    }}
                  >
                    <CardContent>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {proposal.code}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          {proposal.name}
                        </Typography>
                        <StatusChip status={proposal.status as any} />
                      </Box>

                      {/* Instructor Info */}
                      <Box sx={{ mb: 2, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                          INSTRUCTOR
                        </Typography>
                        <Typography variant="body2">{proposal.instructor?.name}</Typography>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {proposal.instructor?.email}
                        </Typography>
                      </Box>
                        {proposal.description && (
                          <Box sx={{ mb: 2 }}>
                            <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                              DESCRIPTION
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#555' }}>
                              {proposal.description}
                            </Typography>
                          </Box>
                        )}

                      {/* Credits */}
                      <Box sx={{ mb: 3, textAlign: 'center', p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          CREDITS
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                          {proposal.credits}
                        </Typography>
                      </Box>

                      {/* Dates */}
                      <Box sx={{ mb: 3, fontSize: '0.75rem', color: '#999' }}>
                        {proposal.createdAt && (
                          <Typography variant="caption" display="block">
                            Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          size="small"
                          variant="contained"
                          sx={{
                            backgroundColor: '#4caf50',
                            '&:hover': { backgroundColor: '#388e3c' },
                            textTransform: 'none',
                          }}
                          startIcon={<CheckCircleIcon />}
                          onClick={() => handleApprove(proposal.id)}
                          disabled={processingId === proposal.id}
                        >
                          Approve
                        </Button>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#f44336',
                            color: '#f44336',
                            textTransform: 'none',
                            '&:hover': {
                              borderColor: '#d32f2f',
                              backgroundColor: '#ffebee',
                            },
                          }}
                          startIcon={<CancelIcon />}
                          onClick={() => handleReject(proposal.id)}
                          disabled={processingId === proposal.id}
                        >
                          Reject
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default AdminCourseProposals;
