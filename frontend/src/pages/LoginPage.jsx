import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}! 🎉`);
      if (user.role === 'teacher' || user.role === 'admin') navigate('/teacher');
      else navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo-big">CloudLMS</div>
          <p className="auth-tagline">
            The next-generation cloud platform for modern education. Learn anything, anywhere.
          </p>
          <div className="auth-features">
            {[
              { icon: '🚀', title: 'Cloud Powered', desc: 'Access your courses from any device, anywhere in the world.' },
              { icon: '🎥', title: 'Rich Content', desc: 'Stream videos and download notes uploaded by expert teachers.' },
              { icon: '🔒', title: 'Secure Platform', desc: 'JWT authentication keeps your account safe at all times.' },
              { icon: '⚡', title: 'Instant Access', desc: 'Enroll in courses and get immediate access to all materials.' },
            ].map(f => (
              <div className="auth-feature" key={f.title}>
                <div className="auth-feature-icon" style={{ background: '#7c3aed20', fontSize: '1.2rem' }}>
                  {f.icon}
                </div>
                <div className="auth-feature-text">
                  <strong>{f.title}</strong>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-title">Welcome back 👋</div>
          <div className="auth-subtitle">Sign in to continue learning</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" size={16} />
                <input type="email" className="form-input" placeholder="you@example.com"
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" size={16} />
                <input type={showPass ? 'text' : 'password'} className="form-input"
                  placeholder="••••••••" value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})} required />
                <button type="button" className="input-toggle" onClick={() => setShowPass(!showPass)}>
                  {showPass ? <FiEyeOff size={16}/> : <FiEye size={16}/>}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px', marginTop: '8px' }}>
              {loading ? 'Signing in...' : 'Sign in →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--purple-light)', fontWeight: 600, textDecoration: 'none' }}>
              Create one free
            </Link>
          </p>

          <div className="demo-creds">
            <div className="demo-creds-title">⚡ Demo Accounts</div>
            {[
              ['👨‍🎓 Student', 'student@demo.com'],
              ['👩‍🏫 Teacher', 'teacher@demo.com'],
              ['👑 Admin',   'admin@demo.com'],
            ].map(([role, email]) => (
              <div className="demo-cred" key={role}
                style={{ cursor: 'pointer' }}
                onClick={() => setForm({ email, password: 'demo123' })}>
                {role} → <span>{email}</span> / <span>demo123</span>
              </div>
            ))}
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
              Click a row to auto-fill ↑
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}