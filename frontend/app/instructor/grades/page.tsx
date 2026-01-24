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
  OutlinedInput,
  InputAdornment,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Paper,
  Grid,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ProtectedRoute from '@/lib/routes/ProtectedRoute';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import instructorApi, { CourseOffering, Enrollment } from '@/lib/api/instructorApi';
import { toast } from 'sonner';

// Icons
import SchoolIcon from '@mui/icons-material/School';
import SaveIcon from '@mui/icons-material/Save';
import GetAppIcon from '@mui/icons-material/GetApp';
import InfoIcon from '@mui/icons-material/Info';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
import ClearIcon from '@mui/icons-material/Clear';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import UploadFileIcon from '@mui/icons-material/UploadFile';

const GRADES = [
  { value: 'A', label: 'A', color: '#4caf50' },
  { value: 'A_MINUS', label: 'A-', color: '#66bb6a' },
  { value: 'B', label: 'B', color: '#81c784' },
  { value: 'B_MINUS', label: 'B-', color: '#a5d6a7' },
  { value: 'C', label: 'C', color: '#fdd835' },
  { value: 'C_MINUS', label: 'C-', color: '#fff176' },
  { value: 'D', label: 'D', color: '#ff9800' },
  { value: 'E', label: 'E', color: '#ff7043' },
  { value: 'F', label: 'F', color: '#f44336' },
];

const GRADE_MAP = Object.fromEntries(GRADES.map(g => [g.value, g]));

interface GradeEntry {
  enrollmentId: string;
  studentName: string;
  entryNumber: string;
  grade: string | null;
  isNew: boolean;
  branch?: string;
  batch?: string;
}

const deriveBatchFromEntry = (entry: string | null | undefined): string | undefined => {
  if (!entry) return undefined;
  const year = entry.slice(0, 4);
  return /^\d{4}$/.test(year) ? year : undefined;
};

const gradeValuesSet = new Set(GRADES.map((g) => g.value));

const normalizeGradeInput = (grade: string): string | null => {
  if (!grade) return null;
  const raw = grade.trim().toUpperCase();
  if (gradeValuesSet.has(raw)) return raw;
  const withMinus = raw.replace('-', '_MINUS');
  if (gradeValuesSet.has(withMinus)) return withMinus;
  return null;
};

