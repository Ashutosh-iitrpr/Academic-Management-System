import { getAxiosClient } from './axiosClient';

const api = getAxiosClient();

export interface CourseProposal {
  id: string;
  code: string;
  name: string;
  credits: number;
  ltpsc?: string;
  status: string;
  description?: string;
  instructor?: {
    id: string;
    name: string;
    email: string;
    department?: string;
  };
  createdAt: string;
  approvedAt?: string;
}

export interface CreateCourseProposalDto {
  code: string;
  name: string;
  credits: number;
  ltpsc: string;
  description?: string;
}

export const courseProposalApi = {
  // Instructor: Create a new course proposal
  createProposal: async (dto: CreateCourseProposalDto): Promise<CourseProposal> => {
    const response = await api.post('/instructor/course-proposals', dto);
    return response.data;
  },

  // Instructor: Get own proposals
  getMyProposals: async (): Promise<CourseProposal[]> => {
    const response = await api.get('/instructor/course-proposals');
    return response.data;
  },

  // Admin: Get all pending proposals
  getAllPendingProposals: async (): Promise<CourseProposal[]> => {
    const response = await api.get('/admin/course-proposals');
    return response.data;
  },

  // Admin: Approve a proposal
  approveProposal: async (proposalId: string): Promise<CourseProposal> => {
    const response = await api.patch(`/admin/course-proposals/${proposalId}/approve`);
    return response.data;
  },

  // Admin: Reject a proposal
  rejectProposal: async (proposalId: string): Promise<CourseProposal> => {
    const response = await api.patch(`/admin/course-proposals/${proposalId}/reject`);
    return response.data;
  },
};

export default courseProposalApi;
