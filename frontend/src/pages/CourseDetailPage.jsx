import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { uploadNote, uploadVideo, deleteMaterial } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { FiUsers, FiFileText, FiPlay, FiDownload, FiLock, FiChevronLeft, FiBookOpen, FiUpload, FiTrash2, FiPlus, FiX } from 'react-icons/fi';

export default function CourseDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [active, setActive] = useState(null);

  // Upload state
  const [showUpload, setShowUpload] = useState(false);
  const [uploadType, setUploadType] = useState('note'); // 'note' | 'video'
  const [uploadForm, setUploadForm] = useState({ title: '', description: '' });
  const [uploadFile, setUploadFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const courseRes = await API.get(`/courses/${id}`);
      setCourse(courseRes.data);

      const token = localStorage.getItem('token');
      if (token) {
        try {
          const materialsRes = await API.get(`/materials/course/${id}`);
          setMaterials(Array.isArray(materialsRes.data) ? materialsRes.data : []);
        } catch (matErr) {
          console.log('Materials fetch failed:', matErr.message);
          setMaterials([]);
        }
      } else {
        setMaterials([]);
      }
    } catch (err) {
      console.error('Course fetch error:', err);
      toast.error('Course not found.');
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = !!(course?.teacher?._id && user?._id &&
    (String(course.teacher._id) === String(user._id) || user?.role === 'admin'));
  const isEnrolled = course?.enrolledStudents?.some(id => String(id) === String(user?._id));
  const canAccess = isTeacher || isEnrolled;

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try {
      await API.post(`/courses/${id}/enroll`);
      toast.success('Enrolled successfully! 🎉');
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed.');
    } finally {
      setEnrolling(false);
    }
  };

  const handleUpload = async () => {
    if (!uploadForm.title.trim()) {
      toast.error('Please enter a title');
      return;
    }
    if (!uploadFile) {
      toast.error('Please select a file');
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('courseId', id);
      formData.append('title', uploadForm.title.trim());
      formData.append('description', uploadForm.description.trim());
      formData.append('file', uploadFile);

      if (uploadType === 'note') {
        await uploadNote(id, formData);
      } else {
        await uploadVideo(id, formData);
      }

      toast.success(`${uploadType === 'note' ? 'Note' : 'Video'} uploaded successfully! 🎉`);
      setUploadForm({ title: '', description: '' });
      setUploadFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      setShowUpload(false);
      await fetchData();
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteMaterial = async (e, matId) => {
    e.stopPropagation();
    if (!window.confirm('Delete this material?')) return;
    setDeletingId(matId);
    try {
      await deleteMaterial(matId);
      toast.success('Material deleted');
      if (active?._id === matId) setActive(null);
      await fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete material');
    } finally {
      setDeletingId(null);
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
      <a href="#" className="back-link" onClick={e => { e.preventDefault(); navigate(isTeacher ? '/teacher-portal' : '/courses'); }}>
        <FiChevronLeft size={16} /> {isTeacher ? 'Back to Teacher Portal' : 'Back to courses'}
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

          {/* ── TEACHER UPLOAD PANEL ── */}
          {isTeacher && (
            <div className="card" style={{ marginBottom: 24, padding: 0, overflow: 'hidden' }}>
              <div style={{
                padding: '14px 20px',
                borderBottom: showUpload ? '1px solid var(--border)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 700, fontSize: '0.95rem' }}>
                  <FiUpload size={16} style={{ color: 'var(--purple-light)' }} />
                  Upload Materials
                </div>
                <button
                  className="btn btn-primary"
                  style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                  onClick={() => setShowUpload(v => !v)}
                >
                  {showUpload ? <><FiX size={14}/> Close</> : <><FiPlus size={14}/> Add Material</>}
                </button>
              </div>

              {showUpload && (
                <div style={{ padding: 20 }}>
                  {/* Type tabs */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                    {[['note', '📄 Note / PDF'], ['video', '🎬 Video']].map(([t, label]) => (
                      <button
                        key={t}
                        onClick={() => { setUploadType(t); setUploadFile(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                        style={{
                          padding: '6px 16px', borderRadius: 'var(--radius-sm)', border: 'none',
                          cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, transition: 'all 0.2s',
                          background: uploadType === t ? 'var(--purple)' : 'var(--surface-2)',
                          color: uploadType === t ? '#fff' : 'var(--text-muted)',
                        }}
                      >{label}</button>
                    ))}
                  </div>

                  {/* Title */}
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input
                      className="form-input"
                      placeholder={uploadType === 'note' ? 'e.g. Chapter 1 Notes' : 'e.g. Intro Lecture'}
                      value={uploadForm.title}
                      onChange={e => setUploadForm(f => ({ ...f, title: e.target.value }))}
                    />
                  </div>

                  {/* Description */}
                  <div className="form-group">
                    <label className="form-label">Description (optional)</label>
                    <input
                      className="form-input"
                      placeholder="Brief description..."
                      value={uploadForm.description}
                      onChange={e => setUploadForm(f => ({ ...f, description: e.target.value }))}
                    />
                  </div>

                  {/* File picker */}
                  <div className="form-group">
                    <label className="form-label">
                      {uploadType === 'note' ? 'PDF / Word File *' : 'Video File *'}
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={uploadType === 'note' ? '.pdf,.doc,.docx' : 'video/*'}
                      className="form-input"
                      style={{ padding: '8px 12px' }}
                      onChange={e => setUploadFile(e.target.files[0] || null)}
                    />
                    {uploadFile && (
                      <div style={{ marginTop: 6, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        📎 {uploadFile.name} ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                    )}
                  </div>

                  <button
                    className="btn btn-primary"
                    onClick={handleUpload}
                    disabled={uploading}
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    {uploading
                      ? <><span style={{ marginRight: 8 }}>⏳</span>Uploading to Cloudinary...</>
                      : <><FiUpload size={15}/> Upload {uploadType === 'note' ? 'Note' : 'Video'}</>
                    }
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Viewer */}
          {active && (
            <div className="viewer-card">
              <div className="viewer-header">
                <div className="viewer-title">{active.title}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {active.type === 'note' && (
                    <a
                      href={active.cloudinaryUrl}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ textDecoration: 'none' }}
                    >
                      <FiDownload size={13} /> Download
                    </a>
                  )}
                  <button className="btn btn-outline btn-sm" onClick={() => setActive(null)}>
                    <FiX size={13} /> Close
                  </button>
                </div>
              </div>

              {active.type === 'video' ? (
                <div className="video-wrap">
                  <video src={active.cloudinaryUrl} controls style={{ width: '100%', height: '100%' }} />
                </div>
              ) : (
                /* PDF / Note viewer — Google Docs Viewer renders any PDF inline */
                <div style={{ width: '100%', height: 620, borderRadius: '0 0 var(--radius) var(--radius)', overflow: 'hidden', background: '#1e1e2e' }}>
                  <iframe
                    src={`https://docs.google.com/viewer?url=${encodeURIComponent(active.cloudinaryUrl)}&embedded=true`}
                    title={active.title}
                    style={{ width: '100%', height: '100%', border: 'none' }}
                    allow="autoplay"
                  />
                  {/* Fallback message shown under the iframe */}
                  <div style={{ padding: '10px 16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    If the preview doesn't load,&nbsp;
                    <a href={active.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                      style={{ color: 'var(--purple-light)', textDecoration: 'underline' }}>
                      open / download the file directly
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Materials list */}
          {materials && materials.length > 0 && (isTeacher || canAccess) && (
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
                    {/* Teacher delete button */}
                    {isTeacher && (
                      <button
                        onClick={e => handleDeleteMaterial(e, mat._id)}
                        disabled={deletingId === mat._id}
                        title="Delete material"
                        style={{
                          marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer',
                          color: 'var(--red, #f87171)', padding: '4px', borderRadius: 4,
                          opacity: deletingId === mat._id ? 0.5 : 1, flexShrink: 0
                        }}
                      >
                        <FiTrash2 size={14}/>
                      </button>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Empty state for teacher */}
          {isTeacher && materials.length === 0 && !showUpload && (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📂</div>
              <div style={{ fontWeight: 700, marginBottom: 6 }}>No materials yet</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: 16 }}>
                Upload notes or videos to get started
              </div>
              <button className="btn btn-primary" onClick={() => setShowUpload(true)}>
                <FiPlus size={15}/> Upload First Material
              </button>
            </div>
          )}

          {!canAccess && !isTeacher && (
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
                ['Students', course.enrolledStudents?.length || 0],
                ['Category', course.category],
                ['Instructor', course.teacher?.name],
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