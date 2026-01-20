import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api';

let axiosInstance: AxiosInstance | null = null;

export const getAxiosClient = (): AxiosInstance => {
  if (axiosInstance) {
    return axiosInstance;
  }

  axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor to attach JWT token
  axiosInstance.interceptors.request.use(
    (config) => {
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor to handle 401 errors
  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
      }
      return Promise.reject(error);
    }
  );

  return axiosInstance;
};

export default getAxiosClient;
