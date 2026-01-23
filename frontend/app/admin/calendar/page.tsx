'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/lib/auth/AuthContext';
import { getAxiosClient } from '@/lib/api/axiosClient';

// Icons
import EventIcon from '@mui/icons-material/Event';
import EditIcon from '@mui/icons-material/Edit';

interface AcademicCalendar {
  id?: string;
  semesterName?: string;
  semesterStartDate?: string;
  semesterEndDate?: string;
  enrollmentStart: string;
  enrollmentEnd: string;
  dropDeadline: string;
  auditDeadline: string;
  semester?: string;
  year?: number;
}

const CalendarPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [calendar, setCalendar] = useState<AcademicCalendar | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState<AcademicCalendar>({
    enrollmentStart: '',
    enrollmentEnd: '',
    dropDeadline: '',
    auditDeadline: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const axiosClient = getAxiosClient();

  useEffect(() => {
    fetchCalendar();
  }, []);

  const fetchCalendar = async () => {
    try {
      setLoading(true);
      const response = await axiosClient.get('/admin/academic-calendar');
      setCalendar(response.data);
      setFormData(response.data);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (edit = false) => {
    setEditMode(edit);
    if (!edit) {
      setFormData({
        semesterName: '',
        semesterStartDate: '',
        semesterEndDate: '',
        enrollmentStart: '',
        enrollmentEnd: '',
        dropDeadline: '',
        auditDeadline: '',
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditMode(false);
    setMessage('');
  };

  const handleInputChange = (field: keyof AcademicCalendar, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (
      !formData.semesterName ||
      !formData.semesterStartDate ||
      !formData.semesterEndDate ||
      !formData.enrollmentStart ||
      !formData.enrollmentEnd ||
      !formData.dropDeadline ||
      !formData.auditDeadline
    ) {
      setMessage('Please fill in all fields');
      return;
    }

    try {
      setSubmitting(true);
      
      // Convert datetime-local format to ISO 8601
      const payload = {
        semesterName: formData.semesterName,
        semesterStartDate: new Date(formData.semesterStartDate).toISOString(),
        semesterEndDate: new Date(formData.semesterEndDate).toISOString(),
        enrollmentStart: new Date(formData.enrollmentStart).toISOString(),
        enrollmentEnd: new Date(formData.enrollmentEnd).toISOString(),
        dropDeadline: new Date(formData.dropDeadline).toISOString(),
        auditDeadline: new Date(formData.auditDeadline).toISOString(),
      };

      if (editMode && calendar) {
        await axiosClient.patch('/admin/academic-calendar', payload);
        setMessage('Calendar updated successfully!');
      } else {
        await axiosClient.post('/admin/academic-calendar', payload);
        setMessage('Calendar created successfully!');
      }
      fetchCalendar();
      setTimeout(() => {
        handleCloseDialog();
      }, 1500);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Error saving calendar. Please try again.';
      setMessage(errorMsg);
      console.error('Error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getDaysRemaining = (date: string) => {
    const now = new Date();
    const target = new Date(date);
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getDaysRemainingColor = (days: number) => {
    if (days < 0) return '#D32F2F';
    if (days < 7) return '#F57C00';
    if (days < 14) return '#FFA500';
    return '#2E7D32';
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="ADMIN">
        <DashboardLayout pageTitle="Academic Calendar">
          <LoadingSkeleton count={5} />
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="ADMIN">
      <DashboardLayout pageTitle="Academic Calendar">
        <Box sx={{ mb: 4 }}>
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <EventIcon sx={{ fontSize: 28, color: '#8B3A3A' }} />
              <Typography variant="h5" sx={{ fontWeight: 700, color: '#1a1a1a' }}>
                Academic Calendar
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              sx={{ backgroundColor: '#8B3A3A' }}
              onClick={() => handleOpenDialog(!!calendar)}
            >
              {calendar ? 'Edit Calendar' : 'Create Calendar'}
            </Button>
          </Box>

          {!calendar ? (
            <Alert severity="info">
              No academic calendar found. Create one to get started.
            </Alert>
          ) : (
            <Grid container spacing={3}>
              {/* Semester Header Card */}
              <Grid item xs={12}>
                <Card sx={{ backgroundColor: '#f5f5f5', borderLeft: '4px solid #8B3A3A' }}>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                      {calendar.semesterName}
                    </Typography>
                    <Typography sx={{ color: '#666', mt: 1 }}>
                      {new Date(calendar.semesterStartDate).toLocaleDateString()} to {new Date(calendar.semesterEndDate).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Timeline Cards */}
              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                      SEMESTER START
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {new Date(calendar.semesterStartDate).toLocaleDateString()}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: getDaysRemainingColor(getDaysRemaining(calendar.semesterStartDate)),
                      }}
                    >
                      {getDaysRemaining(calendar.semesterStartDate) > 0
                        ? `In ${getDaysRemaining(calendar.semesterStartDate)} days`
                        : `${Math.abs(getDaysRemaining(calendar.semesterStartDate))} days ago`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                      SEMESTER END
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {new Date(calendar.semesterEndDate).toLocaleDateString()}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: getDaysRemainingColor(getDaysRemaining(calendar.semesterEndDate)),
                      }}
                    >
                      {getDaysRemaining(calendar.semesterEndDate) > 0
                        ? `In ${getDaysRemaining(calendar.semesterEndDate)} days`
                        : `${Math.abs(getDaysRemaining(calendar.semesterEndDate))} days ago`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                      ENROLLMENT START
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {new Date(calendar.enrollmentStart).toLocaleDateString()}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: getDaysRemainingColor(getDaysRemaining(calendar.enrollmentStart)),
                      }}
                    >
                      {getDaysRemaining(calendar.enrollmentStart) > 0
                        ? `In ${getDaysRemaining(calendar.enrollmentStart)} days`
                        : `${Math.abs(getDaysRemaining(calendar.enrollmentStart))} days ago`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                      ENROLLMENT END
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {new Date(calendar.enrollmentEnd).toLocaleDateString()}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: getDaysRemainingColor(getDaysRemaining(calendar.enrollmentEnd)),
                      }}
                    >
                      {getDaysRemaining(calendar.enrollmentEnd) > 0
                        ? `In ${getDaysRemaining(calendar.enrollmentEnd)} days`
                        : `${Math.abs(getDaysRemaining(calendar.enrollmentEnd))} days ago`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                      DROP DEADLINE
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {new Date(calendar.dropDeadline).toLocaleDateString()}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: getDaysRemainingColor(getDaysRemaining(calendar.dropDeadline)),
                      }}
                    >
                      {getDaysRemaining(calendar.dropDeadline) > 0
                        ? `In ${getDaysRemaining(calendar.dropDeadline)} days`
                        : `${Math.abs(getDaysRemaining(calendar.dropDeadline))} days ago`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={3}>
                <Card>
                  <CardContent>
                    <Typography color="textSecondary" gutterBottom sx={{ fontSize: '0.85rem' }}>
                      AUDIT DEADLINE
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                      {new Date(calendar.auditDeadline).toLocaleDateString()}
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        color: getDaysRemainingColor(getDaysRemaining(calendar.auditDeadline)),
                      }}
                    >
                      {getDaysRemaining(calendar.auditDeadline) > 0
                        ? `In ${getDaysRemaining(calendar.auditDeadline)} days`
                        : `${Math.abs(getDaysRemaining(calendar.auditDeadline))} days ago`}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>

              {/* Timeline Visualization */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                      Academic Calendar Timeline
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        overflowX: 'auto',
                        pb: 2,
                      }}
                    >
                      {[
                        { label: 'Semester Start', date: calendar.semesterStartDate },
                        { label: 'Enrollment Start', date: calendar.enrollmentStart },
                        { label: 'Enrollment End', date: calendar.enrollmentEnd },
                        { label: 'Drop Deadline', date: calendar.dropDeadline },
                        { label: 'Audit Deadline', date: calendar.auditDeadline },
                        { label: 'Semester End', date: calendar.semesterEndDate },
                      ].map((item, index, arr) => (
                        <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 'max-content' }}>
                          <Box
                            sx={{
                              p: 2,
                              border: '1px solid #ddd',
                              borderRadius: '8px',
                              textAlign: 'center',
                              minWidth: '120px',
                              backgroundColor: '#fff',
                            }}
                          >
                            <Typography sx={{ fontSize: '0.8rem', color: '#666', fontWeight: 600 }}>
                              {item.label}
                            </Typography>
                            <Typography sx={{ fontWeight: 700, mt: 1, fontSize: '0.9rem' }}>
                              {new Date(item.date).toLocaleDateString()}
                            </Typography>
                          </Box>
                          {index < arr.length - 1 && (
                            <Typography sx={{ color: '#999', fontSize: '1.5rem', fontWeight: 700 }}>→</Typography>
                          )}
                        </Box>
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Details Table */}
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ p: 0 }}>
                    <Table>
                      <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                          <TableCell sx={{ fontWeight: 700 }}>Event</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Time Remaining</TableCell>
                          <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {[
                          { label: 'Enrollment Start', date: calendar.enrollmentStart },
                          { label: 'Enrollment End', date: calendar.enrollmentEnd },
                          { label: 'Drop Deadline', date: calendar.dropDeadline },
                          { label: 'Audit Deadline', date: calendar.auditDeadline },
                        ].map((item) => (
                          <TableRow key={item.label} sx={{ '&:hover': { backgroundColor: '#f9f9f9' } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{item.label}</TableCell>
                            <TableCell>{new Date(item.date).toLocaleDateString()}</TableCell>
                            <TableCell>
                              {getDaysRemaining(item.date) > 0
                                ? `${getDaysRemaining(item.date)} days remaining`
                                : `Ended ${Math.abs(getDaysRemaining(item.date))} days ago`}
                            </TableCell>
                            <TableCell>
                              <Box
                                sx={{
                                  display: 'inline-block',
                                  width: 12,
                                  height: 12,
                                  borderRadius: '50%',
                                  backgroundColor: getDaysRemainingColor(getDaysRemaining(item.date)),
                                }}
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Edit/Create Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>
            {editMode ? 'Edit' : 'Create'} Academic Calendar
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {message && (
              <Alert severity={message.includes('Error') ? 'error' : 'success'} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                fullWidth
                label="Semester Name"
                placeholder="e.g., Spring 2026"
                value={formData.semesterName || ''}
                onChange={(e) => handleInputChange('semesterName', e.target.value)}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Semester Start Date"
                type="datetime-local"
                value={formData.semesterStartDate || ''}
                onChange={(e) => handleInputChange('semesterStartDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Semester End Date"
                type="datetime-local"
                value={formData.semesterEndDate || ''}
                onChange={(e) => handleInputChange('semesterEndDate', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Enrollment Start Date"
                type="datetime-local"
                value={formData.enrollmentStart}
                onChange={(e) => handleInputChange('enrollmentStart', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Enrollment End Date"
                type="datetime-local"
                value={formData.enrollmentEnd}
                onChange={(e) => handleInputChange('enrollmentEnd', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Drop Deadline"
                type="datetime-local"
                value={formData.dropDeadline}
                onChange={(e) => handleInputChange('dropDeadline', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
              <TextField
                fullWidth
                label="Audit Deadline"
                type="datetime-local"
                value={formData.auditDeadline}
                onChange={(e) => handleInputChange('auditDeadline', e.target.value)}
                InputLabelProps={{ shrink: true }}
                disabled={submitting}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              variant="contained"
              sx={{ backgroundColor: '#8B3A3A' }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={24} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default CalendarPage;
