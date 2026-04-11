import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="notfound">
      <div className="notfound-code">404</div>
      <h2 style={{
        fontFamily: 'Syne, sans-serif',
        fontSize: '1.5rem',
        fontWeight: 800,
        margin: '1rem 0 0.5rem',
        color: 'var(--text)'
      }}>
        Page not found
      </h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist.
      </p>
      <button className="btn btn-primary" onClick={() => navigate('/courses')}>
        Go to Courses
      </button>
    </div>
  );
}