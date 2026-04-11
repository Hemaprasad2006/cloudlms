import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getEnrolledCourses } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import CourseCard from '../components/courses/CourseCard';
import { FiCompass, FiBookOpen, FiAward } from 'react-icons/fi';

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEnrolledCourses()
      .then(({ data }) => setCourses(data))
      .catch(() => setCourses([]))
      .finally(() => setLoading(false));
  }, []);

  const timeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="page">
      {/* Hero */}
      <div className="dashboard-hero">
        <div className="dashboard-welcome">{timeOfDay()} 👋</div>
        <div className="dashboard-name">{user?.name}</div>
        <div className="dashboard-sub">
          {courses.length === 0
            ? "You haven't enrolled in any courses yet. Start learning today!"
            : `You're enrolled in ${courses.length} course${courses.length > 1 ? 's' : ''}. Keep it up!`
          }
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple"><FiBookOpen /></div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">Courses Enrolled</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><FiAward /></div>
          <div className="stat-value">0</div>
          <div className="stat-label">Completed</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiCompass /></div>
          <div className="stat-value">{courses.length > 0 ? 'Active' : 'Start!'}</div>
          <div className="stat-label">Learning Status</div>
        </div>
      </div>

      {/* Courses */}
      <div className="section-header">
        <div className="section-title">My Courses</div>
        <Link to="/courses" className="section-link">Browse more →</Link>
      </div>

      {loading ? (
        <div className="courses-grid">
          {[...Array(3)].map((_,i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ height: 160 }} />
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton" style={{ height: 16, width: '75%' }} />
                <div className="skeleton" style={{ height: 12, width: '100%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">No courses yet</div>
          <div className="empty-sub">Explore our library and enroll in your first course</div>
          <Link to="/courses" className="btn btn-primary">
            <FiCompass /> Explore Courses
          </Link>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(c => <CourseCard key={c._id} course={c} />)}
        </div>
      )}
    </div>
  );
}