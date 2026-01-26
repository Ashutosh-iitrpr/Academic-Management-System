'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import instructorApi, { CourseOffering, CreateEnrollmentTriggerDto } from '@/lib/api/instructorApi';
import { toast } from 'sonner';

// Icons
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import SchoolIcon from '@mui/icons-material/School';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';

// Branch codes - these should match the backend validation
const BRANCH_CODES = [
  { code: 'CSB', name: 'Computer Science & Biosciences' },
  { code: 'CEB', name: 'Computer Engineering & Biology' },
  { code: 'CSE', name: 'Computer Science Engineering' },
  { code: 'ECE', name: 'Electronics & Communication Engineering' },
  { code: 'EEB', name: 'Electronics Engineering & Biology' },
  { code: 'MEE', name: 'Mechanical Engineering' },
  { code: 'MEB', name: 'Mechanical Engineering & Biology' },
  { code: 'CEE', name: 'Civil Engineering' },
  { code: 'EEE', name: 'Electrical Engineering' },
  { code: 'CHE', name: 'Chemical Engineering' },
  { code: 'BIO', name: 'Biotechnology' },
  { code: 'MAT', name: 'Mathematics & Computing' },
  { code: 'PHY', name: 'Engineering Physics' },
  { code: 'CHM', name: 'Chemistry' },
];

// Helper function to get branch name
const getBranchName = (code: string) => {
  const branch = BRANCH_CODES.find(b => b.code === code);
  return branch ? branch.name : code;
};

// Enrollment types
const ENROLLMENT_TYPES = [
  { value: 'CREDIT', label: 'Credit', color: '#4caf50' },
  { value: 'AUDIT', label: 'Audit', color: '#2196f3' },
];

