import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getAllUsers, toggleUserActive, promoteToTeacher } from '../utils/api';
import {
  FiUsers, FiBook, FiFileText, FiShield, FiUserCheck,
  FiUserX, FiTrendingUp, FiRefreshCw, FiSearch, FiChevronDown
} from 'react-icons/fi';

const ROLE_COLORS = {
  admin:   { bg: '#ef444420', color: '#ef4444', border: '#ef444440' },
  teacher: { bg: 'var(--purple-glow)', color: 'var(--purple-light)', border: 'var(--purple)40' },
  student: { bg: 'var(--cyan-glow)', color: 'var(--cyan)', border: 'var(--cyan)40' },
};

export default function AdminPanelPage() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [stats,       setStats]       = useState(null);
  const [users,       setUsers]       = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [usersLoading,setUsersLoading]= useState(true);
  const [search,      setSearch]      = useState('');
  const [roleFilter,  setRoleFilter]  = useState('all');
  const [actionIds,   setActionIds]   = useState({});   // { [userId]: 'toggle' | 'promote' }

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') { navigate('/courses'); }
  }, [user, navigate]);

  // Load stats + users in parallel
  useEffect(() => {
    fetchStats();
    fetchUsers();
  }, []);

  const fetchStats = async () => {
    try {
      const { data } = await getDashboardStats();
      setStats(data);
    } catch { toast.error('Failed to load stats'); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const { data } = await getAllUsers();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch { toast.error('Failed to load users'); }
    finally { setUsersLoading(false); }
  };

  const handleToggleActive = async (u) => {
    setActionIds(p => ({ ...p, [u._id]: 'toggle' }));
    try {
      await toggleUserActive(u._id);
      toast.success(`${u.name} ${u.isActive ? 'deactivated' : 'activated'}`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    } finally {
      setActionIds(p => { const n = {...p}; delete n[u._id]; return n; });
    }
  };

  const handlePromote = async (u) => {
    if (!window.confirm(`Promote ${u.name} to Teacher?`)) return;
    setActionIds(p => ({ ...p, [u._id]: 'promote' }));
    try {
      await promoteToTeacher(u._id);
      toast.success(`${u.name} is now a Teacher! 🎓`);
      fetchUsers();
      fetchStats();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Promotion failed');
    } finally {
      setActionIds(p => { const n = {...p}; delete n[u._id]; return n; });
    }
  };

  // Filtered users
  const filtered = users.filter(u => {
    const matchRole   = roleFilter === 'all' || u.role === roleFilter;
    const matchSearch = !search ||
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const statCards = stats ? [
    { label: 'Total Users',     value: stats.totalUsers,     icon: <FiUsers />,    color: 'purple' },
    { label: 'Teachers',        value: stats.teacherCount,   icon: <FiUserCheck />,color: 'cyan'   },
    { label: 'Students',        value: stats.studentCount,   icon: <FiTrendingUp />,color:'green'  },
    { label: 'Total Courses',   value: stats.totalCourses,   icon: <FiBook />,     color: 'orange' },
    { label: 'Total Materials', value: stats.totalMaterials, icon: <FiFileText />, color: 'purple' },
  ] : [];

  return (
    <div className="page">

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
            <div style={{
              width: 44, height: 44, borderRadius: 'var(--radius-sm)',
              background: '#ef444420', display: 'flex', alignItems: 'center',
              justifyContent: 'center', color: '#ef4444', fontSize: '1.2rem'
            }}>
              <FiShield />
            </div>
            <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>
              Admin Panel
            </h1>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            Manage users, monitor platform activity and control access.
          </p>
        </div>
        <button
          className="btn btn-outline btn-sm"
          onClick={() => { fetchStats(); fetchUsers(); }}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <FiRefreshCw size={14} /> Refresh
        </button>
      </div>

      {/* ── Stat Cards ── */}
      {loading ? (
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {[...Array(5)].map((_,i) => (
            <div key={i} className="skeleton" style={{ height: 110, borderRadius: 'var(--radius)' }} />
          ))}
        </div>
      ) : (
        <div className="stats-grid" style={{ marginBottom: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))' }}>
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className={`stat-icon ${s.color}`}>{s.icon}</div>
              <div className="stat-value">{s.value ?? 0}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Users Table ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>

        {/* Table Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10
        }}>
          <div className="card-title" style={{ margin: 0 }}>
            Users &nbsp;
            <span style={{ fontSize: '0.85rem', fontWeight: 400, color: 'var(--text-muted)' }}>
              ({filtered.length} shown)
            </span>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <FiSearch style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} size={14} />
              <input
                className="form-input"
                placeholder="Search name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 32, padding: '8px 12px 8px 32px', width: 210, fontSize: '0.85rem' }}
              />
            </div>

            {/* Role filter */}
            <div style={{ position: 'relative' }}>
              <select
                className="form-select"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
                style={{ padding: '8px 32px 8px 12px', fontSize: '0.85rem', appearance: 'none', width: 130 }}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="teacher">Teacher</option>
                <option value="student">Student</option>
              </select>
              <FiChevronDown size={13} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }} />
            </div>
          </div>
        </div>

        {/* Table Body */}
        {usersLoading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_,i) => (
              <div key={i} className="skeleton" style={{ height: 52, borderRadius: 'var(--radius-sm)' }} />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: '3rem' }}>
            <div className="empty-icon">👤</div>
            <div className="empty-title">No users found</div>
            <div className="empty-sub">Try a different search or filter</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => {
                  const roleStyle = ROLE_COLORS[u.role] || {};
                  const isActing  = !!actionIds[u._id];
                  const isSelf    = u._id === user?._id;

                  return (
                    <tr key={u._id}>
                      {/* Avatar + Name */}
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar">
                            {u.name?.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{u.name}</div>
                            {isSelf && (
                              <div style={{ fontSize: '0.7rem', color: 'var(--cyan)', marginTop: 1 }}>You</div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.825rem' }}>{u.email}</td>

                      {/* Role badge */}
                      <td>
                        <span style={{
                          display: 'inline-block', padding: '3px 10px',
                          borderRadius: 50, fontSize: '0.72rem', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.4px',
                          background: roleStyle.bg, color: roleStyle.color,
                          border: `1px solid ${roleStyle.border}`
                        }}>
                          {u.role}
                        </span>
                      </td>

                      {/* Active status */}
                      <td>
                        <span style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '3px 10px', borderRadius: 50, fontSize: '0.75rem', fontWeight: 600,
                          background: u.isActive ? 'var(--green-glow)' : '#ef444420',
                          color: u.isActive ? 'var(--green)' : '#ef4444',
                          border: `1px solid ${u.isActive ? 'var(--green)' : '#ef4444'}40`
                        }}>
                          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Joined date */}
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Action buttons */}
                      <td>
                        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                          {/* Promote to teacher (only for students) */}
                          {u.role === 'student' && !isSelf && (
                            <button
                              className="btn btn-sm"
                              onClick={() => handlePromote(u)}
                              disabled={isActing}
                              title="Promote to Teacher"
                              style={{
                                background: 'var(--purple-glow)', color: 'var(--purple-light)',
                                border: '1px solid var(--purple)40', padding: '5px 10px',
                                display: 'flex', alignItems: 'center', gap: 4,
                                opacity: isActing ? 0.5 : 1
                              }}
                            >
                              <FiTrendingUp size={12} />
                              {actionIds[u._id] === 'promote' ? '…' : 'Promote'}
                            </button>
                          )}

                          {/* Toggle active (not for self or admin) */}
                          {!isSelf && u.role !== 'admin' && (
                            <button
                              className="btn btn-sm"
                              onClick={() => handleToggleActive(u)}
                              disabled={isActing}
                              title={u.isActive ? 'Deactivate user' : 'Activate user'}
                              style={{
                                background: u.isActive ? '#ef444420' : 'var(--green-glow)',
                                color: u.isActive ? '#ef4444' : 'var(--green)',
                                border: `1px solid ${u.isActive ? '#ef4444' : 'var(--green)'}40`,
                                padding: '5px 10px',
                                display: 'flex', alignItems: 'center', gap: 4,
                                opacity: isActing ? 0.5 : 1
                              }}
                            >
                              {u.isActive ? <FiUserX size={12} /> : <FiUserCheck size={12} />}
                              {actionIds[u._id] === 'toggle' ? '…' : u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                          )}

                          {/* Self or admin — no actions */}
                          {(isSelf || u.role === 'admin') && (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '5px 0' }}>
                              {isSelf ? '(you)' : '(protected)'}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
