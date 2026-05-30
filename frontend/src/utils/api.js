import axios from 'axios';

const API = axios.create({
  baseURL: 'https://cloudlms-backend.onrender.com/api'
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getMe = () => API.get('/auth/me');
export const login = (email, password) => API.post('/auth/login', { email, password });
export const register = (data) => API.post('/auth/register', data);
export const getCourses = (params) => API.get('/courses', { params });
export const getMaterials = (courseId) => API.get(`/materials/course/${courseId}`);

export default API;