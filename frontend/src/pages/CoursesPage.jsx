import React, { useState, useEffect, useCallback } from 'react';
import { getCourses } from '../utils/api';
import CourseCard from '../components/courses/CourseCard';
import { FiSearch, FiZap } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All','Mathematics','Science','Physics','Chemistry','Biology','Computer Science','English','History','Geography','Other'];

export default function CoursesPage() {
  const [courses, setCourses]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [category, setCategory]       = useState('All');
  const [page, setPage]               = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const { user } = useAuth();
  const fetchCourses = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category !== 'All') params.category = category;
      const { data } = await getCourses(params);
      setCourses(data.courses);
      setTotal(data.total);
    } catch { setCourses([]); }
    finally { setLoading(false); }
  }, [search, category, page]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  const handleSearch = (e) => { e.preventDefault(); setSearch(searchInput); setPage(1); };
  const handleCategory = (cat) => { setCategory(cat); setPage(1); };

  return (
    <div className="page">
      {/* Hero */}
      <div className="hero">
        <div className="hero-tag"><FiZap size={12}/> Cloud-Powered Learning</div>
        <h1>Learn Without <span>Limits</span></h1>
        <p>Discover expert-led courses. Access notes and videos anytime, anywhere from the cloud.</p>
        {!user && (
  <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: '1.5rem' }}>
    <Link to="/login" className="btn btn-primary">
      Sign In
    </Link>
    <Link to="/register" className="btn btn-outline">
      Create Account
    </Link>
  </div>
)}

        {/* Search */}
        <form onSubmit={handleSearch} className="search-wrap">
          <div className="search-input-wrap">
            <FiSearch className="search-icon" size={18} />
            <input type="text" className="search-input" placeholder="Search courses..."
              value={searchInput} onChange={e => setSearchInput(e.target.value)} />
          </div>
          <button type="submit" className="btn-search">Search</button>
        </form>

        {/* Categories */}
        <div className="categories">
          {CATEGORIES.map(cat => (
            <button key={cat} className={`cat-pill ${category === cat ? 'active' : ''}`}
              onClick={() => handleCategory(cat)}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Results header */}
      <div className="section-header">
        <div className="section-title">
          {search ? `Results for "${search}"` : category !== 'All' ? category : 'All Courses'}
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 400, marginLeft: 8 }}>
            ({total} courses)
          </span>
        </div>
        {(search || category !== 'All') && (
          <button className="btn btn-outline btn-sm"
            onClick={() => { setSearch(''); setSearchInput(''); setCategory('All'); }}>
            Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="courses-grid">
          {[...Array(8)].map((_,i) => (
            <div key={i} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--card)', border: '1px solid var(--border)' }}>
              <div className="skeleton" style={{ height: 160 }} />
              <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div className="skeleton" style={{ height: 16, width: '75%' }} />
                <div className="skeleton" style={{ height: 12, width: '100%' }} />
                <div className="skeleton" style={{ height: 12, width: '60%' }} />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No courses found</div>
          <div className="empty-sub">Try different search terms or browse all categories</div>
          <button className="btn btn-primary" onClick={() => { setSearch(''); setSearchInput(''); setCategory('All'); }}>
            Browse All Courses
          </button>
        </div>
      ) : (
        <div className="courses-grid">
          {courses.map(course => <CourseCard key={course._id} course={course} />)}
        </div>
      )}

      {/* Pagination */}
      {total > 12 && (
        <div className="pagination">
          {[...Array(Math.ceil(total / 12))].map((_,i) => (
            <button key={i} className={`page-btn ${page === i+1 ? 'active' : ''}`}
              onClick={() => setPage(i+1)}>
              {i+1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}