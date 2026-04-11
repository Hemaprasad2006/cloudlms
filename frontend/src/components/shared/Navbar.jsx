import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLogOut, FiMenu, FiX } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdown, setDropdown] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/login'); };
  const isActive = (p) => location.pathname === p;

  const navLinks = [
    { to: '/courses',   label: 'Explore',        roles: ['student','teacher','admin'] },
    { to: '/dashboard', label: 'My Learning',     roles: ['student'] },
    { to: '/teacher',   label: 'Teacher Portal',  roles: ['teacher','admin'] },
    { to: '/admin',     label: 'Admin',           roles: ['admin'] },
  ].filter(l => l.roles.includes(user?.role));

  const badgeClass = { student: 'badge-student', teacher: 'badge-teacher', admin: 'badge-admin' };

  return (
    <nav className="navbar">
      <Link to="/courses" className="navbar-logo">
        <span className="navbar-logo-dot" />
        CloudLMS
      </Link>

      {/* Desktop Nav */}
      <div className="nav-links" style={{ display: 'flex' }}>
        {navLinks.map(l => (
          <Link key={l.to} to={l.to} className={`nav-link ${isActive(l.to) ? 'active' : ''}`}>
            {l.label}
          </Link>
        ))}
      </div>

      {/* User Menu */}
      <div style={{ position: 'relative' }}>
        <div className="nav-user" onClick={() => setDropdown(!dropdown)}>
          <div className="nav-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{user?.name?.split(' ')[0]}</span>
          <span className={`nav-badge ${badgeClass[user?.role]}`}>{user?.role}</span>
        </div>

        {dropdown && (
          <div className="dropdown">
            <div className="dropdown-header">
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{user?.name}</div>
              <div className="dropdown-email">{user?.email}</div>
            </div>
            <button className="dropdown-btn" onClick={handleLogout}>
              <FiLogOut size={14} /> Sign out
            </button>
          </div>
        )}
      </div>

      {/* Click outside to close */}
      {dropdown && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 99 }} onClick={() => setDropdown(false)} />
      )}
    </nav>
  );
}