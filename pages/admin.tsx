import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './footer';

type User = {
  name: string;
  id: string;
  verified: boolean;
  created_at: string;
};

type BannedUser = {
  id: string;
  name: string;
  banned_until: string;
  reason: string;
  banned_at: string;
};

type Toast = {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
};

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [bannedUsers, setBannedUsers] = useState<BannedUser[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'banned'>('users');

  // Form states
  const [banForm, setBanForm] = useState({
    userId: '',
    reason: '',
    duration: 7 // days
  });

  const checkAuth = async () => {
    try {
      const protocol = window.location.protocol;
      const host = window.location.host;
      const authUrl = `${protocol}//${host}/__replauthuser`;

      // Fetch the authenticated user
      const userResponse = await fetch(authUrl);
      if (userResponse.status !== 200) {
        setIsAuthenticated(false);
        console.log("User not authenticated - A")
        return;
      }

      const response = await axios.get('/api/admin/auth');
      setIsAuthenticated(response.data.authenticated);
      console.log("User authenticated - B")
    } catch {
      setIsAuthenticated(false);
      console.log("User not authenticated - C")
    }
  };

  const fetchUsers = useCallback(async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch {
      showToast('Failed to fetch users', 'error');
    }
  }, []);

  const fetchBannedUsers = useCallback(async () => {
    try {
      const response = await axios.get('/api/admin/banned');
      setBannedUsers(response.data);
    } catch {
      showToast('Failed to fetch banned users', 'error');
    }
  }, []);

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      fetchUsers();
      fetchBannedUsers();
    }
  }, [isAuthenticated, fetchUsers, fetchBannedUsers]);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const newToast: Toast = {
      id: Date.now(),
      message,
      type
    };
    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== newToast.id));
    }, 4000);
  };

  const removeToast = (id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;

    try {
      await axios.delete('/api/admin/users', { data: { id } });
      await fetchUsers();
      showToast('User deleted successfully', 'success');
    } catch {
      showToast('Failed to delete user', 'error');
    }
  };

  const handleVerifyToggle = async (id: string, currentStatus: boolean) => {
    try {
      await axios.patch('/api/admin/users/verify', { 
        id, 
        verified: !currentStatus 
      });
      await fetchUsers();
      showToast(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`, 'success');
    } catch {
      showToast('Failed to update verification status', 'error');
    }
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!banForm.userId || !banForm.reason) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    try {
      await axios.post('/api/admin/ban', {
        userId: banForm.userId,
        reason: banForm.reason,
        duration: banForm.duration
      });

      setBanForm({ userId: '', reason: '', duration: 7 });
      await fetchBannedUsers();
      showToast('User banned successfully', 'success');
    } catch {
      showToast('Failed to ban user', 'error');
    }
  };

  const handleUnban = async (id: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;

    try {
      await axios.delete('/api/admin/ban', { data: { id } });
      await fetchBannedUsers();
      showToast('User unbanned successfully', 'success');
    } catch {
      showToast('Failed to unban user', 'error');
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="container admin-auth-container">
          <h1>Admin Access Required</h1>
          <p>Please log in with your Replit account to access the admin panel.</p>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
            Only authorized users (MahdyZ7) can access admin features.
          </p>
          <button 
            onClick={() => {
              window.addEventListener("message", (e) => {
                if (e.data === "auth_complete") {
                  window.location.reload();
                }
              });
              const h = 500, w = 350;
              const left = screen.width / 2 - w / 2;
              const top = screen.height / 2 - h / 2;
              window.open(
                "https://replit.com/auth_with_repl_site?domain=" + location.host,
                "_blank",
                `modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=${w}, height=${h}, top=${top}, left=${left}`
              );
            }}
            style={{
              background: 'var(--ft-primary)',
              color: 'white',
              padding: '1rem 2rem',
              border: 'none',
              borderRadius: '6px',
              fontSize: '1rem',
              cursor: 'pointer',
              marginTop: '1rem'
            }}
          >
            Login with Replit
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Admin Dashboard</h1>

        {/* Tab Navigation */}
        <div style={{ 
          marginBottom: '2rem',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ 
              flex: '1',
              minWidth: '120px',
              background: activeTab === 'users' ? 'var(--ft-primary)' : 'var(--bg-secondary)',
              color: activeTab === 'users' ? 'white' : 'var(--text-primary)'
            }}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('banned')}
            style={{ 
              flex: '1',
              minWidth: '120px',
              background: activeTab === 'banned' ? 'var(--ft-primary)' : 'var(--bg-secondary)',
              color: activeTab === 'banned' ? 'white' : 'var(--text-primary)'
            }}
          >
            Banned Users
          </button>
        </div>

        {/* User Management Tab */}
        {activeTab === 'users' && (
          <div className="admin-panel">
            <h2>Registered Users ({users.length})</h2>

            {/* Ban User Form */}
            <div style={{ 
              background: 'var(--bg-card)', 
              padding: '1.5rem', 
              borderRadius: '8px', 
              marginBottom: '2rem' 
            }}>
              <h3>Ban User</h3>
              <form onSubmit={handleBanUser} style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                alignItems: 'end'
              }}>
                <div>
                  <label>User ID:</label>
                  <input
                    type="text"
                    value={banForm.userId}
                    onChange={(e) => setBanForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Enter user intra login"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label>Reason:</label>
                  <input
                    type="text"
                    value={banForm.reason}
                    onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Ban reason"
                    style={{ width: '100%' }}
                  />
                </div>
                <div>
                  <label>Duration (days):</label>
                  <input
                    type="number"
                    value={banForm.duration}
                    onChange={(e) => setBanForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                    min="1"
                    max="365"
                    style={{ width: '100%' }}
                  />
                </div>
                <button type="submit" style={{ 
                  background: 'var(--ft-accent)',
                  gridColumn: 'span 1'
                }}>
                  Ban User
                </button>
              </form>
            </div>

            <div className="responsive-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Verified</th>
                    <th>Registered</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td data-label="Name">{user.name}</td>
                      <td data-label="ID">{user.id}</td>
                      <td data-label="Verified">
                        <button
                          onClick={() => handleVerifyToggle(user.id, user.verified)}
                          style={{
                            background: user.verified ? '#4CAF50' : '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          {user.verified ? '✅ Verified' : '❌ Unverified'}
                        </button>
                      </td>
                      <td data-label="Registered">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td data-label="Actions">
                        <div style={{ 
                          display: 'flex', 
                          flexDirection: 'column',
                          gap: '0.3rem'
                        }}>
                          <button 
                            onClick={() => handleDelete(user.id)}
                            className="delete-btn"
                            style={{ 
                              fontSize: '0.8rem',
                              padding: '0.4rem 0.8rem'
                            }}
                          >
                            Delete
                          </button>
                          <button
                            onClick={() => setBanForm(prev => ({ ...prev, userId: user.id }))}
                            style={{ 
                              background: 'var(--ft-accent)', 
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.8rem'
                            }}
                          >
                            Quick Ban
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Banned Users Tab */}
        {activeTab === 'banned' && (
          <div className="admin-panel">
            <h2>Banned Users ({bannedUsers.length})</h2>

            {/* Admin Info */}
            <div style={{ 
              background: 'var(--bg-card)', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginBottom: '1rem',
              fontSize: '0.9rem',
              color: 'var(--text-secondary)'
            }}>
              <strong>Admin Access:</strong> Currently only &apos;MahdyZ7&apos; has admin privileges. 
              To add more admins, update the ADMIN_USERS array in /pages/api/admin/auth.ts
            </div>
            <div className="responsive-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Reason</th>
                    <th>Banned Date</th>
                    <th>Ban Expires</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bannedUsers.map((user) => {
                    const isExpired = new Date(user.banned_until) < new Date();
                    return (
                      <tr key={user.id} style={{ opacity: isExpired ? 0.6 : 1 }}>
                        <td data-label="Name">{user.name}</td>
                        <td data-label="ID">{user.id}</td>
                        <td data-label="Reason">{user.reason}</td>
                        <td data-label="Banned Date">{new Date(user.banned_at).toLocaleDateString()}</td>
                        <td data-label="Ban Expires">{new Date(user.banned_until).toLocaleDateString()}</td>
                        <td data-label="Status">
                          <span style={{ 
                            color: isExpired ? '#4CAF50' : '#ff6b6b',
                            fontWeight: 'bold'
                          }}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <button 
                            onClick={() => handleUnban(user.id)}
                            style={{ 
                              background: '#4CAF50', 
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.8rem'
                            }}
                          >
                            Unban
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      <Footer />

      {/* Toast Container */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => removeToast(toast.id)}
          >
            <span>{toast.message}</span>
            <button className="toast-close" onClick={() => removeToast(toast.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </>
  );
};

export default Admin;