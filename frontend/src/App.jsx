import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/shared/Navbar';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import DashboardPage from './pages/DashboardPage';
import TeacherPortalPage from './pages/TeacherPortalPage';
import AdminPanelPage from './pages/AdminPanelPage';
import NotFoundPage from './pages/NotFoundPage';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Navbar />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/courses" element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/my-learning" element={<DashboardPage />} />
          <Route path="/teacher-portal" element={<TeacherPortalPage />} />
          <Route path="/admin" element={<AdminPanelPage />} />
          <Route path="/" element={<Navigate to="/courses" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
        <ToastContainer position="bottom-right" theme="dark" />
      </Router>
    </AuthProvider>
  );
}