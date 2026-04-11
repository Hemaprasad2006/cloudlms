import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage         from './pages/LoginPage';
import RegisterPage      from './pages/RegisterPage';
import CoursesPage       from './pages/CoursesPage';
import CourseDetailPage  from './pages/CourseDetailPage';
import DashboardPage     from './pages/DashboardPage';
import TeacherPortalPage from './pages/TeacherPortalPage';
import AdminPage         from './pages/AdminPage';
import NotFoundPage      from './pages/NotFoundPage';
import Navbar            from './components/shared/Navbar';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="flex items-center justify-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"/>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppShell = () => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-gray-50">
      {user && <Navbar />}
      <main className={user ? 'pt-16' : ''}>
        <Routes>
          <Route path="/"          element={<Navigate to="/courses" replace />} />
          <Route path="/login"     element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/register"  element={<PublicRoute><RegisterPage /></PublicRoute>} />
          <Route path="/courses"   element={<CoursesPage />} />
          <Route path="/courses/:id" element={<CourseDetailPage />} />
          <Route path="/dashboard" element={<PrivateRoute roles={['student','teacher','admin']}><DashboardPage /></PrivateRoute>} />
          <Route path="/teacher"   element={<PrivateRoute roles={['teacher','admin']}><TeacherPortalPage /></PrivateRoute>} />
          <Route path="/admin"     element={<PrivateRoute roles={['admin']}><AdminPage /></PrivateRoute>} />
          <Route path="*"          element={<NotFoundPage />} />
        </Routes>
      </main>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppShell />
      </BrowserRouter>
    </AuthProvider>
  );
}