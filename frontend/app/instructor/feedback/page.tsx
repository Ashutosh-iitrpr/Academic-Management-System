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
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  Chip,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  LinearProgress,
  Rating,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import instructorApi, { CourseOffering, FeedbackForm, FeedbackResults } from '@/lib/api/instructorApi';
import { toast } from 'sonner';

// Icons
import FeedbackIcon from '@mui/icons-material/Feedback';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import BarChartIcon from '@mui/icons-material/BarChart';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`feedback-tabpanel-${index}`}
      aria-labelledby={`feedback-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const InstructorFeedback = () => {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<string>('');
  const [selectedOfferingData, setSelectedOfferingData] = useState<CourseOffering | null>(null);
  const [feedbackForms, setFeedbackForms] = useState<FeedbackForm[]>([]);
  const [loadingForms, setLoadingForms] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Dialog states
  const [createDialog, setCreateDialog] = useState(false);
  const [selectedFormForResults, setSelectedFormForResults] = useState<FeedbackForm | null>(null);
  const [resultsDialog, setResultsDialog] = useState(false);
  const [feedbackResults, setFeedbackResults] = useState<FeedbackResults | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Form creation states
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const data = await instructorApi.getCourseOfferings();
      // Show offerings in ENROLLING or COMPLETED status
      setOfferings(data.filter(o => o.status === 'ENROLLING' || o.status === 'COMPLETED'));
    } catch (error: any) {
      console.error('Failed to fetch course offerings:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch course offerings');
    } finally {
      setLoading(false);
    }
  };

  const handleOfferingChange = async (offeringId: string) => {
    try {
      setSelectedOffering(offeringId);
      setLoadingForms(true);
      setFeedbackForms([]);

      const offering = offerings.find(o => o.id === offeringId);
      setSelectedOfferingData(offering || null);

      // Fetch feedback forms for this offering
      const forms = await instructorApi.listFeedbackForms(offeringId);
      setFeedbackForms(forms);
    } catch (error: any) {
      console.error('Failed to fetch feedback forms:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch feedback forms');
    } finally {
      setLoadingForms(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleCreateFeedbackForm = async () => {
    if (!selectedOffering) {
      toast.error('Please select a course offering first');
      return;
    }

    try {
      setSubmitting(true);
      const newForm = await instructorApi.openFeedbackForm(selectedOffering, {
        title: formTitle || undefined,
        description: formDescription || undefined,
      });

      setFeedbackForms([newForm, ...feedbackForms]);
      setCreateDialog(false);
      setFormTitle('');
      setFormDescription('');
      toast.success('Feedback form created and opened successfully!');
    } catch (error: any) {
      console.error('Failed to create feedback form:', error);
      toast.error(error.response?.data?.message || 'Failed to create feedback form');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCloseFeedbackForm = async (formId: string) => {
    if (!window.confirm('Are you sure you want to close this feedback form? Students will no longer be able to submit responses.')) {
      return;
    }

    try {
      await instructorApi.closeFeedbackForm(formId);
      setFeedbackForms(prev =>
        prev.map(f => (f.id === formId ? { ...f, isOpen: false } : f))
      );
      toast.success('Feedback form closed successfully');
    } catch (error: any) {
      console.error('Failed to close feedback form:', error);
      toast.error(error.response?.data?.message || 'Failed to close feedback form');
    }
  };

  const handleViewResults = async (form: FeedbackForm) => {
    try {
      setSelectedFormForResults(form);
      setLoadingResults(true);
      setResultsDialog(true);

      const results = await instructorApi.getFeedbackResultsByForm(form.id);
      setFeedbackResults(results);
    } catch (error: any) {
      console.error('Failed to fetch feedback results:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch feedback results');
      setResultsDialog(false);
    } finally {
      setLoadingResults(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return '#4caf50';
    if (rating >= 3.5) return '#8bc34a';
    if (rating >= 2.5) return '#ff9800';
    if (rating >= 1.5) return '#ff7043';
    return '#f44336';
  };

  const openForms = feedbackForms.filter(f => f.isOpen);
  const closedForms = feedbackForms.filter(f => !f.isOpen);

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="Course Feedback">
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <FeedbackIcon sx={{ fontSize: 36, color: '#8B3A3A' }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Course Feedback Management
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Create and manage student feedback forms for your courses
            </Typography>
          </Box>

          {/* Info Alert */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
            Create feedback forms to collect student feedback on course content, teaching methods, and overall course
            experience. You can view aggregated results and individual comments after students submit their responses.
          </Alert>

          {loading ? (
            <LoadingSkeleton type="card" count={1} />
          ) : (
            <>
              {/* Course Selection */}
              <Card sx={{ mb: 3, border: '1px solid #e0e0e0' }}>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Select Course Offering
                  </Typography>
                  {offerings.length === 0 ? (
                    <Alert severity="warning">No course offerings available.</Alert>
                  ) : (
                    <FormControl fullWidth>
                      <InputLabel>Course Offering</InputLabel>
                      <Select
                        value={selectedOffering}
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
                                {offering.semester} | Status: {offering.status}
                              </Typography>
                            </Box>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  )}
                </CardContent>
              </Card>

              {selectedOffering && (
                <Card sx={{ border: '1px solid #e0e0e0' }}>
                  <CardContent>
                    {/* Tabs */}
                    <Tabs
                      value={tabValue}
                      onChange={handleTabChange}
                      sx={{
                        borderBottom: '1px solid #e0e0e0',
                        mb: 3,
                        '& .MuiTab-root': {
                          textTransform: 'none',
                          fontSize: '1rem',
                          fontWeight: 600,
                        },
                        '& .Mui-selected': {
                          color: '#8B3A3A',
                        },
                        '& .MuiTabs-indicator': {
                          backgroundColor: '#8B3A3A',
                        },
                      }}
                    >
                      <Tab
                        label={`Active Forms (${openForms.length})`}
                        id="feedback-tab-0"
                        aria-controls="feedback-tabpanel-0"
                      />
                      <Tab
                        label={`Closed Forms (${closedForms.length})`}
                        id="feedback-tab-1"
                        aria-controls="feedback-tabpanel-1"
                      />
                    </Tabs>

                    {/* Tab 0: Active Forms */}
                    <TabPanel value={tabValue} index={0}>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button
                          variant="contained"
                          startIcon={<AddIcon />}
                          onClick={() => setCreateDialog(true)}
                          sx={{
                            backgroundColor: '#8B3A3A',
                            '&:hover': { backgroundColor: '#6d2d2d' },
                            textTransform: 'none',
                          }}
                        >
                          Create New Feedback Form
                        </Button>
                      </Box>

                      {loadingForms ? (
                        <LoadingSkeleton type="card" count={2} />
                      ) : openForms.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <FeedbackIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                          <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                            No Active Feedback Forms
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#999' }}>
                            Create a new feedback form to collect student feedback
                          </Typography>
                        </Box>
                      ) : (
                        <Grid container spacing={2}>
                          {openForms.map((form) => (
                            <Grid item xs={12} md={6} key={form.id}>
                              <Card
                                sx={{
                                  border: '2px solid #4caf50',
                                  backgroundColor: '#f1f8f4',
                                  height: '100%',
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Chip
                                        label="ACTIVE"
                                        size="small"
                                        sx={{
                                          backgroundColor: '#4caf50',
                                          color: 'white',
                                          fontWeight: 600,
                                          mb: 1,
                                        }}
                                      />
                                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                        {form.title || 'Untitled Feedback Form'}
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                        {form.description || 'No description provided'}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'white', borderRadius: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                                      Created: {new Date(form.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                      Responses: <strong>{form._count?.responses || 0}</strong>
                                    </Typography>
                                  </Box>

                                  <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => handleViewResults(form)}
                                      startIcon={<BarChartIcon />}
                                      sx={{
                                        flex: 1,
                                        textTransform: 'none',
                                        borderColor: '#8B3A3A',
                                        color: '#8B3A3A',
                                      }}
                                    >
                                      View Results
                                    </Button>
                                    <Button
                                      size="small"
                                      variant="contained"
                                      onClick={() => handleCloseFeedbackForm(form.id)}
                                      startIcon={<CloseIcon />}
                                      sx={{
                                        backgroundColor: '#f44336',
                                        '&:hover': { backgroundColor: '#d32f2f' },
                                        textTransform: 'none',
                                      }}
                                    >
                                      Close
                                    </Button>
                                  </Box>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </TabPanel>

                    {/* Tab 1: Closed Forms */}
                    <TabPanel value={tabValue} index={1}>
                      {loadingForms ? (
                        <LoadingSkeleton type="card" count={2} />
                      ) : closedForms.length === 0 ? (
                        <Box sx={{ textAlign: 'center', py: 6 }}>
                          <FeedbackIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                          <Typography variant="h6" sx={{ color: '#999', mb: 1 }}>
                            No Closed Feedback Forms
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#999' }}>
                            Feedback forms you close will appear here
                          </Typography>
                        </Box>
                      ) : (
                        <Grid container spacing={2}>
                          {closedForms.map((form) => (
                            <Grid item xs={12} md={6} key={form.id}>
                              <Card
                                sx={{
                                  border: '1px solid #ccc',
                                  backgroundColor: '#f9f9f9',
                                  height: '100%',
                                }}
                              >
                                <CardContent>
                                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                                    <Box sx={{ flex: 1 }}>
                                      <Chip
                                        label="CLOSED"
                                        size="small"
                                        sx={{
                                          backgroundColor: '#999',
                                          color: 'white',
                                          fontWeight: 600,
                                          mb: 1,
                                        }}
                                      />
                                      <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                                        {form.title || 'Untitled Feedback Form'}
                                      </Typography>
                                      <Typography variant="body2" sx={{ color: '#666', mb: 2 }}>
                                        {form.description || 'No description provided'}
                                      </Typography>
                                    </Box>
                                  </Box>

                                  <Box sx={{ mb: 2, p: 1.5, backgroundColor: 'white', borderRadius: 1 }}>
                                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                                      Created: {new Date(form.createdAt).toLocaleDateString()}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 0.5 }}>
                                      Closed: {form.closedAt ? new Date(form.closedAt).toLocaleDateString() : 'N/A'}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                                      Responses: <strong>{form._count?.responses || 0}</strong>
                                    </Typography>
                                  </Box>

                                  <Button
                                    fullWidth
                                    size="small"
                                    variant="outlined"
                                    onClick={() => handleViewResults(form)}
                                    startIcon={<BarChartIcon />}
                                    sx={{
                                      textTransform: 'none',
                                      borderColor: '#8B3A3A',
                                      color: '#8B3A3A',
                                    }}
                                  >
                                    View Results
                                  </Button>
                                </CardContent>
                              </Card>
                            </Grid>
                          ))}
                        </Grid>
                      )}
                    </TabPanel>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </Box>

        {/* Create Feedback Form Dialog */}
        <Dialog
          open={createDialog}
          onClose={() => setCreateDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>Create Feedback Form</DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            <Alert severity="info" sx={{ mb: 2 }}>
              Students will receive questions about course content, teaching methods, evaluation, and overall experience.
            </Alert>
            <TextField
              fullWidth
              label="Form Title (Optional)"
              placeholder="E.g., Semester Feedback"
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Form Description (Optional)"
              placeholder="Brief description of the feedback form"
              multiline
              rows={3}
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setCreateDialog(false)} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button
              onClick={handleCreateFeedbackForm}
              variant="contained"
              disabled={submitting}
              sx={{
                backgroundColor: '#8B3A3A',
                '&:hover': { backgroundColor: '#6d2d2d' },
              }}
            >
              {submitting ? 'Creating...' : 'Create Form'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* View Feedback Results Dialog */}
        <Dialog
          open={resultsDialog}
          onClose={() => setResultsDialog(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
            <BarChartIcon />
            Feedback Results - {selectedFormForResults?.title || 'Untitled Form'}
          </DialogTitle>
          <DialogContent sx={{ pt: 2 }}>
            {loadingResults ? (
              <LoadingSkeleton type="card" count={1} />
            ) : feedbackResults ? (
              <Box>
                {feedbackResults.responses === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <FeedbackIcon sx={{ fontSize: 48, color: '#ccc', mb: 2 }} />
                    <Typography variant="h6" sx={{ color: '#999' }}>
                      No Responses Yet
                    </Typography>
                  </Box>
                ) : (
                  <Box>
                    {/* Response Summary */}
                    <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
                        Response Summary
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                        {feedbackResults.responses} {feedbackResults.responses === 1 ? 'Response' : 'Responses'}
                      </Typography>
                    </Box>

                    {/* Ratings */}
                    {feedbackResults.averages && (
                      <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                          Average Ratings
                        </Typography>

                        {/* Content Rating */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Course Content Quality
                            </Typography>
                            <Chip
                              label={`${feedbackResults.averages.ratingContent}/5`}
                              sx={{
                                backgroundColor: getRatingColor(Number(feedbackResults.averages.ratingContent)),
                                color: 'white',
                                fontWeight: 700,
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating
                              value={Number(feedbackResults.averages.ratingContent)}
                              readOnly
                              size="small"
                            />
                            <LinearProgress
                              variant="determinate"
                              value={(Number(feedbackResults.averages.ratingContent) / 5) * 100}
                              sx={{ flex: 1, height: 6, borderRadius: 1 }}
                            />
                          </Box>
                        </Box>

                        {/* Teaching Rating */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Teaching Quality
                            </Typography>
                            <Chip
                              label={`${feedbackResults.averages.ratingTeaching}/5`}
                              sx={{
                                backgroundColor: getRatingColor(Number(feedbackResults.averages.ratingTeaching)),
                                color: 'white',
                                fontWeight: 700,
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating
                              value={Number(feedbackResults.averages.ratingTeaching)}
                              readOnly
                              size="small"
                            />
                            <LinearProgress
                              variant="determinate"
                              value={(Number(feedbackResults.averages.ratingTeaching) / 5) * 100}
                              sx={{ flex: 1, height: 6, borderRadius: 1 }}
                            />
                          </Box>
                        </Box>

                        {/* Evaluation Rating */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Evaluation Fairness
                            </Typography>
                            <Chip
                              label={`${feedbackResults.averages.ratingEvaluation}/5`}
                              sx={{
                                backgroundColor: getRatingColor(Number(feedbackResults.averages.ratingEvaluation)),
                                color: 'white',
                                fontWeight: 700,
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating
                              value={Number(feedbackResults.averages.ratingEvaluation)}
                              readOnly
                              size="small"
                            />
                            <LinearProgress
                              variant="determinate"
                              value={(Number(feedbackResults.averages.ratingEvaluation) / 5) * 100}
                              sx={{ flex: 1, height: 6, borderRadius: 1 }}
                            />
                          </Box>
                        </Box>

                        {/* Overall Rating */}
                        <Box sx={{ mb: 2 }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                              Overall Course Experience
                            </Typography>
                            <Chip
                              label={`${feedbackResults.averages.ratingOverall}/5`}
                              sx={{
                                backgroundColor: getRatingColor(Number(feedbackResults.averages.ratingOverall)),
                                color: 'white',
                                fontWeight: 700,
                              }}
                            />
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Rating
                              value={Number(feedbackResults.averages.ratingOverall)}
                              readOnly
                              size="small"
                            />
                            <LinearProgress
                              variant="determinate"
                              value={(Number(feedbackResults.averages.ratingOverall) / 5) * 100}
                              sx={{ flex: 1, height: 6, borderRadius: 1 }}
                            />
                          </Box>
                        </Box>
                      </Box>
                    )}

                    {/* Student Comments */}
                    {feedbackResults.comments && feedbackResults.comments.length > 0 && (
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                          Student Comments ({feedbackResults.comments.length})
                        </Typography>
                        <Box sx={{ maxHeight: 400, overflowY: 'auto' }}>
                          {feedbackResults.comments.map((comment, index) => (
                            <Card
                              key={index}
                              sx={{
                                mb: 1.5,
                                border: '1px solid #e0e0e0',
                              }}
                            >
                              <CardContent sx={{ py: 1.5 }}>
                                <Typography variant="body2" sx={{ color: '#333' }}>
                                  {comment}
                                </Typography>
                              </CardContent>
                            </Card>
                          ))}
                        </Box>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            ) : null}
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setResultsDialog(false)}
              variant="contained"
              sx={{ backgroundColor: '#8B3A3A', '&:hover': { backgroundColor: '#6d2d2d' } }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </DashboardLayout>
    </ProtectedRoute>
  );
};

export default InstructorFeedback;
