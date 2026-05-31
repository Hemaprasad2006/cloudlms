import axios from 'axios';

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (data) => API.post('/auth/register', data);
export const getMe = () => API.get('/auth/me');

// Courses
export const getCourses = (params) => API.get('/courses', { params });
export const getCourseById = (id) => API.get(`/courses/${id}`);
export const createCourse = (data) => API.post('/courses', data);
export const updateCourse = (id, data) => API.put(`/courses/${id}`, data);
export const deleteCourse = (id) => API.delete(`/courses/${id}`);
export const enrollCourse = (id) => API.post(`/courses/${id}/enroll`);
export const publishCourse = (id) => API.put(`/courses/${id}`, { isPublished: true });
export const unpublishCourse = (id) => API.put(`/courses/${id}`, { isPublished: false });
export const getMyCourses = () => API.get('/courses/my-courses');
export const getEnrolledCourses = () => API.get('/courses/enrolled');
export const getCourseMaterials = (courseId) => API.get(`/materials/course/${courseId}`);

// Materials
export const getMaterials = (courseId) => API.get(`/materials/course/${courseId}`);
export const uploadNote = (courseId, formData) => API.post('/materials/note', formData);
export const uploadVideo = (courseId, formData) => API.post('/materials/video', formData);
export const deleteMaterial = (id) => API.delete(`/materials/${id}`);
export const updateMaterial = (id, data) => API.put(`/materials/${id}`, data);

// Users / Admin
export const getUsers = (params) => API.get('/users', { params });
export const getAllUsers = (params) => API.get('/users', { params });
export const getUserStats = () => API.get('/users/stats');
export const getDashboardStats = () => API.get('/users/stats');
export const toggleUserActive = (id) => API.put(`/users/${id}/toggle-active`);
export const promoteToTeacher = (id) => API.put(`/users/${id}/promote`);

export default API;