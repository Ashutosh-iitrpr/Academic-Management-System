import { getAxiosClient } from './axiosClient';

const api = getAxiosClient();

// ==================== TYPES ====================

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  credits: number;
  ltpsc?: string;
  department?: string;
  prerequisites?: string;
  createdAt?: string;
}

export interface CourseOffering {
  id: string;
  semester: string;
  timeSlot: string;
  status: string;
  allowedBranches: string[];
  course: {
    id: string;
    code: string;
    name: string;
    credits: number;
  };
  instructor: {
    id: string;
    name: string;
  };
}

export interface Enrollment {
  id: string;
  courseOfferingId: string;
  status: 'PENDING_INSTRUCTOR' | 'ENROLLED' | 'REJECTED' | 'DROPPED' | 'AUDIT' | 'COMPLETED';
  enrollmentType: 'CREDIT' | 'CREDIT_CONCENTRATION' | 'CREDIT_MINOR';
  grade?: string;
  courseOffering?: CourseOffering;
  createdAt: string;
  approvedAt?: string;
}

export interface StudentRecord {
  student: {
    id: string;
    name: string;
    entryNumber: string;
  };
  semesterWiseEnrollments: Record<string, any>;
  summary: {
    cumulativeCreditsCompleted: number;
    creditsOngoing: number;
    totalEnrollments: number;
    mainGPA: number;
    concentrationGPA: number;
    minorGPA: number;
    cgpa: number;
    currentSemesterGPA: number;
  };
  enrollments?: Enrollment[];
}

export interface StudentTranscript {
  student: {
    name: string;
    entryNumber: string;
    id: string;
  };
  gpa: number;
  courses: Array<{
    courseCode: string;
    courseName: string;
    grade: string;
    credits: number;
    semester: string;
  }>;
}

export interface FeedbackForm {
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
  isOpen?: boolean;
  createdAt?: string;
}

export interface SubmitFeedbackResponse {
  message: string;
  feedbackId: string;
}

export interface AcademicCalendar {
  enrollmentStart: string;
  enrollmentEnd: string;
  dropDeadline: string;
  auditDeadline: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  entryNumber?: string;
  branch?: string;
}

// ==================== STUDENT API ====================

export const studentApi = {
  // ========== PROFILE ==========
  /**
   * Get current logged-in user profile
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // ========== COURSES ==========
  /**
   * Get all available courses in catalog
   */
  getAllCourses: async (courseCode?: string): Promise<Course[]> => {
    const response = await api.get('/student/courses', {
      params: courseCode ? { courseCode } : {},
    });
    return response.data;
  },

  /**
   * Get a specific course by ID
   */
  getCourseById: async (courseId: string): Promise<Course> => {
    const response = await api.get(`/student/courses/${courseId}`);
    return response.data;
  },

  // ========== COURSE OFFERINGS ==========
  /**
   * Get available course offerings for student enrollment
   */
  getAvailableOfferings: async (courseCode?: string): Promise<CourseOffering[]> => {
    const response = await api.get('/student/course-offerings', {
      params: courseCode ? { courseCode } : {},
    });
    return response.data;
  },

  /**
   * Get enrollments for a specific course offering
   */
  getOfferingEnrollments: async (offeringId: string): Promise<Enrollment[]> => {
    const response = await api.get(`/course-offerings/${offeringId}/enrollments`);
    return response.data;
  },

  // ========== ENROLLMENTS ==========
  /**
   * Get all enrollments for the current student
   */
  getMyEnrollments: async (): Promise<Enrollment[]> => {
    const response = await api.get('/student/enrollments');
    return response.data;
  },

  /**
   * Request enrollment in a course offering
   */
  requestEnrollment: async (
    offeringId: string,
    enrollmentType: 'CREDIT' | 'CREDIT_CONCENTRATION' | 'CREDIT_MINOR' = 'CREDIT'
  ): Promise<{ status: string }> => {
    const response = await api.post('/student/enrollments', {
      courseOfferingId: offeringId,
      enrollmentType,
    });
    return response.data;
  },

  /**
   * Drop an enrollment
   */
  dropEnrollment: async (enrollmentId: string): Promise<{ message: string }> => {
    const response = await api.patch(`/student/enrollments/${enrollmentId}/drop`);
    return response.data;
  },

  /**
   * Audit an enrollment
   */
  auditEnrollment: async (enrollmentId: string): Promise<{ message: string }> => {
    const response = await api.patch(`/student/enrollments/${enrollmentId}/audit`);
    return response.data;
  },

  // ========== STUDENT RECORD ==========
  /**
   * Get complete student record with all enrollments
   */
  getStudentRecord: async (): Promise<StudentRecord> => {
    const response = await api.get('/student/record');
    return response.data;
  },

  /**
   * Get student transcript separated by enrollment type (new structure)
   */
  getStudentTranscriptByType: async () => {
    const response = await api.get('/student/record/transcript-by-type');
    return response.data;
  },

  /**
   * Get student record for a specific semester
   */
  getStudentRecordBySemester: async (semester: string): Promise<StudentRecord> => {
    const response = await api.get(`/student/record/semester/${semester}`);
    return response.data;
  },

  // ========== TRANSCRIPT ==========
  /**
   * Get student transcript with grades and GPA
   */
  getTranscript: async (): Promise<StudentTranscript> => {
    const response = await api.get('/student/record/transcript');
    return response.data;
  },

  // ========== FEEDBACK ==========
  /**
   * Get available feedback forms to submit
   */
  getAvailableFeedback: async (): Promise<FeedbackForm[]> => {
    const response = await api.get('/student/feedback');
    return response.data;
  },

  /**
   * Submit feedback for a course
   */
  submitFeedback: async (
    formId: string,
    feedback: {
      ratingContent: number;
      ratingTeaching: number;
      ratingEvaluation: number;
      ratingOverall: number;
      comments?: string;
    }
  ): Promise<SubmitFeedbackResponse> => {
    const response = await api.post(`/student/feedback/${formId}`, feedback);
    return response.data;
  },

  // ========== ACADEMIC CALENDAR ==========
  /**
   * Get academic calendar with key dates
   */
  getAcademicCalendar: async (): Promise<AcademicCalendar> => {
    const response = await api.get('/admin/academic-calendar/student');
    return response.data;
  },
};

export default studentApi;
