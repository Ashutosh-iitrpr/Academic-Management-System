import { getAxiosClient } from './axiosClient';

const api = getAxiosClient();

export interface PendingAdvisorEnrollment {
  id: string;
  status: 'PENDING_ADVISOR';
  student: {
    id: string;
    name: string;
    entryNumber: string;
    email: string;
  };
  courseOffering: {
    id: string;
    course: {
      code: string;
      name: string;
      credits: number;
    };
    instructor: {
      name: string;
    };
    semester: string;
  };
  createdAt: string;
}

export const advisorApi = {
  // Get all pending enrollments for faculty advisor
  getPendingEnrollments: async (): Promise<PendingAdvisorEnrollment[]> => {
    const response = await api.get('/advisor/enrollments/pending');
    return response.data;
  },

  // Approve an enrollment as advisor
  approveEnrollment: async (enrollmentId: string): Promise<any> => {
    const response = await api.patch(`/advisor/enrollments/${enrollmentId}/approve`);
    return response.data;
  },

  // Reject an enrollment as advisor
  rejectEnrollment: async (enrollmentId: string): Promise<any> => {
    const response = await api.patch(`/advisor/enrollments/${enrollmentId}/reject`);
    return response.data;
  },
};

export default advisorApi;
