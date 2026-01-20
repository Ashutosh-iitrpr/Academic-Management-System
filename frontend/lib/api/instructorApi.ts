import { getAxiosClient } from './axiosClient';

const api = getAxiosClient();

// ==================== TYPES ====================

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
}

export interface CourseOffering {
  id: string;
  semester: string;
  timeSlot: string;
  status: string;
  course: Course;
  allowedBranches: string[];
  _count?: {
    enrollments: number;
  };
  createdAt?: string;
  approvedAt?: string;
  completedAt?: string;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseOfferingId: string;
  status: string;
  enrollmentType: string;
  student: {
    name: string;
    email: string;
    entryNumber?: string;
  };
  courseOffering?: {
    course: {
      code: string;
      name: string;
    };
  };
  grade?: string;
}

export interface FeedbackForm {
  id: string;
  title?: string;
  description?: string;
  isOpen: boolean;
  createdAt: string;
  closedAt?: string;
  _count?: {
    responses: number;
  };
}

export interface FeedbackResults {
  form?: {
    id: string;
    title?: string;
    createdAt: string;
    closedAt?: string;
  };
  responses: number;
  averages: {
    ratingContent: string;
    ratingTeaching: string;
    ratingEvaluation: string;
    ratingOverall: string;
  } | null;
  comments?: string[];
}

export interface AcademicCalendar {
  enrollmentStart: string;
  enrollmentEnd: string;
  dropDeadline: string;
  auditDeadline: string;
}

export interface GradeEntry {
  enrollmentId: string;
  grade: string;
}

export interface CreateOfferingDto {
  courseId: string;
  semester: string;
  timeSlot: string;
  allowedBranches: string[];
}

export interface CreateEnrollmentTriggerDto {
  courseOfferingId: string;
  branchCode: string;
  batchYear: number;
  enrollmentType: string;
}

export interface CreateFeedbackFormDto {
  title?: string;
  description?: string;
}

// ==================== COURSE OFFERINGS ====================

export const instructorApi = {
  // Get instructor's own course offerings
  getCourseOfferings: async (): Promise<CourseOffering[]> => {
    const response = await api.get('/instructor/course-offerings');
    return response.data;
  },

  // Request a new course offering
  requestCourseOffering: async (dto: CreateOfferingDto): Promise<CourseOffering> => {
    const response = await api.post('/instructor/course-offerings', dto);
    return response.data;
  },

  // Finalize a course offering
  finalizeCourseOffering: async (offeringId: string): Promise<CourseOffering> => {
    const response = await api.post(`/instructor/course-offerings/${offeringId}/finalize`);
    return response.data;
  },

  // ==================== ENROLLMENTS ====================

  // Get pending enrollment requests
  getPendingEnrollments: async (): Promise<Enrollment[]> => {
    const response = await api.get('/instructor/enrollments/pending');
    return response.data;
  },

  // Approve an enrollment
  approveEnrollment: async (enrollmentId: string): Promise<Enrollment> => {
    const response = await api.patch(`/instructor/enrollments/${enrollmentId}/approve`);
    return response.data;
  },

  // Reject an enrollment
  rejectEnrollment: async (enrollmentId: string): Promise<Enrollment> => {
    const response = await api.patch(`/instructor/enrollments/${enrollmentId}/reject`);
    return response.data;
  },

  // Create auto enrollment trigger
  createEnrollmentTrigger: async (dto: CreateEnrollmentTriggerDto): Promise<any> => {
    const response = await api.post('/instructor/enrollments/triggers', dto);
    return response.data;
  },

  // Get unified enrollment list for a course offering
  getEnrollmentsList: async (offeringId: string): Promise<Enrollment[]> => {
    const response = await api.get(`/instructor/course-offerings/${offeringId}/enrollments`);
    return response.data;
  },

  // ==================== GRADES ====================

  // Upload grades for a course offering
  uploadGrades: async (offeringId: string, grades: GradeEntry[]): Promise<any> => {
    const response = await api.post(`/instructor/course-offerings/${offeringId}/grades`, { grades });
    return response.data;
  },

  // ==================== FEEDBACK ====================

  // Open a feedback form
  openFeedbackForm: async (
    offeringId: string,
    dto: CreateFeedbackFormDto
  ): Promise<FeedbackForm> => {
    const response = await api.post(`/instructor/course-offerings/${offeringId}/feedback-forms`, dto);
    return response.data;
  },

  // Close a feedback form
  closeFeedbackForm: async (formId: string): Promise<FeedbackForm> => {
    const response = await api.patch(`/instructor/feedback-forms/${formId}/close`);
    return response.data;
  },

  // List feedback forms for a course offering
  listFeedbackForms: async (offeringId: string): Promise<FeedbackForm[]> => {
    const response = await api.get(`/instructor/course-offerings/${offeringId}/feedback-forms`);
    return response.data;
  },

  // Get feedback results by form ID
  getFeedbackResultsByForm: async (formId: string): Promise<FeedbackResults> => {
    const response = await api.get(`/instructor/feedback-forms/${formId}/results`);
    return response.data;
  },

  // Get all feedback results for a course offering
  getFeedbackResultsByOffering: async (offeringId: string): Promise<FeedbackResults[]> => {
    const response = await api.get(`/instructor/course-offerings/${offeringId}/feedback-results`);
    return response.data;
  },

  // ==================== CALENDAR ====================

  // Get academic calendar (read-only for instructor)
  getAcademicCalendar: async (): Promise<AcademicCalendar> => {
    const response = await api.get('/admin/academic-calendar/instructor');
    return response.data;
  },
};

export default instructorApi;
