import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './footer';
import LoadingSpinner from '../LoadingSpinner';
import ConfirmDialog from '../ConfirmDialog';
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
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type?: 'danger' | 'warning' | 'info';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

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

  const handleDelete = async (intra: string) => {
    const user = users.find(u => u.intra === intra);
    setConfirmDialog({
      isOpen: true,
      title: 'Delete User',
      message: `Are you sure you want to delete "${user?.name || 'this user'}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        deleteUserMutation.mutate(intra, {
          onSuccess: () => {
            showToast('User deleted successfully', 'success');
          },
          onError: () => {
            showToast('Failed to delete user', 'error');
          }
        });
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

  const handleUnban = async (userId: number, userName: string) => {
    setConfirmDialog({
      isOpen: true,
      title: 'Unban User',
      message: `Are you sure you want to unban "${userName}"? They will be able to register again.`,
      type: 'warning',
      onConfirm: () => {
        unbanUserMutation.mutate(userId, {
          onSuccess: () => {
            showToast('User unbanned successfully', 'success');
          },
          onError: () => {
            showToast('Failed to unban user', 'error');
          }
        });
      }
    });
  };

  // Show loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="rounded-lg shadow-md p-8" style={{ backgroundColor: 'var(--bg-card)' }}>
              <LoadingSpinner message="Checking authentication..." />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (authError || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
        <Navbar />
        <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg shadow-md p-8 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <h1 className="text-3xl font-bold mb-4" style={{ color: 'var(--text-primary)' }}>
                Admin Access Required
              </h1>
              <p className="mb-4" style={{ color: 'var(--text-primary)' }}>
                Please log in with your Replit account to access the admin panel.
              </p>
              <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
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
                className="px-8 py-3 bg-ft-primary hover:bg-ft-secondary text-white font-medium rounded
                           transition-all duration-200 transform hover:scale-105"
              >
                Login with Replit
              </button>
              <div className="mt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700
                             text-white font-medium rounded transition-all duration-200"
                >
                  ← Back to Home
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-8" style={{ color: 'var(--text-primary)' }}>
            Admin Dashboard
          </h1>

          {/* Back Link */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-ft-primary hover:bg-ft-secondary
                         text-white font-medium rounded transition-all duration-200 transform hover:scale-105"
            >
              ← Back to Registration
            </Link>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveTab('users')}
              className="flex-1 min-w-[120px] px-6 py-3 font-medium rounded transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'users' ? 'var(--ft-primary)' : 'var(--bg-secondary)',
                color: activeTab === 'users' ? 'white' : 'var(--text-primary)'
              }}
            >
              User Management
            </button>
            <button
              onClick={() => setActiveTab('banned')}
              className="flex-1 min-w-[120px] px-6 py-3 font-medium rounded transition-all duration-200"
              style={{
                backgroundColor: activeTab === 'banned' ? 'var(--ft-primary)' : 'var(--bg-secondary)',
                color: activeTab === 'banned' ? 'white' : 'var(--text-primary)'
              }}
            >
              Banned Users
            </button>
          </div>

          {/* User Management Tab */}
          {activeTab === 'users' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                Registered Users ({usersLoading ? '...' : users.length})
              </h2>

              {/* Show loading/error states */}
              {usersLoading && (
                <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <LoadingSpinner message="Loading users..." />
                </div>
              )}
              {usersError && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-8 text-center">
                  <p className="font-medium">Failed to load users. Please try again.</p>
                </div>
              )}

              {/* Ban User Form */}
              <div className="rounded-lg shadow-md p-6 mb-8" style={{ backgroundColor: 'var(--bg-card)' }}>
                <h3 className="text-xl font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>
                  Ban User
                </h3>
                <form onSubmit={handleBanUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      User ID:
                    </label>
                    <input
                      type="text"
                      value={banForm.userId}
                      onChange={(e) => setBanForm(prev => ({ ...prev, userId: e.target.value }))}
                      placeholder="Enter user intra login"
                      className="w-full px-4 py-2 rounded border transition-all duration-200 focus:ring-2 focus:ring-ft-primary focus:outline-none"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Reason:
                    </label>
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
                      className="w-full px-4 py-2 rounded border transition-all duration-200 focus:ring-2 focus:ring-ft-primary focus:outline-none"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-color)',
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
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                        Custom Reason:
                      </label>
                      <input
                        type="text"
                        value={banForm.reason}
                        onChange={(e) => setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="Enter custom ban reason"
                        className="w-full px-4 py-2 rounded border transition-all duration-200 focus:ring-2 focus:ring-ft-primary focus:outline-none"
                        style={{
                          backgroundColor: 'var(--input-bg)',
                          borderColor: 'var(--border-color)',
                          color: 'var(--text-primary)'
                        }}
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-primary)' }}>
                      Duration (days):
                    </label>
                    <input
                      type="number"
                      value={banForm.duration}
                      onChange={(e) => setBanForm(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                      min="0.5"
                      max="365"
                      step="0.5"
                      disabled={!isCustomReason && banForm.reason !== ''}
                      className="w-full px-4 py-2 rounded border transition-all duration-200 focus:ring-2 focus:ring-ft-primary focus:outline-none disabled:opacity-50"
                      style={{
                        backgroundColor: 'var(--input-bg)',
                        borderColor: 'var(--border-color)',
                        color: 'var(--text-primary)'
                      }}
                    />
                    {banForm.duration > 0 && (
                      <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
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
                    className="md:col-span-2 w-full px-6 py-3 bg-ft-accent hover:bg-orange-600 text-white font-medium rounded
                               transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={banUserMutation.isPending}
                  >
                    {banUserMutation.isPending ? 'Banning...' : 'Ban User'}
                  </button>
                </form>
              </div>

              <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Name
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Intra
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Verified
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Registered
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user, index) => (
                        <tr key={user.intra + index} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                          <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                            {user.name}
                          </td>
                          <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                            {user.intra}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => handleVerifyToggle(user.intra, user.verified)}
                              disabled={verifyUserMutation.isPending}
                              className={`px-3 py-1 rounded text-sm font-medium transition-all duration-200 disabled:opacity-50
                                ${user.verified ? 'bg-green-600 hover:bg-green-700 text-white' : 'bg-gray-500 hover:bg-gray-600 text-white'}`}
                            >
                              {user.verified ? '✅ Verified' : '❌ Unverified'}
                            </button>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <button
                                onClick={() => handleDelete(user.intra)}
                                className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded
                                           transition-all duration-200 disabled:opacity-50"
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
                                className="px-3 py-1 bg-ft-accent hover:bg-orange-600 text-white text-sm font-medium rounded
                                           transition-all duration-200"
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
            </div>
          )}

          {/* Banned Users Tab */}
          {activeTab === 'banned' && (
            <div>
              <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
                Banned Users ({bannedLoading ? '...' : bannedUsers.length})
              </h2>

              {/* Show loading/error states */}
              {bannedLoading && (
                <div className="rounded-lg shadow-md p-8 mb-8" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <LoadingSpinner message="Loading banned users..." />
                </div>
              )}
              {bannedError && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-8 text-center">
                  <p className="font-medium">Failed to load banned users. Please try again.</p>
                </div>
              )}

              {/* Admin Info */}
              <div className="rounded-lg p-4 mb-6 text-sm" style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-secondary)'
              }}>
                <strong>Admin Access:</strong> Currently only &apos;MahdyZ7&apos; has admin privileges.
                To add more admins, update the ADMIN_USERS array in /app/api/admin/auth/route.ts
              </div>

              <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                      <tr>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Name
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Intra
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Reason
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Banned Date
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Ban Expires
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Status
                        </th>
                        <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {bannedUsers.map((user, index) => {
                        const isExpired = new Date(user.banned_until) < new Date();
                        return (
                          <tr key={`${user.intra}-${index}`} className={`border-b ${isExpired ? 'opacity-60' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
                            <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                              {user.name}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                              {user.intra}
                            </td>
                            <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>
                              {user.reason}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(user.banned_at).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {new Date(user.banned_until).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`font-bold ${isExpired ? 'text-green-600' : 'text-red-600'}`}>
                                {isExpired ? 'Expired' : 'Active'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <button
                                onClick={() => user.user_id && handleUnban(user.user_id, user.name)}
                                className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded
                                           transition-all duration-200 disabled:opacity-50"
                                disabled={unbanUserMutation.isPending || !user.user_id}
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
            </div>
          )}
        </div>
      </main>

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

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={() => setConfirmDialog(prev => ({ ...prev, isOpen: false }))}
        type={confirmDialog.type}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Admin;