import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { getAllUsers, getDashboardStats, toggleUserActive, promoteToTeacher } from '../utils/api';
import { FiUsers, FiBook, FiFileText, FiStar, FiToggleLeft, FiToggleRight, FiShield } from 'react-icons/fi';

export default function AdminPage() {
  const [stats, setStats]         = useState(null);
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    Promise.all([getDashboardStats(), getAllUsers()])
      .then(([s, u]) => { setStats(s.data); setUsers(u.data.users); })
      .finally(() => setLoading(false));
  }, []);

  const fetchUsers = async (role = '') => {
    setRoleFilter(role);
    const { data } = await getAllUsers(role ? { role } : {});
    setUsers(data.users);
  };

  const handleToggle = async (id) => {
    try {
      const { data } = await toggleUserActive(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, isActive: data.isActive } : u));
      toast.success(data.message);
    } catch { toast.error('Failed.'); }
  };

  const handlePromote = async (id, name) => {
    if (!window.confirm(`Promote ${name} to teacher?`)) return;
    try {
      await promoteToTeacher(id);
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role: 'teacher' } : u));
      toast.success(`${name} is now a teacher! 🎉`);
    } catch { toast.error('Failed.'); }
  };

  const roleBadge = {
    student: { bg: 'var(--cyan-glow)', color: 'var(--cyan)', border: 'var(--cyan)' },
    teacher: { bg: 'var(--purple-glow)', color: 'var(--purple-light)', border: 'var(--purple)' },
    admin:   { bg: '#ef444420', color: 'var(--red)', border: 'var(--red)' },
  };

  return (
    <div className="page">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--radius-sm)', background: '#ef444420', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--red)' }}>
            <FiShield size={20} />
          </div>
          <h1 style={{ fontFamily: 'Syne, sans-serif', fontSize: '1.8rem', fontWeight: 800 }}>Admin Panel</h1>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Manage users, monitor platform activity, and control access.</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="stats-grid">
          {[
            { label: 'Total Users',  value: stats.totalUsers,     icon: <FiUsers />,    cls: 'purple' },
            { label: 'Courses',      value: stats.totalCourses,   icon: <FiBook />,     cls: 'cyan'   },
            { label: 'Materials',    value: stats.totalMaterials, icon: <FiFileText />, cls: 'green'  },
            { label: 'Teachers',     value: stats.teacherCount,   icon: <FiStar />,     cls: 'orange' },
          ].map(s => (
            <div className="stat-card" key={s.label}>
              <div className={`stat-icon ${s.cls}`}>{s.icon}</div>
              <div className="stat-value">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Users Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div className="card-title">All Users</div>
          <div style={{ display: 'flex', gap: 6 }}>
            {['', 'student', 'teacher', 'admin'].map(r => (
              <button key={r} onClick={() => fetchUsers(r)}
                className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : 'btn-outline'}`}
                style={{ textTransform: 'capitalize' }}>
                {r || 'All'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(5)].map((_,i) => <div key={i} className="skeleton" style={{ height: 48, borderRadius: 'var(--radius-sm)' }} />)}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  {['User','Email','Role','Status','Joined','Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map(u => {
                  const rb = roleBadge[u.role] || roleBadge.student;
                  return (
                    <tr key={u._id}>
                      <td>
                        <div className="user-cell">
                          <div className="user-cell-avatar">{u.name.charAt(0).toUpperCase()}</div>
                          <span style={{ fontWeight: 600 }}>{u.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 50, background: rb.bg, color: rb.color, border: `1px solid ${rb.border}40`, textTransform: 'capitalize' }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '3px 10px', borderRadius: 50, background: u.isActive ? 'var(--green-glow)' : '#ef444420', color: u.isActive ? 'var(--green)' : 'var(--red)', border: `1px solid ${u.isActive ? 'var(--green)' : 'var(--red)'}40` }}>
                          {u.isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        {u.role !== 'admin' && (
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-icon" title={u.isActive ? 'Deactivate' : 'Activate'}
                              onClick={() => handleToggle(u._id)}
                              style={{ color: u.isActive ? 'var(--green)' : 'var(--text-muted)' }}>
                              {u.isActive ? <FiToggleRight size={16}/> : <FiToggleLeft size={16}/>}
                            </button>
                            {u.role === 'student' && (
                              <button className="btn-icon" title="Promote to teacher"
                                onClick={() => handlePromote(u._id, u.name)}
                                style={{ color: 'var(--purple-light)' }}>
                                <FiStar size={14}/>
                              </button>
                            )}
                          </div>
                        )}
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