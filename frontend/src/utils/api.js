import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || '/api',
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('lms_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('lms_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const registerUser   = (data) => API.post('/auth/register', data);
export const loginUser      = (data) => API.post('/auth/login', data);
export const getMe          = ()     => API.get('/auth/me');
export const updateProfile  = (data) => API.put('/auth/profile', data);

export const getCourses         = (params) => API.get('/courses', { params });
export const getCourseById      = (id)     => API.get(`/courses/${id}`);
export const getMyCourses       = ()       => API.get('/courses/my-courses');
export const getEnrolledCourses = ()       => API.get('/courses/enrolled');
export const createCourse       = (data)   => API.post('/courses', data);
export const updateCourse       = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse       = (id)     => API.delete(`/courses/${id}`);
export const enrollCourse       = (id)     => API.post(`/courses/${id}/enroll`);

export const uploadNote = (data, onProgress) =>
  API.post('/materials/note', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });

export const uploadVideo = (data, onProgress) =>
  API.post('/materials/video', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress && onProgress(Math.round((e.loaded * 100) / e.total)),
  });

export const getCourseMaterials = (courseId) => API.get(`/materials/course/${courseId}`);
export const deleteMaterial     = (id)        => API.delete(`/materials/${id}`);
export const updateMaterial     = (id, data)  => API.put(`/materials/${id}`, data);

export const getAllUsers       = (params) => API.get('/users', { params });
export const getDashboardStats = ()       => API.get('/users/stats');
export const toggleUserActive  = (id)     => API.put(`/users/${id}/toggle-active`);
export const promoteToTeacher  = (id)     => API.put(`/users/${id}/promote`);

export default API;