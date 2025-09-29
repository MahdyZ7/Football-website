import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './footer';
import {
  useAdminAuth,
  useUsers,
  useAdminBanned,
  useBanUser,
  useUnbanUser,
  useAdminDeleteUser,
  useVerifyUser
} from '../../hooks/useQueries';
import { Toast } from '../../types/user';

const Admin: React.FC = () => {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeTab, setActiveTab] = useState<'users' | 'banned'>('users');

  // React Query hooks
  const { data: authData, isLoading: authLoading, error: authError } = useAdminAuth();
  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const { data: bannedUsers = [], isLoading: bannedLoading, error: bannedError } = useAdminBanned();

  // Mutation hooks
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const deleteUserMutation = useAdminDeleteUser();
  const verifyUserMutation = useVerifyUser();

  const isAuthenticated = authData?.authenticated || false;

  // Form states
  const [banForm, setBanForm] = useState({
    userId: '',
    reason: '',
    duration: 7 // days
  });

  // Predefined ban reasons with durations
  const banReasons = [
    { label: 'Select a reason...', value: '', duration: 7 },
    { label: 'Not ready when booking time starts', value: 'Not ready when booking time starts', duration: 3.5 },
    { label: 'Cancel reservation', value: 'Cancel reservation', duration: 7 },
    { label: 'Late > 15 minutes', value: 'Late > 15 minutes', duration: 7 },
    { label: 'Cancel reservation on game day after 5 PM', value: 'Cancel reservation on game day after 5 PM', duration: 14 },
    { label: 'No Show without notice', value: 'No Show without notice', duration: 28 },
    { label: 'Custom reason', value: 'custom', duration: 7 }
  ];

  const [isCustomReason, setIsCustomReason] = useState(false);


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

    deleteUserMutation.mutate(id, {
      onSuccess: () => {
        showToast('User deleted successfully', 'success');
      },
      onError: () => {
        showToast('Failed to delete user', 'error');
      }
    });
  };

  const handleVerifyToggle = async (id: string, currentStatus: boolean) => {
    verifyUserMutation.mutate(
      { id, verified: !currentStatus },
      {
        onSuccess: () => {
          showToast(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`, 'success');
        },
        onError: () => {
          showToast('Failed to update verification status', 'error');
        }
      }
    );
  };

  const handleBanUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!banForm.userId || !banForm.reason || banForm.reason === '') {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    banUserMutation.mutate(
      {
        userId: banForm.userId,
        reason: banForm.reason,
        duration: banForm.duration.toString()
      },
      {
        onSuccess: () => {
          setBanForm({ userId: '', reason: '', duration: 7 });
          setIsCustomReason(false);
          showToast('User banned successfully', 'success');
        },
        onError: () => {
          showToast('Failed to ban user', 'error');
        }
      }
    );
  };

  const handleUnban = async (id: string) => {
    if (!confirm('Are you sure you want to unban this user?')) return;

    unbanUserMutation.mutate(id, {
      onSuccess: () => {
        showToast('User unbanned successfully', 'success');
      },
      onError: () => {
        showToast('Failed to unban user', 'error');
      }
    });
  };

  // Show loading state
  if (authLoading) {
    return (
      <>
        <Navbar />
        <div className="container admin-auth-container">
          <h1>Loading...</h1>
          <p>Checking authentication...</p>
        </div>
        <Footer />
      </>
    );
  }

  // Show error state
  if (authError || !isAuthenticated) {
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
            <h2>Registered Users ({usersLoading ? '...' : users.length})</h2>

            {/* Show loading/error states */}
            {usersLoading && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading users...</p>
              </div>
            )}
            {usersError && (
              <div style={{
                background: '#ff6b6b',
                color: 'white',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '2rem'
              }}>
                Failed to load users. Please try again.
              </div>
            )}

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
                  <select
                    value={isCustomReason ? 'custom' : banForm.reason}
                    onChange={(e) => {
                      const selectedReason = banReasons.find(r => r.value === e.target.value);
                      if (selectedReason) {
                        if (selectedReason.value === 'custom') {
                          setIsCustomReason(true);
                          setBanForm(prev => ({ ...prev, reason: '', duration: 7 }));
                        } else {
                          setIsCustomReason(false);
                          setBanForm(prev => ({ 
                            ...prev, 
                            reason: selectedReason.value,
                            duration: selectedReason.duration
                          }));
                        }
                      }
                    }}
                    style={{ 
                      width: '100%',
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: '1px solid var(--bg-secondary)',
                      background: 'var(--bg-primary)',
                      color: 'var(--text-primary)'
                    }}
                  >
                    {banReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </select>
                </div>
                {isCustomReason && (
                  <div>
                    <label>Custom Reason:</label>
                    <input
                      type="text"
                      value={banForm.reason}
                      onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                      placeholder="Enter custom ban reason"
                      style={{ width: '100%' }}
                    />
                  </div>
                )}
                <div>
                  <label>Duration (days):</label>
                  <input
                    type="number"
                    value={banForm.duration}
                    onChange={(e) => setBanForm(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                    min="0.5"
                    max="365"
                    step="0.5"
                    style={{ width: '100%' }}
                    disabled={!isCustomReason && banForm.reason !== ''}
                  />
                  {banForm.duration > 0 && (
                    <div className="ban-end-date">
                      Ban ends: {(() => {
                        const endDate = new Date();
                        endDate.setDate(endDate.getDate() + banForm.duration);
                        return endDate.toLocaleDateString('en-US', { 
                          weekday: 'short', 
                          day: 'numeric', 
                          month: 'short' 
                        });
                      })()}
                    </div>
                  )}
                </div>
                <button
                  type="submit"
                  style={{
                    background: 'var(--ft-accent)',
                    gridColumn: 'span 1'
                  }}
                  disabled={banUserMutation.isPending}
                >
                  {banUserMutation.isPending ? 'Banning...' : 'Ban User'}
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
                    <tr key={user.intra}>
                      <td data-label="Name">{user.name}</td>
                      <td data-label="ID">{user.intra}</td>
                      <td data-label="Verified">
                        <button
                          onClick={() => handleVerifyToggle(user.intra, user.verified)}
                          disabled={verifyUserMutation.isPending}
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
                            onClick={() => handleDelete(user.intra)}
                            className="delete-btn"
                            style={{
                              fontSize: '0.8rem',
                              padding: '0.4rem 0.8rem'
                            }}
                            disabled={deleteUserMutation.isPending}
                          >
                            {deleteUserMutation.isPending ? 'Deleting...' : 'Delete'}
                          </button>
                          <button
                            onClick={() => setBanForm(prev => ({
                              ...prev,
                              userId: user.intra,
                              reason: 'Quick ban - 2 days',
                              duration: 2
                            }))}
                            style={{ 
                              background: 'var(--ft-accent)', 
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.8rem'
                            }}
                          >
                            Quick Ban (2d)
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
            <h2>Banned Users ({bannedLoading ? '...' : bannedUsers.length})</h2>

            {/* Show loading/error states */}
            {bannedLoading && (
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <p>Loading banned users...</p>
              </div>
            )}
            {bannedError && (
              <div style={{
                background: '#ff6b6b',
                color: 'white',
                padding: '1rem',
                borderRadius: '6px',
                marginBottom: '2rem'
              }}>
                Failed to load banned users. Please try again.
              </div>
            )}

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
                      <tr key={user.intra} style={{ opacity: isExpired ? 0.6 : 1 }}>
                        <td data-label="Name">{user.name}</td>
                        <td data-label="ID">{user.intra}</td>
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
                            onClick={() => handleUnban(user.intra)}
                            style={{
                              background: '#4CAF50',
                              padding: '0.4rem 0.8rem',
                              fontSize: '0.8rem'
                            }}
                            disabled={unbanUserMutation.isPending}
                          >
                            {unbanUserMutation.isPending ? 'Unbanning...' : 'Unban'}
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