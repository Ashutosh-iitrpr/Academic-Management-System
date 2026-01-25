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

// ==================== COURSES ====================

export const coursesApi = {
  // Get all available courses
  getAllCourses: async (): Promise<Course[]> => {
    const response = await api.get('/courses');
    return response.data;
  },

  // Get course by ID
  getCourseById: async (courseId: string): Promise<Course> => {
    const response = await api.get(`/courses/${courseId}`);
    return response.data;
  },

  // Search courses by code or name
  searchCourses: async (query: string): Promise<Course[]> => {
    const response = await api.get('/courses', {
      params: { search: query },
    });
    return response.data;
  },

  // Get courses by department (if applicable)
  getCoursesByDepartment: async (department: string): Promise<Course[]> => {
    const response = await api.get('/courses', {
      params: { department },
    });
    return response.data;
  },
};

export default coursesApi;
