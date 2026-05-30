import axios from 'axios';

const API = axios.create({
  baseURL: 'https://cloudlms-backend.onrender.com/api',
  withCredentials: true,
});

// Request interceptor — add JWT token to every request
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token from localStorage:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN FOUND');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ JWT token added to request header');
    } else {
      console.warn('⚠️ WARNING: No JWT token found in localStorage!');
    }
    
    return config;
  },
  (error) => {
    console.error('❌ Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor — handle 401 errors
API.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response (${response.status}):`, response.data);
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      console.error('❌ 401 Unauthorized — Token may be expired or invalid');
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default API;