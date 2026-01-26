'use client';

import React, { useEffect, useState } from 'react';
import {
  Grid,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import StatusChip from '@/components/ui/StatusChip';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import instructorApi, { CourseOffering, CreateOfferingDto } from '@/lib/api/instructorApi';
import { toast } from 'sonner';

// Icons
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

const InstructorOfferings = () => {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [allOfferingCourseCodes, setAllOfferingCourseCodes] = useState<Set<string>>(new Set());
  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'view' | 'request' | 'finalize'>('view');
  const [submitting, setSubmitting] = useState(false);

  // Form state for requesting new offering
  const [formData, setFormData] = useState({
    courseCode: '',
    semester: '',
    timeSlot: '',
    allowedBranches: [] as string[],
  });

  const [semesters, setSemesters] = useState<string[]>([]);
  const [semestersLoading, setSemestersLoading] = useState(false);

  const buildFallbackSemesters = (): string[] => {
    const now = new Date();
    const year = now.getFullYear();
    // Provide 4 upcoming semester options
    return [
      `Spring ${year}`,
      `Summer ${year}`,
      `Fall ${year}`,
      `Spring ${year + 1}`,
    ];
  };

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const [mine, all] = await Promise.all([
        instructorApi.getCourseOfferings(),
        instructorApi.getAllCourseOfferings(),
      ]);
      setOfferings(mine);
      const codes = new Set<string>(all.map(o => o.course.code.toUpperCase()));
      setAllOfferingCourseCodes(codes);
    } catch (error: any) {
      console.error('Failed to fetch offerings:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch offerings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferings();
  }, []);

  const handleOpenRequestDialog = () => {
    setDialogType('request');
    setFormData({
      courseCode: '',
      semester: '',
      timeSlot: '',
      allowedBranches: [],
    });
    setOpenDialog(true);
    // Fetch semesters when opening dialog
    loadSemesters();
    // Refresh offerings to ensure latest duplicate check
    fetchOfferings();
  };

  const loadSemesters = async () => {
    try {
      setSemestersLoading(true);
      const semestersRes = await instructorApi.getSemesters();
      const fromBackend = Array.isArray(semestersRes) ? semestersRes.filter(Boolean) : [];
      setSemesters(fromBackend.length ? fromBackend : buildFallbackSemesters());
    } catch (e) {
      console.error('Failed to load semesters', e);
      // Fall back to local options for semesters even if API fails
      setSemesters(buildFallbackSemesters());
      toast.error('Failed to load semesters');
    } finally {
      setSemestersLoading(false);
    }
  };

  const handleOpenViewDialog = (offering: CourseOffering) => {
    setSelectedOffering(offering);
    setDialogType('view');
    setOpenDialog(true);
  };

  const handleOpenFinalizeDialog = (offering: CourseOffering) => {
    setSelectedOffering(offering);
    setDialogType('finalize');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedOffering(null);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleBranchToggle = (branch: string) => {
    setFormData(prev => ({
      ...prev,
      allowedBranches: prev.allowedBranches.includes(branch)
        ? prev.allowedBranches.filter(b => b !== branch)
        : [...prev.allowedBranches, branch],
    }));
  };

  const handleRequestOffering = async () => {
    try {
      if (!formData.semester || !formData.timeSlot) {
        toast.error('Please fill all required fields');
        return;
      }

      if (!formData.courseCode) {
        toast.error('Please provide the course code');
        return;
      }

      if (!formData.allowedBranches || formData.allowedBranches.length === 0) {
        toast.error('Select at least one allowed branch');
        return;
      }

      // Prevent duplicate requests if any offering (pending/enrolling/completed) exists for this course
      const courseCodeUpper = formData.courseCode.trim().toUpperCase();
      if (allOfferingCourseCodes.has(courseCodeUpper)) {
        toast.error('An offering for this course already exists or is pending');
        return;
      }

      setSubmitting(true);
      const payload: CreateOfferingDto = {
        courseCode: formData.courseCode,
        semester: formData.semester,
        timeSlot: formData.timeSlot,
        allowedBranches: formData.allowedBranches,
      };

      await instructorApi.requestCourseOffering(payload);
      toast.success('Course offering requested successfully');
      handleCloseDialog();
      fetchOfferings();
    } catch (error: any) {
      console.error('Failed to request offering:', error);
      toast.error(error.response?.data?.message || 'Failed to request offering');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFinalizeOffering = async () => {
    try {
      if (!selectedOffering) return;

      setSubmitting(true);
      await instructorApi.finalizeCourseOffering(selectedOffering.id);
      toast.success('Course offering finalized successfully');
      handleCloseDialog();
      fetchOfferings();
    } catch (error: any) {
      console.error('Failed to finalize offering:', error);
      toast.error(error.response?.data?.message || 'Failed to finalize offering');
    } finally {
      setSubmitting(false);
    }
  };

  const BRANCHES = ['CSB', 'MEB', 'ECB', 'EEB', 'CEB'];
  const TIME_SLOTS = ['PC1', 'PC2', 'PC3', 'PC4', 'PC5', 'PC6'];

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="Course Offerings">
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                My Course Offerings
              </Typography>
              <Typography variant="body2" sx={{ color: '#666' }}>
                Manage your course offerings and enrollment requests
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
              onClick={handleOpenRequestDialog}
            >
              Request New Offering
            </Button>
          </Box>

          {/* Offerings Grid */}
          {loading ? (
            <LoadingSkeleton type="grid" count={3} />
          ) : offerings.length === 0 ? (
            <Card sx={{ border: '1px solid #e0e0e0', textAlign: 'center', py: 6 }}>
              <InfoIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
              <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                No Course Offerings Yet
              </Typography>
              <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
                Request a new course offering to get started
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                sx={{
                  backgroundColor: '#8B3A3A',
                  '&:hover': { backgroundColor: '#6B2A2A' },
                }}
                onClick={handleOpenRequestDialog}
              >
                Request First Offering
              </Button>
            </Card>
          ) : (
            <Grid container spacing={3}>
              {offerings.map(offering => (
                <Grid item xs={12} sm={6} md={4} key={offering.id}>
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
                      {/* Course Info */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                          {offering.course.code}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                          {offering.course.name}
                        </Typography>
                        <StatusChip status={offering.status as any} />
                      </Box>

                      {/* Details */}
                      <Box sx={{ mb: 3, pb: 2, borderBottom: '1px solid #e0e0e0' }}>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                            SEMESTER
                          </Typography>
                          <Typography variant="body2">{offering.semester}</Typography>
                        </Box>
                        <Box sx={{ mb: 1 }}>
                          <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                            TIME SLOT
                          </Typography>
                          <Typography variant="body2">{offering.timeSlot}</Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                            STUDENTS ENROLLED
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {offering._count?.enrollments || 0}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Credits */}
                      <Box sx={{ mb: 3, textAlign: 'center', p: 1.5, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="caption" sx={{ color: '#999', fontWeight: 600, display: 'block', mb: 0.5 }}>
                          CREDITS
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                          {offering.course.credits}
                        </Typography>
                      </Box>

                      {/* Dates */}
                      <Box sx={{ mb: 3, fontSize: '0.75rem', color: '#999' }}>
                        {offering.createdAt && (
                          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                            Created: {new Date(offering.createdAt).toLocaleDateString()}
                          </Typography>
                        )}
                        {offering.approvedAt && (
                          <Typography variant="caption" display="block" sx={{ mb: 0.5 }}>
                            Approved: {new Date(offering.approvedAt).toLocaleDateString()}
                          </Typography>
                        )}
                        {offering.completedAt && (
                          <Typography variant="caption" display="block">
                            Completed: {new Date(offering.completedAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>

                      {/* Actions */}
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Button
                          fullWidth
                          size="small"
                          variant="outlined"
                          sx={{
                            borderColor: '#8B3A3A',
                            color: '#8B3A3A',
                            textTransform: 'none',
                          }}
                          onClick={() => handleOpenViewDialog(offering)}
                        >
                          View Details
                        </Button>
                        {offering.status === 'ENROLLING' && (
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
                            onClick={() => handleOpenFinalizeDialog(offering)}
                          >
                            Finalize
                          </Button>
                        )}
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* Dialogs */}

        {/* View Details Dialog */}
        <Dialog open={openDialog && dialogType === 'view'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            {selectedOffering?.course.code} - Offering Details
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {selectedOffering && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                    COURSE NAME
                  </Typography>
                  <Typography variant="body2">{selectedOffering.course.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                    STATUS
                  </Typography>
                  <Box sx={{ mt: 0.5 }}>
                    <StatusChip status={selectedOffering.status as any} />
                  </Box>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                    SEMESTER
                  </Typography>
                  <Typography variant="body2">{selectedOffering.semester}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                    TIME SLOT
                  </Typography>
                  <Typography variant="body2">{selectedOffering.timeSlot}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                    CREDITS
                  </Typography>
                  <Typography variant="body2">{selectedOffering.course.credits}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                    ENROLLED STUDENTS
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {selectedOffering._count?.enrollments || 0}
                  </Typography>
                </Box>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Request New Offering Dialog */}
        <Dialog open={openDialog && dialogType === 'request'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem' }}>
            Request New Course Offering
          </DialogTitle>
          <DialogContent sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Course Code"
              fullWidth
              placeholder="Enter course code (e.g., CS101)"
              value={formData.courseCode}
              onChange={(e) => handleInputChange('courseCode', e.target.value)}
              required
              helperText="If course doesn't exist, please propose it in 'Propose New Course' page first"
            />

            <FormControl fullWidth>
              <InputLabel>Semester</InputLabel>
              <Select
                value={formData.semester}
                label="Semester"
                onChange={(e) => handleInputChange('semester', e.target.value)}
              >
                {semestersLoading ? (
                  <MenuItem value="" disabled>Loading...</MenuItem>
                ) : semesters.map(sem => (
                  <MenuItem key={sem} value={sem}>
                    {sem}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Time Slot</InputLabel>
              <Select
                value={formData.timeSlot}
                label="Time Slot"
                onChange={(e) => handleInputChange('timeSlot', e.target.value)}
              >
                {TIME_SLOTS.map(slot => (
                  <MenuItem key={slot} value={slot}>
                    {slot}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Allowed Branches
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                {BRANCHES.map(branch => (
                  <Chip
                    key={branch}
                    label={branch}
                    onClick={() => handleBranchToggle(branch)}
                    variant={formData.allowedBranches.includes(branch) ? 'filled' : 'outlined'}
                    sx={{
                      backgroundColor: formData.allowedBranches.includes(branch) ? '#8B3A3A' : 'transparent',
                      color: formData.allowedBranches.includes(branch) ? 'white' : '#8B3A3A',
                      borderColor: '#8B3A3A',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </Box>
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button
              onClick={handleRequestOffering}
              variant="contained"
              sx={{
                backgroundColor: '#8B3A3A',
                '&:hover': { backgroundColor: '#6B2A2A' },
              }}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 'Request Offering'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Finalize Offering Dialog */}
        <Dialog open={openDialog && dialogType === 'finalize'} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700, fontSize: '1.25rem', color: '#f44336' }}>
            Finalize Course Offering
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action will mark the course offering as completed. Make sure all grades have been submitted.
            </Alert>
            {selectedOffering && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2">
                  <strong>Course:</strong> {selectedOffering.course.code} - {selectedOffering.course.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Semester:</strong> {selectedOffering.semester}
                </Typography>
                <Typography variant="body2">
                  <strong>Enrolled Students:</strong> {selectedOffering._count?.enrollments || 0}
                </Typography>
              </Box>
            )}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={handleCloseDialog} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button
              onClick={handleFinalizeOffering}
              variant="contained"
              sx={{
                backgroundColor: '#f44336',
                '&:hover': { backgroundColor: '#d32f2f' },
              }}
              disabled={submitting}
            >
              {submitting ? <CircularProgress size={20} /> : 'Finalize Offering'}
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorOfferings;