const GradeUpload = () => {
  const [loading, setLoading] = useState(true);
  const [offerings, setOfferings] = useState<CourseOffering[]>([]);
  const [selectedOffering, setSelectedOffering] = useState<string>('');
  const [selectedOfferingData, setSelectedOfferingData] = useState<CourseOffering | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilter, setBranchFilter] = useState<string>('ALL');
  const [batchFilter, setBatchFilter] = useState<string>('ALL');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [confirmDialog, setConfirmDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resultDialog, setResultDialog] = useState(false);
  const [result, setResult] = useState<{ updatedCount: number; updatedEnrollments: string[] } | null>(null);
  const [csvMessage, setCsvMessage] = useState<string | null>(null);
  const [csvError, setCsvError] = useState<string | null>(null);
  const [csvDialogOpen, setCsvDialogOpen] = useState(false);
  const [showSubmitCount, setShowSubmitCount] = useState(true);

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    try {
      setLoading(true);
      const data = await instructorApi.getCourseOfferings();
      // Show only completed or enrolling offerings
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
      setLoadingEnrollments(true);
      setGrades([]);
      setShowSubmitCount(true);

      const offering = offerings.find(o => o.id === offeringId);
      setSelectedOfferingData(offering || null);

      // Fetch enrollments for this offering
      const enrollmentData = await instructorApi.getEnrollmentsList(offeringId);

      // Filter only enrolled students (ENROLLED, AUDIT, COMPLETED - exclude pending, rejected, dropped)
      const enrolledOnly = enrollmentData.filter(e => 
        e.status === 'ENROLLED' || e.status === 'AUDIT' || e.status === 'COMPLETED'
      );

      setEnrollments(enrolledOnly);

      // Create grade entries
      const gradeEntries = enrolledOnly.map(enrollment => ({
        enrollmentId: enrollment.id,
        studentName: enrollment.student.name,
        entryNumber: enrollment.student.entryNumber || 'N/A',
        grade: enrollment.grade || null,
        isNew: !enrollment.grade,
        branch: (enrollment.student as any)?.branch || (enrollment.student as any)?.branchCode,
        batch:
          (enrollment.student as any)?.batch ||
          (enrollment.student as any)?.batchYear?.toString() ||
          deriveBatchFromEntry(enrollment.student.entryNumber),
      }));

      setGrades(gradeEntries);
    } catch (error: any) {
      console.error('Failed to fetch enrollments:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch enrollments');
    } finally {
      setLoadingEnrollments(false);
    }
  };

  const handleGradeChange = (enrollmentId: string, grade: string) => {
    setShowSubmitCount(true);
    setGrades(prev =>
      prev.map(g =>
        g.enrollmentId === enrollmentId
          ? { ...g, grade, isNew: false }
          : g
      )
    );
    setEditingCell(null);
  };

  const handleClearGrade = (enrollmentId: string) => {
    setShowSubmitCount(true);
    setGrades(prev =>
      prev.map(g =>
        g.enrollmentId === enrollmentId
          ? { ...g, grade: null, isNew: true }
          : g
      )
    );
  };

  const openCsvDialog = () => {
    setCsvMessage(null);
    setCsvError(null);
    setCsvDialogOpen(true);
  };

  const closeCsvDialog = () => setCsvDialogOpen(false);

  const handleCsvInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleCsvFile(file);
    // allow re-uploading same file
    e.target.value = '';
  };

  const escapeCsv = (value: string): string => {
    if (value == null) return '';
    const needsQuotes = /[",\n]/.test(value);
    const escaped = value.replace(/"/g, '""');
    return needsQuotes ? `"${escaped}"` : escaped;
  };

  const handleDownloadCsv = () => {
    if (!grades.length) {
      toast.error('No students to download');
      return;
    }
    const sorted = [...grades].sort((a, b) => a.entryNumber.localeCompare(b.entryNumber));
    const header = 'name,entrynumber,grade';
    const rows = sorted.map((g) =>
      [escapeCsv(g.studentName), escapeCsv(g.entryNumber), escapeCsv(g.grade || '')].join(',')
    );
    const csv = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const fileName = `grades-${selectedOfferingData?.course?.code || 'course'}-${selectedOffering || 'list'}.csv`;
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSubmit = () => {
    const gradesToSubmit = grades.filter(g => g.grade !== null);
    if (gradesToSubmit.length === 0) {
      toast.error('Please assign at least one grade');
      return;
    }
    setConfirmDialog(true);
  };

  const handleConfirmSubmit = async () => {
    try {
      setSubmitting(true);
      setConfirmDialog(false);

      const gradesToSubmit = grades
        .filter(g => g.grade !== null)
        .map(g => ({
          enrollmentId: g.enrollmentId,
          grade: g.grade!,
        }));

      const response = await instructorApi.uploadGrades(selectedOffering, gradesToSubmit);
      setResult(response);
      setResultDialog(true);
      toast.success(`Successfully uploaded grades for ${response.updatedCount} students!`);
      setShowSubmitCount(false);
      setGrades(prev => prev.map(g => ({ ...g, isNew: false })));
    } catch (error: any) {
      console.error('Failed to upload grades:', error);
      toast.error(error.response?.data?.message || 'Failed to upload grades');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setResultDialog(false);
    setResult(null);
    setSelectedOffering('');
    setSelectedOfferingData(null);
    setEnrollments([]);
    setGrades([]);
  };

  // Calculate statistics
  const gradesAssigned = grades.filter(g => g.grade !== null).length;
  const gradesNotAssigned = grades.filter(g => g.grade === null).length;
  const gradeStats = {
    assigned: gradesAssigned,
    pending: gradesNotAssigned,
    total: grades.length,
  };

  const branchOptions = Array.from(
    new Set(grades.map((g) => g.branch).filter(Boolean) as string[])
  );
  const batchOptions = Array.from(
    new Set(grades.map((g) => g.batch).filter(Boolean) as string[])
  );

  const filteredGrades = grades.filter((g) => {
    const matchesSearch = searchQuery
      ? g.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.entryNumber.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
    const matchesBranch = branchFilter === 'ALL' ? true : g.branch === branchFilter;
    const matchesBatch = batchFilter === 'ALL' ? true : g.batch === batchFilter;
    return matchesSearch && matchesBranch && matchesBatch;
  });

  const handleCsvFile = (file: File | null) => {
    if (!file) return;
    setCsvError(null);
    setCsvMessage(null);

    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result as string;
      if (!text) {
        setCsvError('Empty file.');
        return;
      }

      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
      if (lines.length === 0) {
        setCsvError('No rows found in CSV.');
        return;
      }

      const rows = lines.map((line) => line.split(',').map((p) => p.trim()));
      // Skip header if present
      const startIndex =
        rows[0][0]?.toLowerCase() === 'name' || rows[0][1]?.toLowerCase() === 'entrynumber'
          ? 1
          : 0;

      let applied = 0;
      let invalid = 0;
      let unmatched = 0;

      const updates = rows.slice(startIndex).map((parts) => ({
        name: parts[0] || '',
        entryNumber: (parts[1] || '').toUpperCase(),
        grade: normalizeGradeInput(parts[2] || ''),
      }));

      const updatesMap = new Map<string, string>();
      updates.forEach((u) => {
        if (!u.entryNumber || !u.grade) {
          invalid += 1;
          return;
        }
        updatesMap.set(u.entryNumber, u.grade);
      });

      setGrades((prev) => {
        const updated = prev.map((g) => {
          const key = g.entryNumber.toUpperCase();
          const newGrade = updatesMap.get(key);
          if (newGrade) {
            applied += 1;
            return { ...g, grade: newGrade, isNew: false };
          }
          return g;
        });

        unmatched = updatesMap.size - applied;
        return updated;
      });

      if (applied > 0) {
        setShowSubmitCount(true);
        setCsvMessage(`Applied ${applied} grade updates${unmatched > 0 ? `; ${unmatched} entries did not match students` : ''}${invalid > 0 ? `; ${invalid} invalid rows` : ''}.`);
      } else if (invalid > 0 || unmatched > 0) {
        setCsvError(`No grades applied. ${unmatched} unmatched, ${invalid} invalid rows.`);
      } else {
        setCsvError('No matching students found in the CSV.');
      }
    };

    reader.onerror = () => setCsvError('Failed to read the file.');
    reader.readAsText(file);
  };

  const getGradeColor = (grade: string | null) => {
    if (!grade) return '#ccc';
    return GRADE_MAP[grade]?.color || '#999';
  };

  return (
    <ProtectedRoute requiredRole="INSTRUCTOR">
      <DashboardLayout pageTitle="Grade Upload">
        <Box>
          {/* Header Section */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
              <SchoolIcon sx={{ fontSize: 36, color: '#8B3A3A' }} />
              <Typography variant="h4" sx={{ fontWeight: 700 }}>
                Grade Upload
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Upload and manage grades for students enrolled in your courses
            </Typography>
          </Box>

          {/* Info Alert */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ mb: 3 }}>
            Select a course offering to view enrolled students. You can then assign grades to each student
            and submit them all at once. Grades can be edited before final submission.
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
                    Grades Uploaded Successfully!
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mb: 3, flexWrap: 'wrap' }}>
                    <Card sx={{ minWidth: 200, border: '1px solid #4caf50', backgroundColor: '#f1f8f4' }}>
                      <CardContent sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" sx={{ fontWeight: 700, color: '#4caf50' }}>
                          {result.updatedCount}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#666' }}>
                          Grades Updated
                        </Typography>
                      </CardContent>
                    </Card>
                  </Box>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="body2" sx={{ color: '#666', mb: 1 }}>
                      <strong>Course:</strong> {selectedOfferingData?.course.code} -{' '}
                      {selectedOfferingData?.course.name}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#666' }}>
                      <strong>Semester:</strong> {selectedOfferingData?.semester}
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
                    Upload More Grades
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ) : (
            // Main Grade Upload Form
            <Card sx={{ border: '1px solid #e0e0e0' }}>
              <CardContent>
                {/* Course Selection */}
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                    Select Course Offering
                  </Typography>
                  {offerings.length === 0 ? (
                    <Alert severity="warning">No course offerings available for grade upload.</Alert>
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
                </Box>

                {selectedOffering && (
                  <>
                    {/* Stats Cards */}
                    {!loadingEnrollments && grades.length > 0 && (
                      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
                        <Card sx={{ flex: 1, minWidth: 150, border: '1px solid #e0e0e0' }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#8B3A3A' }}>
                              {gradeStats.total}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Total Students
                            </Typography>
                          </CardContent>
                        </Card>
                        <Card sx={{ flex: 1, minWidth: 150, border: '1px solid #4caf50' }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>
                              {gradeStats.assigned}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Grades Assigned
                            </Typography>
                          </CardContent>
                        </Card>
                        <Card sx={{ flex: 1, minWidth: 150, border: '1px solid #ff9800' }}>
                          <CardContent sx={{ textAlign: 'center' }}>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#ff9800' }}>
                              {gradeStats.pending}
                            </Typography>
                            <Typography variant="body2" sx={{ color: '#666' }}>
                              Pending
                            </Typography>
                          </CardContent>
                        </Card>
                      </Box>
                    )}

                    {/* Grades Table */}
                    {loadingEnrollments ? (
                      <LoadingSkeleton type="table" count={5} />
                    ) : grades.length === 0 ? (
                      <Alert severity="info">
                        No enrolled students found for this course offering.
                      </Alert>
                    ) : (
                      <>
                        <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>
                          Student Grades
                        </Typography>

                        {/* Legend */}
                        <Box sx={{ mb: 2, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, display: 'block', mb: 1 }}>
                            Grade Scale:
                          </Typography>
                          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                            {GRADES.map(grade => (
                              <Chip
                                key={grade.value}
                                label={grade.label}
                                size="small"
                                sx={{
                                  backgroundColor: grade.color,
                                  color: 'white',
                                  fontWeight: 600,
                                }}
                              />
                            ))}
                          </Box>
                        </Box>

                        {/* Filters */}
                        <Box sx={{ display: 'flex', flexWrap: { xs: 'wrap', md: 'nowrap' }, gap: 2, mb: 2, alignItems: 'center' }}>
                          <TextField
                            size="small"
                            label="Search by name or entry"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ minWidth: 220 }}
                            InputProps={{
                              startAdornment: (
                                <SearchIcon sx={{ color: '#999', mr: 1 }} fontSize="small" />
                              ),
                            }}
                          />
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Branch</InputLabel>
                            <Select
                              value={branchFilter}
                              label="Branch"
                              onChange={(e) => setBranchFilter(e.target.value)}
                              input={
                                <OutlinedInput
                                  label="Branch"
                                  startAdornment={
                                    <InputAdornment position="start">
                                      <FilterAltIcon fontSize="small" sx={{ color: '#999' }} />
                                    </InputAdornment>
                                  }
                                />
                              }
                            >
                              <MenuItem value="ALL">All Branches</MenuItem>
                              {branchOptions.map((b) => (
                                <MenuItem key={b} value={b}>
                                  {b}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <FormControl size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Batch</InputLabel>
                            <Select
                              value={batchFilter}
                              label="Batch"
                              onChange={(e) => setBatchFilter(e.target.value)}
                              input={
                                <OutlinedInput
                                  label="Batch"
                                  startAdornment={
                                    <InputAdornment position="start">
                                      <FilterAltIcon fontSize="small" sx={{ color: '#999' }} />
                                    </InputAdornment>
                                  }
                                />
                              }
                            >
                              <MenuItem value="ALL">All Batches</MenuItem>
                              {batchOptions.map((b) => (
                                <MenuItem key={b} value={b}>
                                  {b}
                                </MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<UploadFileIcon fontSize="small" />}
                            onClick={openCsvDialog}
                            sx={{ textTransform: 'none', px: 1.25, minWidth: 110 }}
                          >
                            CSV Upload
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<GetAppIcon fontSize="small" />}
                            onClick={handleDownloadCsv}
                            sx={{ textTransform: 'none', px: 1.25, minWidth: 120 }}
                          >
                            Download CSV
                          </Button>
                        </Box>

                        {/* Grades Table */}
                        <Box sx={{ overflowX: 'auto', mb: 3 }}>
                          <Table>
                            <TableHead>
                              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                                <TableCell sx={{ fontWeight: 600 }}>Student Name</TableCell>
                                <TableCell sx={{ fontWeight: 600 }}>Entry Number</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Grade</TableCell>
                                <TableCell sx={{ fontWeight: 600, textAlign: 'center' }}>Action</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {filteredGrades.map((gradeEntry) => (
                                <TableRow
                                  key={gradeEntry.enrollmentId}
                                  sx={{
                                    '&:hover': { backgroundColor: '#f9f9f9' },
                                  }}
                                >
                                  <TableCell>{gradeEntry.studentName}</TableCell>
                                  <TableCell>{gradeEntry.entryNumber}</TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>
                                    {editingCell === gradeEntry.enrollmentId ? (
                                      <Box
                                        sx={{
                                          display: 'flex',
                                          gap: 1,
                                          alignItems: 'center',
                                          justifyContent: 'center',
                                        }}
                                      >
                                        <Select
                                          size="small"
                                          value={gradeEntry.grade || ''}
                                          onChange={(e) => handleGradeChange(gradeEntry.enrollmentId, e.target.value)}
                                          sx={{ minWidth: 80 }}
                                        >
                                          {GRADES.map(grade => (
                                            <MenuItem key={grade.value} value={grade.value}>
                                              {grade.label}
                                            </MenuItem>
                                          ))}
                                        </Select>
                                      </Box>
                                    ) : (
                                      <Chip
                                        label={gradeEntry.grade ? GRADE_MAP[gradeEntry.grade]?.label : 'Not Set'}
                                        size="small"
                                        sx={{
                                          backgroundColor: getGradeColor(gradeEntry.grade),
                                          color: 'white',
                                          fontWeight: 600,
                                        }}
                                      />
                                    )}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: 'center' }}>
                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                      <Tooltip
                                        title={
                                          editingCell === gradeEntry.enrollmentId ? 'Save' : 'Edit'
                                        }
                                      >
                                        <IconButton
                                          size="small"
                                          onClick={() =>
                                            setEditingCell(
                                              editingCell === gradeEntry.enrollmentId
                                                ? null
                                                : gradeEntry.enrollmentId
                                            )
                                          }
                                          sx={{
                                            color:
                                              editingCell === gradeEntry.enrollmentId
                                                ? '#4caf50'
                                                : '#666',
                                          }}
                                        >
                                          <EditIcon fontSize="small" />
                                        </IconButton>
                                      </Tooltip>
                                      {gradeEntry.grade && (
                                        <Tooltip title="Clear Grade">
                                          <IconButton
                                            size="small"
                                            onClick={() => handleClearGrade(gradeEntry.enrollmentId)}
                                            sx={{ color: '#f44336' }}
                                          >
                                            <ClearIcon fontSize="small" />
                                          </IconButton>
                                        </Tooltip>
                                      )}
                                    </Box>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </Box>

                        {/* Submit Button */}
                        <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                          <Button
                            variant="outlined"
                            onClick={() => {
                              setSelectedOffering('');
                              setGrades([]);
                              setShowSubmitCount(true);
                            }}
                            sx={{ textTransform: 'none' }}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSubmit}
                            disabled={gradesAssigned === 0}
                            sx={{
                              backgroundColor: '#4caf50',
                              '&:hover': { backgroundColor: '#388e3c' },
                              textTransform: 'none',
                            }}
                          >
                            {showSubmitCount && gradesAssigned > 0 ? `Submit Grades (${gradesAssigned})` : 'Submit Grades'}
                          </Button>
                        </Box>
                      </>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </Box>

        {/* CSV Upload Dialog */}
        <Dialog open={csvDialogOpen} onClose={closeCsvDialog} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 700 }}>Upload Grades via CSV</DialogTitle>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Alert severity="info">
              CSV format: <strong>name, entrynumber, grade</strong> (header optional). Grades supported: A, A-, B, B-, C, C-, D, E, F.
            </Alert>
            <Typography variant="body2" sx={{ color: '#666' }}>
              Entry numbers must match the students in this offering. Unsupported grades or missing fields are skipped. After uploading, review the applied grades and click “Submit Grades” to save.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                component="label"
                startIcon={<UploadFileIcon />}
                sx={{ textTransform: 'none', backgroundColor: '#8B3A3A', '&:hover': { backgroundColor: '#6d2d2d' } }}
              >
                Choose CSV
                <input type="file" accept=".csv" hidden onChange={handleCsvInputChange} />
              </Button>
              {csvMessage && <Chip label={csvMessage} color="success" variant="outlined" size="small" />}
              {csvError && <Chip label={csvError} color="error" variant="outlined" size="small" />}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeCsvDialog} sx={{ color: '#666' }}>Close</Button>
          </DialogActions>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog
          open={confirmDialog}
          onClose={() => setConfirmDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Confirm Grade Submission
          </DialogTitle>
          <DialogContent>
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are about to submit grades for <strong>{gradesAssigned}</strong> students.
            </Alert>
            <Typography variant="body2" sx={{ mb: 1 }}>
              <strong>Course:</strong> {selectedOfferingData?.course.code} - {selectedOfferingData?.course.name}
            </Typography>
            <Typography variant="body2">
              <strong>Grades to Submit:</strong> {gradesAssigned}
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setConfirmDialog(false)} sx={{ color: '#666' }}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSubmit}
              variant="contained"
              disabled={submitting}
              sx={{
                backgroundColor: '#4caf50',
                '&:hover': { backgroundColor: '#388e3c' },
              }}
            >
              {submitting ? 'Submitting...' : 'Submit Grades'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Result Dialog */}
        <Dialog
          open={resultDialog}
          onClose={() => setResultDialog(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700, color: '#4caf50' }}>
            Upload Complete
          </DialogTitle>
          <DialogContent>
            <Alert severity="success" sx={{ mb: 2 }}>
              {result?.updatedCount} grades have been successfully submitted.
            </Alert>
            <Typography variant="body2">
              The grades are now recorded in the system. Students may view their grades in their academic records.
            </Typography>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button
              onClick={() => setResultDialog(false)}
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

export default GradeUpload;
