import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './footer';
import { Skeleton, TableRowSkeleton } from '../Skeleton';
import ConfirmDialog from '../ConfirmDialog';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

import {
  useAdminAuth,
  useUsers,
  useAdminBanned,
  useUnbanUser,
  useAdminDeleteUser,
  useVerifyUser
} from '../../hooks/useQueries';
import { useAdminBanForm } from '../../hooks/useAdminBanForm';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import { toast } from 'sonner';

/**
 * Admin Component
 * Single Responsibility: Orchestrate admin dashboard UI
 *
 * Business logic extracted to custom hooks:
 * - useAdminBanForm: Ban form state and submission
 * - useConfirmDialog: Confirmation dialog management
 */
const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'banned'>('users');

  // Custom hooks for business logic
  const { confirmDialog, showConfirm, closeConfirm } = useConfirmDialog();
  const banFormHook = useAdminBanForm();

  // React Query hooks
  const { data: authData, isLoading: authLoading, error: authError } = useAdminAuth();
  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const { data: bannedUsers = [], isLoading: bannedLoading, error: bannedError } = useAdminBanned();

  // Mutation hooks
  const unbanUserMutation = useUnbanUser();
  const deleteUserMutation = useAdminDeleteUser();
  const verifyUserMutation = useVerifyUser();

  const isAuthenticated = authData?.authenticated || false;

  const handleDelete = async (intra: string) => {
    const user = users.find(u => u.intra === intra);
    showConfirm({
      title: 'Delete User',
      message: `Are you sure you want to delete "${user?.name || 'this user'}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        deleteUserMutation.mutate(intra, {
          onSuccess: () => {
            toast.success('User deleted successfully');
          },
          onError: () => {
            toast.error('Failed to delete user');
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
          toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`);
        },
        onError: () => {
          toast.error('Failed to update verification status');
        }
      }
    );
  };

  const handleUnban = async (userId: string, userName: string) => {
    showConfirm({
      title: 'Unban User',
      message: `Are you sure you want to unban "${userName}"? They will be able to register again.`,
      type: 'warning',
      onConfirm: () => {
        unbanUserMutation.mutate(userId, {
          onSuccess: () => {
            toast.success('User unbanned successfully');
          },
          onError: () => {
            toast.error('Failed to unban user');
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
              <div className="space-y-4">
                <Skeleton width="60%" height={32} />
                <Skeleton width="100%" height={48} />
                <Skeleton width="80%" height={24} />
              </div>
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
              <Button
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
                variant="primary"
                size="lg"
              >
                Login with Replit
              </Button>
              <div className="mt-6">
                <Link href="/">
                  <Button variant="secondary">← Back to Home</Button>
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
            <Link href="/">
              <Button variant="primary">← Back to Registration</Button>
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
                <div className="rounded-lg shadow-md overflow-hidden mb-8" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <tr>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                        </tr>
                      </thead>
                      <tbody>
                        <TableRowSkeleton columns={5} rows={8} />
                      </tbody>
                    </table>
                  </div>
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
                <form onSubmit={banFormHook.handleBanUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="User ID"
                    type="text"
                    value={banFormHook.banForm.userId}
                    onChange={(e) => banFormHook.setBanForm(prev => ({ ...prev, userId: e.target.value }))}
                    placeholder="Enter user intra login"
                    fullWidth
                  />
                  <Select
                    label="Reason"
                    value={banFormHook.isCustomReason ? 'custom' : banFormHook.banForm.reason}
                    onChange={(e) => banFormHook.handleReasonChange(e.target.value)}
                    fullWidth
                  >
                    {banFormHook.banReasons.map((reason) => (
                      <option key={reason.value} value={reason.value}>
                        {reason.label}
                      </option>
                    ))}
                  </Select>
                  {banFormHook.isCustomReason && (
                    <div className="md:col-span-2">
                      <Input
                        label="Custom Reason"
                        type="text"
                        value={banFormHook.banForm.reason}
                        onChange={(e) => banFormHook.setBanForm(prev => ({ ...prev, reason: e.target.value }))}
                        placeholder="Enter custom ban reason"
                        fullWidth
                      />
                    </div>
                  )}
                  <div>
                    <Input
                      label="Duration (days)"
                      type="number"
                      value={banFormHook.banForm.duration.toString()}
                      onChange={(e) => banFormHook.setBanForm(prev => ({ ...prev, duration: parseFloat(e.target.value) }))}
                      min="0.5"
                      max="365"
                      step="0.5"
                      disabled={!banFormHook.isCustomReason && banFormHook.banForm.reason !== ''}
                      fullWidth
                    />
                    {banFormHook.banForm.duration > 0 && (
                      <div className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                        Ban ends: {banFormHook.getBanEndDate()}
                      </div>
                    )}
                  </div>
                  <div className="md:col-span-2">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      fullWidth
                      loading={banFormHook.isPending}
                    >
                      Ban User
                    </Button>
                  </div>
                </form>
              </div>

              <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
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
                            <Button
                              onClick={() => handleVerifyToggle(user.intra, user.verified)}
                              disabled={verifyUserMutation.isPending}
                              variant={user.verified ? 'success' : 'secondary'}
                              size="sm"
                            >
                              {user.verified ? '✅ Verified' : '❌ Unverified'}
                            </Button>
                          </td>
                          <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-2">
                              <Button
                                onClick={() => handleDelete(user.intra)}
                                variant="danger"
                                size="sm"
                                loading={deleteUserMutation.isPending}
                              >
                                Delete
                              </Button>
                              <Button
                                onClick={() => banFormHook.quickBan(user.intra)}
                                variant="primary"
                                size="sm"
                                className="bg-ft-accent hover:bg-orange-600"
                              >
                                Quick Ban (2d)
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                  {users.map((user, index) => (
                    <div
                      key={user.intra + index}
                      className="rounded-lg p-4 border"
                      style={{
                        backgroundColor: 'var(--bg-secondary)',
                        borderColor: 'var(--border-color)',
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                          {user.name}
                        </span>
                        <Button
                          onClick={() => handleVerifyToggle(user.intra, user.verified)}
                          disabled={verifyUserMutation.isPending}
                          variant={user.verified ? 'success' : 'secondary'}
                          size="sm"
                        >
                          {user.verified ? '✅' : '❌'}
                        </Button>
                      </div>
                      <div className="flex items-center justify-between mb-3 text-sm">
                        <span style={{ color: 'var(--text-secondary)' }}>{user.intra}</span>
                        <span style={{ color: 'var(--text-secondary)' }}>
                          {new Date(user.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleDelete(user.intra)}
                          variant="danger"
                          size="sm"
                          loading={deleteUserMutation.isPending}
                          fullWidth
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={() => banFormHook.quickBan(user.intra)}
                          variant="primary"
                          size="sm"
                          className="bg-ft-accent hover:bg-orange-600"
                          fullWidth
                        >
                          Quick Ban
                        </Button>
                      </div>
                    </div>
                  ))}
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
                <div className="rounded-lg shadow-md overflow-hidden mb-8" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                        <tr>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                          <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                        </tr>
                      </thead>
                      <tbody>
                        <TableRowSkeleton columns={7} rows={5} />
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              {bannedError && (
                <div className="bg-red-500 text-white p-4 rounded-lg mb-8 text-center">
                  <p className="font-medium">Failed to load banned users. Please try again.</p>
                </div>
              )}

              <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
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
                              <Button
                                onClick={() => user.user_id && handleUnban(user.user_id, user.name)}
                                variant="success"
                                size="sm"
                                loading={unbanUserMutation.isPending}
                                disabled={!user.user_id}
                              >
                                Unban
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden p-4 space-y-3">
                  {bannedUsers.map((user, index) => {
                    const isExpired = new Date(user.banned_until) < new Date();
                    return (
                      <div
                        key={`${user.intra}-${index}`}
                        className={`rounded-lg p-4 border ${isExpired ? 'opacity-60' : ''}`}
                        style={{
                          backgroundColor: 'var(--bg-secondary)',
                          borderColor: 'var(--border-color)',
                        }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                            {user.name}
                          </span>
                          <span className={`font-bold text-sm ${isExpired ? 'text-green-600' : 'text-red-600'}`}>
                            {isExpired ? 'Expired' : 'Active'}
                          </span>
                        </div>
                        <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>
                          {user.intra}
                        </div>
                        <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                          {user.reason}
                        </p>
                        <div className="flex items-center justify-between text-xs mb-3" style={{ color: 'var(--text-secondary)' }}>
                          <span>Banned: {new Date(user.banned_at).toLocaleDateString()}</span>
                          <span>Expires: {new Date(user.banned_until).toLocaleDateString()}</span>
                        </div>
                        <Button
                          onClick={() => user.user_id && handleUnban(user.user_id, user.name)}
                          variant="success"
                          size="sm"
                          loading={unbanUserMutation.isPending}
                          disabled={!user.user_id}
                          fullWidth
                        >
                          Unban
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={confirmDialog.onConfirm}
        onCancel={closeConfirm}
        type={confirmDialog.type}
        confirmText="Confirm"
        cancelText="Cancel"
      />
    </div>
  );
};

export default Admin;