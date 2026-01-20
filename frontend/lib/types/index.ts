export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  entryNumber?: string;
  branch?: string;
}

export interface AcademicCalendar {
  id: string;
  enrollmentStart: string;
  enrollmentEnd: string;
  dropDeadline: string;
  auditDeadline: string;
  semester: string;
  year: number;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  description?: string;
}

export interface CourseOffering {
  id: string;
  courseId: string;
  course?: Course;
  instructorId: string;
  instructor?: User;
  semester: string;
  year: number;
  timeSlot: string;
  allowedBranches: string[];
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WITHDRAWN' | 'COMPLETED';
  enrollmentType: 'REGULAR' | 'AUDIT';
  maxCapacity: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  student?: User;
  courseOfferingId: string;
  courseOffering?: CourseOffering;
  type: 'REGULAR' | 'AUDIT';
  status: 'ACTIVE' | 'COMPLETED' | 'DROPPED';
  grade?: string;
  enrolledDate: string;
}

export interface FeedbackForm {
  id: string;
  courseOfferingId: string;
  courseOffering?: CourseOffering;
  status: 'OPEN' | 'CLOSED';
  startDate: string;
  endDate: string;
  questions: FeedbackQuestion[];
}

export interface FeedbackQuestion {
  id: string;
  question: string;
  type: 'RATING' | 'TEXT';
}

export interface StudentFeedback {
  id: string;
  feedbackFormId: string;
  studentId: string;
  responses: Record<string, number | string>;
  submittedDate: string;
}

export interface Transcript {
  studentId: string;
  studentName: string;
  studentEmail: string;
  entryNumber: string;
  branch: string;
  enrollments: TranscriptEntry[];
  cgpa: number;
  totalCredits: number;
}

export interface TranscriptEntry {
  semester: string;
  year: number;
  courseName: string;
  courseCode: string;
  credits: number;
  grade: string;
  sgpa: number;
}
