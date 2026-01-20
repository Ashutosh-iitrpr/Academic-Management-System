'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Rating,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import studentApi from '@/lib/api/studentApi';
import { toast } from 'sonner';

// Icons
import SearchIcon from '@mui/icons-material/Search';
import FeedbackIcon from '@mui/icons-material/Feedback';
import SendIcon from '@mui/icons-material/Send';

interface FeedbackForm {
  id: string;
  title: string;
  description?: string;
  courseOffering: {
    semester: string;
    course: {
      code: string;
      name: string;
    };
    instructor: {
      name: string;
    };
  };
}

const StudentFeedbackPage = () => {
  const [loading, setLoading] = useState(true);
  const [forms, setForms] = useState<FeedbackForm[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'CLOSED'>('ALL');
  const [selectedForm, setSelectedForm] = useState<FeedbackForm | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Feedback model
  const [ratingContent, setRatingContent] = useState<number | null>(0);
  const [ratingTeaching, setRatingTeaching] = useState<number | null>(0);
  const [ratingEvaluation, setRatingEvaluation] = useState<number | null>(0);
  const [ratingOverall, setRatingOverall] = useState<number | null>(0);
  const [comments, setComments] = useState('');

  const fetchForms = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getAvailableFeedback();
      setForms(data);
    } catch (error: any) {
      console.error('Failed to fetch feedback forms:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch feedback forms');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  const filteredForms = useMemo(() => {
    let list = forms;
    if (statusFilter !== 'ALL') {
      // Since backend only returns open forms, filter client-side if needed
      // For now we show all returned forms
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(f =>
        f.courseOffering.course.code.toLowerCase().includes(q) ||
        f.courseOffering.course.name.toLowerCase().includes(q) ||
        f.title.toLowerCase().includes(q)
      );
    }
    return list;
  }, [forms, statusFilter, searchQuery]);

  const openSubmitDialog = (form: FeedbackForm) => {
    setSelectedForm(form);
    setRatingContent(0);
    setRatingTeaching(0);
    setRatingEvaluation(0);
    setRatingOverall(0);
    setComments('');
    setDialogOpen(true);
  };

  const handleSubmitFeedback = async () => {
    if (!selectedForm) return;
    try {
      setSubmitting(true);
      await studentApi.submitFeedback(selectedForm.id, {
        ratingContent: ratingContent || 0,
        ratingTeaching: ratingTeaching || 0,
        ratingEvaluation: ratingEvaluation || 0,
        ratingOverall: ratingOverall || 0,
        comments: comments?.trim() || undefined,
      });
      toast.success('Feedback submitted successfully');
      setDialogOpen(false);
      // Refresh forms in case any state changes
      await fetchForms();
    } catch (error: any) {
      console.error('Failed to submit feedback:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="STUDENT">
      <DashboardLayout pageTitle="Feedback Forms">
        <Box>
          {/* Search & Filter */}
          <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6} md={8}>
                  <TextField
                    fullWidth
                    placeholder="Search by course code, name, or title..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon sx={{ color: '#999' }} />
                        </InputAdornment>
                      ),
                    }}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4}>
                  <FormControl fullWidth size="small">
                    <InputLabel>Status</InputLabel>
                    <Select value={statusFilter} label="Status" onChange={e => setStatusFilter(e.target.value as any)}>
                      <MenuItem value="ALL">All</MenuItem>
                      <MenuItem value="OPEN">Open</MenuItem>
                      <MenuItem value="CLOSED">Closed</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

          {/* Content */}
          {loading ? (
            <LoadingSkeleton type="card" count={3} />
          ) : filteredForms.length === 0 ? (
            <Alert severity="info">No feedback forms found.</Alert>
          ) : (
            <Grid container spacing={2}>
              {filteredForms.map(form => (
                <Grid item xs={12} sm={6} md={4} key={form.id}>
                  <Card sx={{ border: '1px solid #e0e0e0', height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <FeedbackIcon sx={{ color: '#1976d2' }} />
                        <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                          {form.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                        {form.description || 'Course feedback'}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                        <Chip label={form.courseOffering.course.code} size="small" color="primary" variant="outlined" />
                        <Chip label={form.courseOffering.course.name} size="small" variant="outlined" />
                        <Chip label="Open" size="small" color="success" />
                      </Box>
                      <Button
                        fullWidth
                        variant="contained"
                        endIcon={<SendIcon />}
                        onClick={() => openSubmitDialog(form)}
                        sx={{
                          backgroundColor: '#1976d2',
                          '&:hover': { backgroundColor: '#1565c0' },
                        }}
                      >
                        Fill Feedback
                      </Button>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}

          {/* Submit Dialog */}
          <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
            <DialogTitle>Submit Feedback</DialogTitle>
            <DialogContent>
              {selectedForm && (
                <Box sx={{ pt: 1 }}>
                  <Typography variant="subtitle2" sx={{ color: '#666', mb: 1 }}>
                    {selectedForm.courseOffering.course.code} • {selectedForm.courseOffering.course.name}
                  </Typography>

                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 1 }}>
                    <Box>
                      <Typography variant="body2">Content Quality</Typography>
                      <Rating value={ratingContent} onChange={(_, v) => setRatingContent(v)} />
                    </Box>
                    <Box>
                      <Typography variant="body2">Teaching Quality</Typography>
                      <Rating value={ratingTeaching} onChange={(_, v) => setRatingTeaching(v)} />
                    </Box>
                    <Box>
                      <Typography variant="body2">Evaluation Fairness</Typography>
                      <Rating value={ratingEvaluation} onChange={(_, v) => setRatingEvaluation(v)} />
                    </Box>
                    <Box>
                      <Typography variant="body2">Overall</Typography>
                      <Rating value={ratingOverall} onChange={(_, v) => setRatingOverall(v)} />
                    </Box>
                  </Box>

                  <TextField
                    fullWidth
                    multiline
                    minRows={3}
                    sx={{ mt: 2 }}
                    placeholder="Additional comments (optional)"
                    value={comments}
                    onChange={e => setComments(e.target.value)}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button variant="contained" onClick={handleSubmitFeedback} disabled={submitting}>
                Submit
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default StudentFeedbackPage;
