import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { publishCourse, unpublishCourse, deleteCourse, createCourse, getMyCourses } from '../utils/api';
import { FiPlus, FiBook, FiUsers, FiEye, FiEyeOff, FiTrash2, FiChevronRight } from 'react-icons/fi';

export default function TeacherPortalPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', category: 'Other' });
  const [submitting, setSubmitting] = useState(false);

  const CATEGORIES = ['Mathematics','Science','Physics','Chemistry','Biology','Computer Science','English','History','Geography','Other'];

  useEffect(() => {
    if (user?.role !== 'teacher' && user?.role !== 'admin') {
      navigate('/courses');
      return;
    }
    fetchCourses();
  }, [user, navigate]);

  const fetchCourses = async () => {
    try {
      const res = await getMyCourses();
      const list = Array.isArray(res.data) ? res.data : [];
      setCourses(list);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      toast.error('Please fill in all fields');
      return;
    }
    setSubmitting(true);
    try {
      await createCourse(form);
      toast.success('Course created!');
      setShowModal(false);
      setForm({ title: '', description: '', category: 'Other' });
      fetchCourses();
    } catch {
      toast.error('Failed to create course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePublish = async (e, course) => {
    e.stopPropagation();
    try {
      if (course.isPublished) {
        await unpublishCourse(course._id);
        toast.success('Course unpublished');
      } else {
        await publishCourse(course._id);
        toast.success('Course published!');
      }
      fetchCourses();
    } catch {
      toast.error('Failed to update course');
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm('Delete this course?')) return;
    try {
      await deleteCourse(id);
      toast.success('Course deleted');
      fetchCourses();
    } catch {
      toast.error('Failed to delete course');
    }
  };

  return (
    <div className="page">

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: 'var(--purple-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--purple-light)' }}>
              <FiBook size={20} />
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>Teacher Portal</h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage your courses and upload learning materials.
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus size={16} /> New Course
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: '2rem' }}>
        <div className="stat-card">
          <div className="stat-icon purple"><FiBook /></div>
          <div className="stat-value">{courses.length}</div>
          <div className="stat-label">Total Courses</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><FiEye /></div>
          <div className="stat-value">{courses.filter(c => c.isPublished).length}</div>
          <div className="stat-label">Published</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon cyan"><FiUsers /></div>
          <div className="stat-value">{courses.reduce((acc, c) => acc + (c.enrolledStudents?.length || 0), 0)}</div>
          <div className="stat-label">Total Students</div>
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {[...Array(3)].map((_,i) => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <div className="empty-title">No courses yet</div>
          <div className="empty-sub">Create your first course to get started</div>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <FiPlus size={16} /> Create Course
          </button>
        </div>
      ) : (
        <div className="course-list">
          {courses.map(course => (
            <div
              key={course._id}
              className="course-list-item"
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <div className="course-list-title">{course.title}</div>
                    <span className={`status-pill ${course.isPublished ? 'published' : 'draft'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <div className="course-list-cat">{course.category} · {course.enrolledStudents?.length || 0} students</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <button
                    className="btn-icon"
                    title={course.isPublished ? 'Unpublish' : 'Publish'}
                    onClick={e => handleTogglePublish(e, course)}
                    style={{ color: course.isPublished ? 'var(--green)' : 'var(--text-muted)' }}
                  >
                    {course.isPublished ? <FiEye size={15} /> : <FiEyeOff size={15} />}
                  </button>
                  <button
                    className="btn-icon"
                    title="Delete course"
                    onClick={e => handleDelete(e, course._id)}
                    style={{ color: 'var(--red)' }}
                  >
                    <FiTrash2 size={15} />
                  </button>
                  <FiChevronRight size={16} style={{ color: 'var(--text-muted)', marginLeft: 4 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Course Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-title">Create New Course</div>
            <div className="modal-sub">Fill in the details to publish your course</div>

            <div className="form-group">
              <label className="form-label">Course Title</label>
              <input
                className="form-input"
                placeholder="e.g. Introduction to Physics"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea
                className="form-textarea"
                placeholder="What will students learn?"
                rows={3}
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-select"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="modal-actions">
              <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleCreate} disabled={submitting}>
                {submitting ? 'Creating...' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}