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
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => setActiveTab('users')}
            className="flex-1"
            style={{
              minWidth: '120px',
              background: activeTab === 'users' ? 'var(--ft-primary)' : 'var(--bg-secondary)',
              color: activeTab === 'users' ? 'white' : 'var(--text-primary)'
            }}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('banned')}
            className="flex-1"
            style={{
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
              <div className="text-center p-8">
                <p>Loading users...</p>
              </div>
            )}
            {usersError && (
              <div className="bg-error text-white p-4 rounded-md mb-8">
                Failed to load users. Please try again.
              </div>
            )}

            {/* Ban User Form */}
            <div className="bg-card p-6 rounded-md mb-8">
              <h3>Ban User</h3>
              <form onSubmit={handleBanUser} className="admin-form-grid">
                <div>
                  <label>User ID:</label>
                  <input
                    type="text"
                    value={banForm.userId}
                    onChange={(e) => setBanForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Enter user intra login"
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
                  className="grid-span-1"
                  style={{ background: 'var(--ft-accent)' }}
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
                          className={user.verified ? 'btn-verify' : 'btn-unverify'}
                        >
                          {user.verified ? '✅ Verified' : '❌ Unverified'}
                        </button>
                      </td>
                      <td data-label="Registered">{new Date(user.created_at).toLocaleDateString()}</td>
                      <td data-label="Actions">
                        <div className="admin-action-buttons">
                          <button
                            onClick={() => handleDelete(user.intra)}
                            className="delete-btn"
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
                            className="delete-btn"
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
              <div className="text-center p-8">
                <p>Loading banned users...</p>
              </div>
            )}
            {bannedError && (
              <div className="bg-error text-white p-4 rounded-md mb-8">
                Failed to load banned users. Please try again.
              </div>
            )}

            {/* Admin Info */}
            <div className="bg-card p-4 rounded-md mb-4 text-sm text-muted">
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
                      <tr key={user.intra} className={isExpired ? 'opacity-60' : ''}>
                        <td data-label="Name">{user.name}</td>
                        <td data-label="ID">{user.intra}</td>
                        <td data-label="Reason">{user.reason}</td>
                        <td data-label="Banned Date">{new Date(user.banned_at).toLocaleDateString()}</td>
                        <td data-label="Ban Expires">{new Date(user.banned_until).toLocaleDateString()}</td>
                        <td data-label="Status">
                          <span className={`font-bold ${isExpired ? 'text-success' : 'text-error'}`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </td>
                        <td data-label="Actions">
                          <button
                            onClick={() => handleUnban(user.intra)}
                            className="btn-success"
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