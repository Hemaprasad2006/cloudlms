import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-toastify';
import { getMyCourses, createCourse, deleteCourse, updateCourse, uploadNote, uploadVideo, getCourseMaterials, deleteMaterial } from '../utils/api';
import { FiPlus, FiTrash2, FiUpload, FiFileText, FiVideo, FiBook, FiEye, FiEyeOff, FiEdit3 } from 'react-icons/fi';

const CATEGORIES = ['Mathematics','Science','Physics','Chemistry','Biology','Computer Science','English','History','Geography','Other'];

function CreateModal({ onClose, onCreated }) {
  const [form, setForm]     = useState({ title: '', description: '', category: 'Computer Science' });
  const [thumb, setThumb]   = useState(null);
  const [loading, setLoading] = useState(false);
  const [thumbName, setThumbName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('category', form.category);
      if (thumb) fd.append('thumbnail', thumb);
      const { data } = await createCourse(fd);
      toast.success('Course created! 🎉');
      onCreated(data.course); onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create course.');
    } finally { setLoading(false); }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-title">Create New Course</div>
        <div className="modal-sub">Fill in the details to create your course</div>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Course Title</label>
            <input type="text" className="form-input" placeholder="e.g. Introduction to Python" required
              value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-textarea" rows={3} placeholder="What will students learn?" required
              value={form.description} onChange={e => setForm({...form, description: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Thumbnail (optional)</label>
            <div className="file-input-wrap">
              <input type="file" accept="image/*" className="file-input"
                onChange={e => { setThumb(e.target.files[0]); setThumbName(e.target.files[0]?.name || ''); }} />
              <div className={`file-input-label ${thumbName ? 'file-selected' : ''}`}>
                📷 {thumbName || 'Choose an image'}
              </div>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
              {loading ? 'Creating...' : 'Create Course'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function UploadPanel({ courseId, onUploaded }) {
  const [type, setType]           = useState('note');
  const [file, setFile]           = useState(null);
  const [fileName, setFileName]   = useState('');
  const [title, setTitle]         = useState('');
  const [progress, setProgress]   = useState(0);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  const handleUpload = async () => {
    if (!file || !title.trim()) return toast.error('Please select a file and enter a title.');
    setUploading(true); setProgress(0);
    try {
      const fd = new FormData();
      fd.append('file', file); fd.append('courseId', courseId); fd.append('title', title);
      const fn = type === 'note' ? uploadNote : uploadVideo;
      const { data } = await fn(fd, setProgress);
      toast.success(`${type === 'note' ? 'Note' : 'Video'} uploaded! 🚀`);
      onUploaded(data.material);
      setFile(null); setTitle(''); setProgress(0); setFileName('');
      fileRef.current.value = '';
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed.');
    } finally { setUploading(false); }
  };

  return (
    <div className="upload-area">
      <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>
        ⬆️ Upload Material
      </div>
      <div className="upload-type-tabs">
        {[
          { id: 'note',  icon: <FiFileText size={14}/>, label: 'Note (PDF)' },
          { id: 'video', icon: <FiVideo size={14}/>,    label: 'Video (MP4)' },
        ].map(t => (
          <button key={t.id} className={`upload-tab ${type === t.id ? 'active' : ''}`}
            onClick={() => { setType(t.id); setFile(null); setFileName(''); fileRef.current && (fileRef.current.value = ''); }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      <div className="form-group">
        <input type="text" className="form-input" placeholder="Material title..." value={title}
          onChange={e => setTitle(e.target.value)} style={{ fontSize: '0.875rem' }} />
      </div>
      <div className="file-input-wrap" style={{ marginBottom: 12 }}>
        <input ref={fileRef} type="file"
          accept={type === 'note' ? '.pdf,.doc,.docx' : '.mp4,.mov,.avi'}
          className="file-input"
          onChange={e => { setFile(e.target.files[0]); setFileName(e.target.files[0]?.name || ''); }} />
        <div className={`file-input-label ${fileName ? 'file-selected' : ''}`}>
          {type === 'note' ? '📄' : '🎥'} {fileName || `Choose ${type === 'note' ? 'PDF/DOCX' : 'MP4/MOV'} file`}
        </div>
      </div>
      {uploading && (
        <div className="progress-wrap">
          <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }}/></div>
          <div className="progress-label">{progress}% uploaded</div>
        </div>
      )}
      <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 4 }}
        onClick={handleUpload} disabled={uploading}>
        <FiUpload size={14}/> {uploading ? `Uploading ${progress}%...` : 'Upload'}
      </button>
    </div>
  );
}

export default function TeacherPortalPage() {
  const [courses, setCourses]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [showCreate, setShowCreate]   = useState(false);
  const [selected, setSelected]       = useState(null);
  const [materials, setMaterials]     = useState([]);
  const [matsLoading, setMatsLoading] = useState(false);

  useEffect(() => {
    getMyCourses().then(({ data }) => setCourses(data)).finally(() => setLoading(false));
  }, []);

  const selectCourse = async (course) => {
    setSelected(course); setMatsLoading(true);
    try { const { data } = await getCourseMaterials(course._id); setMaterials(data); }
    catch { setMaterials([]); }
    finally { setMatsLoading(false); }
  };

  const handleToggle = async (course) => {
    try {
      const fd = new FormData();
      fd.append('isPublished', String(!course.isPublished));
      const { data } = await updateCourse(course._id, fd);
      setCourses(prev => prev.map(c => c._id === course._id ? data.course : c));
      if (selected?._id === course._id) setSelected(data.course);
      toast.success(`Course ${data.course.isPublished ? 'published! 🚀' : 'unpublished.'}`);
    } catch { toast.error('Failed.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course and all its materials?')) return;
    try {
      await deleteCourse(id);
      setCourses(prev => prev.filter(c => c._id !== id));
      if (selected?._id === id) { setSelected(null); setMaterials([]); }
      toast.success('Course deleted.');
    } catch { toast.error('Failed.'); }
  };

  const handleDeleteMat = async (matId) => {
    if (!window.confirm('Delete this material?')) return;
    try {
      await deleteMaterial(matId);
      setMaterials(prev => prev.filter(m => m._id !== matId));
      toast.success('Material deleted.');
    } catch { toast.error('Failed.'); }
  };

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: 4 }}>
            Teacher Portal
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {courses.length} course{courses.length !== 1 ? 's' : ''} created
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowCreate(true)}>
          <FiPlus /> New Course
        </button>
      </div>

      <div className="portal-layout">
        {/* Course List */}
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12 }}>
            Your Courses
          </div>
          {loading ? (
            [...Array(3)].map((_,i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius)', marginBottom: 10 }} />)
          ) : courses.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem' }}>
              <div className="empty-icon">📚</div>
              <div className="empty-title" style={{ fontSize: '1rem' }}>No courses yet</div>
              <div className="empty-sub">Click "New Course" to get started</div>
            </div>
          ) : (
            <div className="course-list">
              {courses.map(course => (
                <div key={course._id} className={`course-list-item ${selected?._id === course._id ? 'selected' : ''}`}
                  onClick={() => selectCourse(course)}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div className="course-list-title">{course.title}</div>
                      <div className="course-list-cat">{course.category}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="btn-icon" title={course.isPublished ? 'Unpublish' : 'Publish'}
                        onClick={e => { e.stopPropagation(); handleToggle(course); }}
                        style={{ color: course.isPublished ? 'var(--green)' : 'var(--text-muted)' }}>
                        {course.isPublished ? <FiEye size={13}/> : <FiEyeOff size={13}/>}
                      </button>
                      <button className="btn-icon" style={{ color: 'var(--red)' }}
                        onClick={e => { e.stopPropagation(); handleDelete(course._id); }}>
                        <FiTrash2 size={13}/>
                      </button>
                    </div>
                  </div>
                  <div style={{ marginTop: 8 }}>
                    <span className={`status-pill ${course.isPublished ? 'published' : 'draft'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div>
          {!selected ? (
            <div className="empty-state card" style={{ height: 300 }}>
              <div className="empty-icon">👈</div>
              <div className="empty-title">Select a Course</div>
              <div className="empty-sub">Choose a course from the left to manage its materials</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Course Info */}
              <div className="card">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                  <div style={{ flex: 1 }}>
                    <h2 style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.1rem' }}>{selected.title}</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: 4 }}>{selected.description}</p>
                  </div>
                </div>
              </div>

              {/* Upload */}
              <UploadPanel courseId={selected._id} onUploaded={(mat) => setMaterials(prev => [mat, ...prev])} />

              {/* Materials */}
              <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)' }}>
                  <div className="card-title">Materials ({materials.length})</div>
                </div>
                {matsLoading ? (
                  <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[...Array(3)].map((_,i) => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 'var(--radius-sm)' }} />)}
                  </div>
                ) : materials.length === 0 ? (
                  <div className="empty-state" style={{ padding: '2rem' }}>
                    <div className="empty-icon">📂</div>
                    <div className="empty-title" style={{ fontSize: '1rem' }}>No materials yet</div>
                    <div className="empty-sub">Upload notes or videos above</div>
                  </div>
                ) : (
                  materials.map(mat => (
                    <div className="material-item" key={mat._id}>
                      <div className={`material-type-icon ${mat.type}`}>
                        {mat.type === 'video' ? '🎥' : '📄'}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="material-name">{mat.title}</div>
                        <div className="material-type">{mat.type === 'video' ? 'Video' : 'Note'}</div>
                      </div>
                      <a href={mat.cloudinaryUrl} target="_blank" rel="noopener noreferrer"
                        className="btn btn-outline btn-sm">View</a>
                      <button className="btn-icon" style={{ color: 'var(--red)' }}
                        onClick={() => handleDeleteMat(mat._id)}>
                        <FiTrash2 size={13}/>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showCreate && <CreateModal onClose={() => setShowCreate(false)} onCreated={(c) => setCourses(prev => [c, ...prev])} />}
    </div>
  );
}