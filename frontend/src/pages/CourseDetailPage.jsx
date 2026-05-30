import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiFileText, FiPlay, FiDownload, FiLock, FiChevronLeft, FiBookOpen } from 'react-icons/fi';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse]       = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [active, setActive]       = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        console.log('Token:', token ? 'Found' : 'Not found');

        // Fetch course
        const courseRes = await API.get(`/courses/${id}`);
        setCourse(courseRes.data);
        console.log('Course fetched:', courseRes.data.title);

        // Fetch materials with explicit token header
        try {
          const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
          const materialsRes = await API.get(`/materials/course/${id}`, config);
          console.log('Materials fetched:', materialsRes.data.length, 'items');
          setMaterials(materialsRes.data || []);
        } catch (matErr) {
          console.error('Materials error:', matErr.message);
          console.error('Full error:', matErr.response?.data);
          setMaterials([]);
        }
      } catch (err) {
        console.error('Course error:', err.message);
        toast.error('Course not found.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const isTeacher  = course?.teacher?._id === user?._id || user?.role === 'admin';
  const isEnrolled = course?.enrolledStudents?.includes(user?._id);
  const canAccess  = isTeacher || isEnrolled;

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try {
      await API.post(`/courses/${id}/enroll`);
      toast.success('Enrolled successfully! 🎉');
      const { data } = await API.get(`/courses/${id}`);
      setCourse(data);
      
      // Refetch materials after enrollment
      const token = localStorage.getItem('token');
      const config = token ? { headers: { 'Authorization': `Bearer ${token}` } } : {};
      const matRes = await API.get(`/materials/course/${id}`, config);
      setMaterials(matRes.data || []);
    } catch (err) {
      console.error('Enroll error:', err);
      toast.error(err.response?.data?.message || 'Enrollment failed.');
    } finally { 
      setEnrolling(false); 
    }
  };

  if (loading) return (
    <div className="page">
      <div className="skeleton" style={{ height: 40, width: '40%', borderRadius: 'var(--radius-sm)', marginBottom: 16 }} />
      <div className="skeleton" style={{ height: 220, borderRadius: 'var(--radius-lg)', marginBottom: 16 }} />
    </div>
  );

  if (!course) return (
    <div className="page" style={{ textAlign: 'center', paddingTop: '4rem', color: 'var(--text-muted)' }}>
      Course not found.
    </div>
  );

  return (
    <div className="page">
      <a href="#" className="back-link" onClick={e => { e.preventDefault(); navigate('/courses'); }}>
        <FiChevronLeft size={16} /> Back to courses
      </a>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 24, alignItems: 'start' }}>
        <div>
          <div className="course-detail-hero">
            <div className="course-detail-hero-content">
              <div className="course-detail-tag">📚 {course.category}</div>
              <h1 className="course-detail-title">{course.title}</h1>
              <p className="course-detail-desc">{course.description}</p>
              <div className="course-meta">
                <div className="course-meta-item"><FiUsers size={14}/> {course.enrolledStudents?.length || 0} students</div>
                <div className="course-meta-item"><FiBookOpen size={14}/> {materials.length} materials</div>
                <div className="course-meta-item">👤 {course.teacher?.name}</div>
              </div>
            </div>
          </div>

          {active && (
            <div className="viewer-card">
              <div className="viewer-header">
                <div className="viewer-title">{active.title}</div>
                <button className="btn btn-outline btn-sm" onClick={() => setActive(null)}>Close</button>
              </div>
              {active.type === 'video' ? (
                <div className="video-wrap">
                  <video src={active.cloudinaryUrl} controls style={{ width: '100%', height: '100%' }} />
                </div>
              ) : (
                <div className="pdf-viewer">
                  <div className="pdf-icon">📄</div>
                  <div style={{ fontWeight: 700, marginBottom: 8 }}>{active.title}</div>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 20 }}>
                    Click below to open or download this note
                  </p>
                  <a href={active.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                    className="btn btn-primary">
                    <FiDownload /> Download / View Note
                  </a>
                </div>
              )}
            </div>
          )}

          {canAccess && materials.length > 0 && (
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                <div className="card-title">Course Materials ({materials.length})</div>
              </div>
              {materials.map(mat => (
                <button key={mat._id}
                  onClick={() => setActive(active?._id === mat._id ? null : mat)}
                  style={{
                    width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
                    background: active?._id === mat._id ? 'var(--purple-glow)' : 'transparent',
                    transition: 'all 0.2s'
                  }}>
                  <div className="material-item">
                    <div className={`material-type-icon ${mat.type}`}>
                      {mat.type === 'video' ? <FiPlay size={15}/> : <FiFileText size={15}/>}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div className="material-name">{mat.title}</div>
                      {mat.description && <div className="material-type">{mat.description}</div>}
                    </div>
                    <span style={{
                      fontSize: '0.7rem', padding: '3px 10px', borderRadius: 50, fontWeight: 600,
                      textTransform: 'capitalize',
                      background: mat.type === 'video' ? 'var(--purple-glow)' : 'var(--cyan-glow)',
                      color: mat.type === 'video' ? 'var(--purple-light)' : 'var(--cyan)',
                      border: `1px solid ${mat.type === 'video' ? 'var(--purple)' : 'var(--cyan)'}40`
                    }}>
                      {mat.type}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {!canAccess && (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <FiLock size={40} style={{ color: 'var(--text-muted)', marginBottom: 16 }} />
              <h3 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, marginBottom: 8 }}>
                Enroll to Access Materials
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                {materials.length} learning resources waiting for you
              </p>
            </div>
          )}
        </div>

        <div className="course-sidebar">
          <div className="enroll-card">
            {course.thumbnail && (
              <img src={course.thumbnail} alt={course.title}
                style={{ width: '100%', height: 150, objectFit: 'cover', borderRadius: 'var(--radius)', marginBottom: 20 }} />
            )}
            <div className="enroll-card-top">
              {[
                ['Materials', `${materials.length} items`],
                ['Students',  course.enrolledStudents?.length || 0],
                ['Category',  course.category],
                ['Instructor',course.teacher?.name],
              ].map(([l, v]) => (
                <div className="enroll-stat" key={l}>
                  <span className="enroll-stat-label">{l}</span>
                  <span className="enroll-stat-value">{v}</span>
                </div>
              ))}
            </div>

            {!user ? (
              <button className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => navigate('/login')}>
                Login to Enroll
              </button>
            ) : isTeacher ? (
              <div className="instructor-badge">🎓 You are the instructor</div>
            ) : isEnrolled ? (
              <div className="enrolled-badge">✓ Enrolled</div>
            ) : (
              <button className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Enrolling...' : '🚀 Enroll for Free'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}