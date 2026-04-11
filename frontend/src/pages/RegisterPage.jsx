import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { FiUser, FiMail, FiLock } from 'react-icons/fi';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm]     = useState({ name: '', email: '', password: '', role: 'student' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name}! 🎉`);
      navigate(user.role === 'teacher' ? '/teacher' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-left">
        <div className="auth-left-content">
          <div className="auth-logo-big">Join CloudLMS</div>
          <p className="auth-tagline">
            Create your free account and start learning or teaching today.
          </p>
          <div className="auth-features">
            {[
              { icon: '🎓', title: 'For Students', desc: 'Enroll in courses, watch videos, download notes — all free.' },
              { icon: '📚', title: 'For Teachers', desc: 'Create courses and upload materials to reach thousands of students.' },
              { icon: '☁️', title: '100% Cloud', desc: 'Everything is stored securely in the cloud. Access anywhere.' },
            ].map(f => (
              <div className="auth-feature" key={f.title}>
                <div className="auth-feature-icon" style={{ background: '#06b6d420', fontSize: '1.2rem' }}>{f.icon}</div>
                <div className="auth-feature-text">
                  <strong>{f.title}</strong>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-form-wrap">
          <div className="auth-title">Create account</div>
          <div className="auth-subtitle">Join thousands of learners today</div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div className="input-wrap">
                <FiUser className="input-icon" size={16} />
                <input type="text" className="form-input" placeholder="John Doe" required
                  value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="input-wrap">
                <FiMail className="input-icon" size={16} />
                <input type="email" className="form-input" placeholder="you@example.com" required
                  value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="input-wrap">
                <FiLock className="input-icon" size={16} />
                <input type="password" className="form-input" placeholder="Min 6 characters" required
                  value={form.password} onChange={e => setForm({...form, password: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">I am a...</label>
              <div className="role-select-grid">
                {[
                  { value: 'student', emoji: '👨‍🎓', label: 'Student' },
                  { value: 'teacher', emoji: '👩‍🏫', label: 'Teacher' },
                ].map(r => (
                  <div key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`}
                    onClick={() => setForm({...form, role: r.value})}>
                    <div className="role-option-emoji">{r.emoji}</div>
                    <div className="role-option-label">{r.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '1.5rem' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--purple-light)', fontWeight: 600, textDecoration: 'none' }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}