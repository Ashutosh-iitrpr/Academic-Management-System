'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  CircularProgress,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import courseProposalApi, { CourseProposal, CreateCourseProposalDto } from '@/lib/api/courseProposalApi';
import { toast } from 'sonner';
import AddIcon from '@mui/icons-material/Add';
import InfoIcon from '@mui/icons-material/Info';

const InstructorNewCourse = () => {
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<CourseProposal[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    code: '',
    name: '',
    credits: '',
    ltpsc: '',
    description: '',
  });

  const fetchProposals = async () => {
    try {
      setLoading(true);
      const data = await courseProposalApi.getMyProposals();
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

  const handleOpenDialog = () => {
    setFormData({ code: '', name: '', credits: '', ltpsc: '', description: '' });
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!formData.code || !formData.name || !formData.credits || !formData.ltpsc) {
        toast.error('Please fill all required fields');
        return;
      }

      const creditsNum = Number(formData.credits);
      if (!Number.isFinite(creditsNum) || creditsNum <= 0) {
        toast.error('Credits must be a positive number');
        return;
      }

      // Validate LTPSC format
      if (!/^\d+-\d+-\d+-\d+$/.test(formData.ltpsc)) {
        toast.error('LTPSC format must be like 3-0-0-3');
        return;
      }

      setSubmitting(true);
      const payload: CreateCourseProposalDto = {
        code: formData.code.trim(),
        name: formData.name.trim(),
        credits: creditsNum,
        ltpsc: formData.ltpsc.trim(),
        description: formData.description.trim() || undefined,
      };

      await courseProposalApi.createProposal(payload);
      toast.success('Course proposal submitted successfully');
      handleCloseDialog();
      fetchProposals();
    } catch (error: any) {
      console.error('Failed to submit proposal:', error);
      toast.error(error.response?.data?.message || 'Failed to submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="Propose New Course">
        <Box>
          {/* Header */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                Course Proposals
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Submit new course proposals for admin approval
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                backgroundColor: '#8B3A3A',
                '&:hover': { backgroundColor: '#6B2A2A' },
                textTransform: 'none',
                fontSize: '1rem',
              }}
              onClick={handleOpenDialog}
            >
              Propose New Course
            </Button>
          </Box>

          {/* Proposals Grid */}
          {loading ? (
            <LoadingSkeleton type="grid" count={3} />
          ) : proposals.length === 0 ? (
            <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center', py: 6 }}>
              <InfoIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                No Course Proposals Yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                Propose a new course to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#8B3A3A',
                  '&:hover': { backgroundColor: '#6B2A2A' },
                }}
                onClick={handleOpenDialog}
              >
                Propose First Course
              </Button>
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

                      <Box sx={{ mb: 3, textAlign: 'center', p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          CREDITS
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                          {proposal.credits}
                        </Typography>
                      </Box>

                      {proposal.ltpsc && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                            LTPSC
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {proposal.ltpsc}
                          </Typography>
                        </Box>
                      )}

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

                      <Box sx={{ fontSize: '0.75rem', color: '#999' }}>
                        {proposal.createdAt && (
                          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                            Submitted: {new Date(proposal.createdAt).toLocaleDateString()}
                          </Typography>
                        )}
                        {proposal.approvedAt && (
                          <Typography variant="caption" display="block">
                            Approved: {new Date(proposal.approvedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Create Proposal Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            Propose New Course
          </DialogTitle>
          <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Course Code"
              fullWidth
              placeholder="e.g., CS101"
              value={formData.code}
              onChange={(e) => handleInputChange('code', e.target.value)}
              required
            />
            <TextField
              label="Course Name"
              fullWidth
              placeholder="Introduction to Programming"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
            <TextField
              label="Credits"
              type="number"
              fullWidth
              placeholder="3"
              value={formData.credits}
              onChange={(e) => handleInputChange('credits', e.target.value)}
              inputProps={{ min: 1 }}
              required
            />
            <TextField
              label="LTPSC"
              fullWidth
              placeholder="e.g., 3-0-0-3"
              value={formData.ltpsc}
              onChange={(e) => handleInputChange('ltpsc', e.target.value)}
              helperText="Format: Lecture-Tutorial-Practical-Self Study (e.g., 3-0-0-3)"
              required
            />
            <TextField
              label="Description (optional)"
              fullWidth
              multiline
              minRows={3}
              placeholder="Brief course description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              variant="contained"
              sx={{
                backgroundColor: '#8B3A3A',
                '&:hover': { backgroundColor: '#6B2A2A' },
              }}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 'Submit Proposal'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorNewCourse;
