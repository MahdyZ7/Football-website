
import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      fetchUsers();
      fetchBannedUsers();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      // First check if user is logged in with Replit
      const userResponse = await fetch('/__replauthuser');
      if (userResponse.status !== 200) {
        setIsAuthenticated(false);
        return;
      }
      
      // Then check admin privileges
      const response = await axios.get('/api/admin/auth');
      setIsAuthenticated(response.data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/api/users');
      setUsers(response.data);
    } catch (error) {
      showToast('Failed to fetch users', 'error');
    }
  };

  const fetchBannedUsers = async () => {
    try {
      const response = await axios.get('/api/admin/banned');
      setBannedUsers(response.data);
    } catch (error) {
      showToast('Failed to fetch banned users', 'error');
    }
  };

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
    } catch (error) {
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
    } catch (error) {
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
    } catch (error) {
      showToast('Failed to ban user', 'error');
    }
  };

  const handleUnban = async (id: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;
    
    try {
      await axios.delete('/api/admin/ban', { data: { id } });
      await fetchBannedUsers();
      showToast('User unbanned successfully', 'success');
    } catch (error) {
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
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ 
              marginRight: '1rem',
              background: activeTab === 'users' ? 'var(--ft-primary)' : 'var(--bg-secondary)',
              color: activeTab === 'users' ? 'white' : 'var(--text-primary)'
            }}
          >
            User Management
          </button>
          <button 
            onClick={() => setActiveTab('banned')}
            style={{ 
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
              <form onSubmit={handleBanUser} style={{ display: 'flex', gap: '1rem', alignItems: 'end' }}>
                <div>
                  <label>User ID:</label>
                  <input
                    type="text"
                    value={banForm.userId}
                    onChange={(e) => setBanForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Enter user intra login"
                    style={{ width: '200px' }}
                  />
                </div>
                <div>
                  <label>Reason:</label>
                  <input
                    type="text"
                    value={banForm.reason}
                    onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Ban reason"
                    style={{ width: '250px' }}
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
                    style={{ width: '100px' }}
                  />
                </div>
                <button type="submit" style={{ background: 'var(--ft-accent)' }}>
                  Ban User
                </button>
              </form>
            </div>

            <div style={{ overflowX: 'auto' }}>
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
                      <td>{user.name}</td>
                      <td>{user.id}</td>
                      <td>
                        <button
                          onClick={() => handleVerifyToggle(user.id, user.verified)}
                          style={{
                            background: user.verified ? '#4CAF50' : '#ff6b6b',
                            color: 'white',
                            border: 'none',
                            padding: '0.3rem 0.8rem',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          {user.verified ? '✅ Verified' : '❌ Unverified'}
                        </button>
                      </td>
                      <td>{new Date(user.created_at).toLocaleDateString()}</td>
                      <td>
                        <button 
                          onClick={() => handleDelete(user.id)}
                          className="delete-btn"
                          style={{ marginRight: '0.5rem' }}
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setBanForm(prev => ({ ...prev, userId: user.id }))}
                          style={{ 
                            background: 'var(--ft-accent)', 
                            padding: '0.5rem 1rem',
                            fontSize: '0.9rem'
                          }}
                        >
                          Quick Ban
                        </button>
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
              <strong>Admin Access:</strong> Currently only 'MahdyZ7' has admin privileges. 
              To add more admins, update the ADMIN_USERS array in /pages/api/admin/auth.ts
            </div>
            <div style={{ overflowX: 'auto' }}>
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
                        <td>{user.name}</td>
                        <td>{user.id}</td>
                        <td>{user.reason}</td>
                        <td>{new Date(user.banned_at).toLocaleDateString()}</td>
                        <td>{new Date(user.banned_until).toLocaleDateString()}</td>
                        <td>
                          <span style={{ 
                            color: isExpired ? '#4CAF50' : '#ff6b6b',
                            fontWeight: 'bold'
                          }}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleUnban(user.id)}
                            style={{ 
                              background: '#4CAF50', 
                              padding: '0.5rem 1rem',
                              fontSize: '0.9rem'
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