const BatchEnrollment = () => {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [activeStep, setActiveStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [result, setResult] = useState<{ trigger: any; enrolledCount: number } | null>(null);

  // Form data
  const [formData, setFormData] = useState<CreateEnrollmentTriggerDto>({
    courseOfferingId: '',
    branchCode: '',
    batchYear: new Date().getFullYear(),
    enrollmentType: 'CREDIT' as any,
  });

  const [selectedOffering, setSelectedOffering] = useState<CourseOffering | null>(null);

  const steps = ['Select Course Offering', 'Configure Batch Details', 'Review & Execute'];

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const data = await instructorApi.getCourseOfferings();
      // Only show offerings that are in ENROLLING status
      setOfferings(data.filter(o => o.status === 'ENROLLING'));
    } catch (error: any) {
      console.error('Failed to fetch course offerings:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch course offerings');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferingChange = (offeringId: string) => {
    const offering = offerings.find(o => o.id === offeringId);
    setSelectedOffering(offering || null);
    setFormData({ ...formData, courseOfferingId: offeringId, branchCode: '' });
  };

  const handleNext = () => {
    if (activeStep === 0 && !formData.courseOfferingId) {
      toast.error('Please select a course offering');
      return;
    }
    if (activeStep === 1 && (!formData.branchCode || !formData.batchYear)) {
      toast.error('Please fill in all batch details');
      return;
    }
    if (activeStep === 1 && selectedOffering && !selectedOffering.allowedBranches.includes(formData.branchCode)) {
      toast.error('Selected branch is not allowed for this course offering');
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleExecute = () => {
    setConfirmDialog(true);
  };

  const handleConfirmExecute = async () => {
    try {
      setSubmitting(true);
      setConfirmDialog(false);
      const response = await instructorApi.createEnrollmentTrigger(formData);
      setResult(response);
      toast.success(`Successfully enrolled ${response.enrolledCount} students!`);
    } catch (error: any) {
      console.error('Failed to create enrollment trigger:', error);
      toast.error(error.response?.data?.message || 'Failed to create batch enrollment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setActiveStep(0);
    setFormData({
      courseOfferingId: '',
      branchCode: '',
      batchYear: new Date().getFullYear(),
      enrollmentType: 'CREDIT' as any,
    });
    setSelectedOffering(null);
    setResult(null);
  };

  // Generate batch years (last 6 years)
  const currentYear = new Date().getFullYear();
  const batchYears = Array.from({ length: 6 }, (_, i) => currentYear - i);

  // Get available branches from the selected offering
  const availableBranches = selectedOffering
    ? selectedOffering.allowedBranches.map(code => ({
        code,
        name: getBranchName(code)
      }))
    : [];

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="Batch Enrollment">
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <GroupAddIcon sx={{ fontSize: 36, color: '#8B3A3A' }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Batch Enrollment
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }} component="div">
              Automatically enroll all students from a specific batch and branch into your course
            </Typography>
          </Box>

          {/* Info Alert */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
            <strong>How it works:</strong> Select a course offering, specify the target batch year and branch,
            then execute to automatically enroll all matching students. Students who have already enrolled will
            be skipped.
          </Alert>

          {loading ? (
            <LoadingSkeleton type="card" count={1} />
          ) : result ? (
            // Success Result View
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    Batch Enrollment Completed!
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
                    <Card sx={{ minWidth: 200, border: '1px solid #4caf50', backgroundColor: '#f1f8f4' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                          {result.enrolledCount}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Students Enrolled
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      <strong>Course:</strong> {selectedOffering?.course.code} - {selectedOffering?.course.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      <strong>Branch:</strong> {formData.branchCode} ({getBranchName(formData.branchCode)})
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      <strong>Batch Year:</strong> {formData.batchYear}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }} component="div">
                      <strong>Enrollment Type:</strong>{' '}
                      <Chip
                        label={formData.enrollmentType}
                        size="small"
                        sx={{
                          backgroundColor: ENROLLMENT_TYPES.find(t => t.value === formData.enrollmentType)?.color,
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </Typography>
                  </Box>
                  <Button
                    variant="contained"
                    onClick={handleReset}
                    sx={{
                      backgroundColor: '#8B3A3A',
                      '&:hover': { backgroundColor: '#6d2d2d' },
                      textTransform: 'none',
                    }}
                  >
                    Create Another Batch Enrollment
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            // Stepper Form
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
                  {steps.map((label) => (
                    <Step key={label}>
                      <StepLabel>{label}</StepLabel>
                    </Step>
                  ))}
                </Stepper>

                {/* Step 0: Select Course Offering */}
                {activeStep === 0 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Select Course Offering
                    </Typography>
                    {offerings.length === 0 ? (
                      <Alert severity="warning">
                        No course offerings are currently open for enrollment.
                      </Alert>
                    ) : (
                      <FormControl fullWidth>
                        <InputLabel>Course Offering</InputLabel>
                        <Select
                          value={formData.courseOfferingId}
                          label="Course Offering"
                          onChange={(e) => handleOfferingChange(e.target.value)}
                        >
                          {offerings.map((offering) => (
                            <MenuItem key={offering.id} value={offering.id}>
                              <Box>
                                <Typography variant="body1">
                                  {offering.course.code} - {offering.course.name}
                                </Typography>
                                <Typography variant="caption" sx={{ color: '#666' }}>
                                  {offering.semester} | {offering.timeSlot} | {offering.course.credits} Credits
                                </Typography>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )}
                    {selectedOffering && (
                      <Box sx={{ mt: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1, color: '#8B3A3A' }}>
                          📚 Course Details:
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Semester:</strong> {selectedOffering.semester}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 0.5 }}>
                          <strong>Time Slot:</strong> {selectedOffering.timeSlot}
                        </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>Credits:</strong> {selectedOffering.course.credits}
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                          Allowed Branches for this Course:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          {selectedOffering.allowedBranches.map((code: string) => (
                            <Chip
                              key={code}
                              label={`${code} - ${getBranchName(code)}`}
                              size="small"
                              sx={{ backgroundColor: '#8B3A3A', color: 'white' }}
                            />
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}

                {/* Step 1: Configure Batch Details */}
                {activeStep === 1 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Configure Batch Details
                    </Typography>
                    {selectedOffering && (
                      <Alert severity="info" icon={<SchoolIcon />} sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Allowed Branches for {selectedOffering.course.code}:
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                          {selectedOffering.allowedBranches.map((code: string) => (
                            <Chip
                              key={code}
                              label={`${code} - ${getBranchName(code)}`}
                              size="small"
                              sx={{ backgroundColor: '#8B3A3A', color: 'white' }}
                            />
                          ))}
                        </Box>
                      </Alert>
                    )}
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Branch *</InputLabel>
                          <Select
                            value={formData.branchCode}
                            label="Branch *"
                            onChange={(e) => setFormData({ ...formData, branchCode: e.target.value })}
                            disabled={!selectedOffering || availableBranches.length === 0}
                          >
                            {availableBranches.length === 0 ? (
                              <MenuItem disabled>No branches available</MenuItem>
                            ) : (
                              availableBranches.map((branch) => (
                                <MenuItem key={branch.code} value={branch.code}>
                                  {branch.code} - {branch.name}
                                </MenuItem>
                              ))
                            )}
                          </Select>
                        </FormControl>
                        {availableBranches.length === 0 && (
                          <Typography variant="caption" sx={{ color: '#f44336', mt: 0.5, display: 'block' }}>
                            No branches are allowed for this course offering
                          </Typography>
                        )}
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <FormControl fullWidth>
                          <InputLabel>Batch Year</InputLabel>
                          <Select
                            value={formData.batchYear}
                            label="Batch Year"
                            onChange={(e) => setFormData({ ...formData, batchYear: Number(e.target.value) })}
                          >
                            {batchYears.map((year) => (
                              <MenuItem key={year} value={year}>
                                {year}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel>Enrollment Type</InputLabel>
                          <Select
                            value={formData.enrollmentType}
                            label="Enrollment Type"
                            onChange={(e) => setFormData({ ...formData, enrollmentType: e.target.value as any })}
                          >
                            {ENROLLMENT_TYPES.map((type) => (
                              <MenuItem key={type.value} value={type.value}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: '50%',
                                      backgroundColor: type.color,
                                    }}
                                  />
                                  {type.label}
                                </Box>
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                    {formData.branchCode && formData.batchYear && (
                      <Alert severity="info" sx={{ mt: 3 }}>
                        <strong>Target Entry Number Pattern:</strong> {formData.batchYear}{formData.branchCode}XXX
                        <br />
                        <Typography variant="caption">
                          All students with entry numbers starting with this pattern will be enrolled.
                        </Typography>
                      </Alert>
                    )}
                  </Box>
                )}

                {/* Step 2: Review & Execute */}
                {activeStep === 2 && (
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 3 }}>
                      Review & Execute
                    </Typography>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                      <strong>Please review carefully before executing:</strong>
                      <br />
                      This action will immediately enroll all matching students into the selected course.
                    </Alert>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600, width: '30%' }}>Course</TableCell>
                          <TableCell>
                            {selectedOffering?.course.code} - {selectedOffering?.course.name}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Semester</TableCell>
                          <TableCell>{selectedOffering?.semester}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Time Slot</TableCell>
                          <TableCell>{selectedOffering?.timeSlot}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Credits</TableCell>
                          <TableCell>{selectedOffering?.course.credits}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Branch</TableCell>
                          <TableCell>
                            {formData.branchCode} - {getBranchName(formData.branchCode)}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Batch Year</TableCell>
                          <TableCell>{formData.batchYear}</TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Entry Number Pattern</TableCell>
                          <TableCell>
                            <Chip label={`${formData.batchYear}${formData.branchCode}XXX`} sx={{ fontFamily: 'monospace' }} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Enrollment Type</TableCell>
                          <TableCell>
                            <Chip
                              label={formData.enrollmentType}
                              sx={{
                                backgroundColor: ENROLLMENT_TYPES.find(t => t.value === formData.enrollmentType)?.color,
                                color: 'white',
                                fontWeight: 600,
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </Box>
                )}

                {/* Navigation Buttons */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                  <Button
                    onClick={handleBack}
                    disabled={activeStep === 0 || submitting}
                    sx={{ textTransform: 'none' }}
                  >
                    Back
                  </Button>
                  <Box sx={{ display: 'flex', gap: 2 }}>
                    {activeStep < steps.length - 1 ? (
                      <Button
                        variant="contained"
                        onClick={handleNext}
                        disabled={submitting}
                        sx={{
                          backgroundColor: '#8B3A3A',
                          '&:hover': { backgroundColor: '#6d2d2d' },
                          textTransform: 'none',
                        }}
                      >
                        Next
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleExecute}
                        disabled={submitting}
                        startIcon={<GroupAddIcon />}
                        sx={{
                          backgroundColor: '#4caf50',
                          '&:hover': { backgroundColor: '#388e3c' },
                          textTransform: 'none',
                        }}
                      >
                        {submitting ? 'Executing...' : 'Execute Batch Enrollment'}
                      </Button>
                    )}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog}
          onClose={() => setConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Confirm Batch Enrollment
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              This action will enroll all students matching the pattern{' '}
              <strong>{formData.batchYear}{formData.branchCode}XXX</strong> into the selected course.
            </Alert>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Are you sure you want to proceed?
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmDialog(false)} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmExecute}
              variant="contained"
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#388e3c' },
              }}
            >
              Confirm & Execute
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default BatchEnrollment;
