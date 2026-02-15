'use client';

import React, { useState } from 'react';
import { Skeleton, TableRowSkeleton } from '../Skeleton';
import { Button } from '../ui/Button';
import { useUsers, useAdminDeleteUser, useVerifyUser, useBanUser, useUnbanUser } from '../../hooks/useQueries';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import ConfirmDialog from '../ConfirmDialog';
import BanDialog from './BanDialog';
import { toast } from 'sonner';

const AdminUserManagement: React.FC = () => {
  const { confirmDialog, showConfirm, closeConfirm } = useConfirmDialog();
  const [banTarget, setBanTarget] = useState<{ name: string; intra: string } | null>(null);

  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const deleteUserMutation = useAdminDeleteUser();
  const verifyUserMutation = useVerifyUser();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();

  const handleDelete = (intra: string) => {
    const user = users.find(u => u.intra === intra);
    showConfirm({
      title: 'Delete User',
      message: `Are you sure you want to delete "${user?.name || 'this user'}"? This action cannot be undone.`,
      type: 'danger',
      onConfirm: () => {
        deleteUserMutation.mutate(intra, {
          onSuccess: () => toast.success('User deleted successfully'),
          onError: () => toast.error('Failed to delete user'),
        });
      },
    });
  };

  const handleVerifyToggle = (id: string, currentStatus: boolean) => {
    verifyUserMutation.mutate(
      { id, verified: !currentStatus },
      {
        onSuccess: () => toast.success(`User ${!currentStatus ? 'verified' : 'unverified'} successfully`),
        onError: () => toast.error('Failed to update verification status'),
      }
    );
  };

  const handleBanConfirm = (banData: { userId: string; reason: string; duration: string }) => {
    banUserMutation.mutate(banData, {
      onSuccess: () => {
        toast.success('User banned successfully');
        setBanTarget(null);
      },
      onError: () => toast.error('Failed to ban user'),
    });
  };

  const handleQuickBan = (user: { name: string; intra: string }) => {
    showConfirm({
      title: 'Quick Ban (2 days)',
      message: `Ban "${user.name}" (${user.intra}) for 2 days with reason "Quick ban"?`,
      type: 'warning',
      onConfirm: () => {
        banUserMutation.mutate(
          { userId: user.intra, reason: 'Quick ban - 2 days', duration: '2' },
          {
            onSuccess: () => toast.success('User banned for 2 days'),
            onError: () => toast.error('Failed to ban user'),
          }
        );
      },
    });
  };

  const handleUnban = (user: { name: string; intra: string; user_id?: string }) => {
    showConfirm({
      title: 'Unban User',
      message: `Are you sure you want to unban "${user.name}" (${user.intra})?`,
      type: 'info',
      onConfirm: () => {
        unbanUserMutation.mutate(user.user_id || user.intra, {
          onSuccess: () => toast.success('User unbanned successfully'),
          onError: () => toast.error('Failed to unban user'),
        });
      },
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
        Registered Users ({usersLoading ? '...' : users.length})
      </h2>

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
                  <th className="px-4 py-3 text-left"><Skeleton width="60%" height={20} /></th>
                </tr>
              </thead>
              <tbody>
                <TableRowSkeleton columns={6} rows={8} />
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

      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Intra</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Verified</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Registered</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.intra + index} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>
                    {user.name}
                    {user.is_banned && (
                      <span className="ml-2 px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded">
                        BANNED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{user.intra}</td>
                  <td className="px-4 py-3">
                    {user.is_banned ? (
                      <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded">
                        Banned
                      </span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                        Active
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      onClick={() => handleVerifyToggle(user.intra, user.verified)}
                      disabled={verifyUserMutation.isPending}
                      variant={user.verified ? 'success' : 'secondary'}
                      size="sm"
                    >
                      {user.verified ? 'Verified' : 'Unverified'}
                    </Button>
                  </td>
                  <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      {user.is_banned ? (
                        <Button
                          onClick={() => handleUnban({ name: user.name, intra: user.intra, user_id: user.user_id })}
                          variant="success"
                          size="sm"
                          loading={unbanUserMutation.isPending}
                        >
                          Unban
                        </Button>
                      ) : (
                        <>
                          <Button
                            onClick={() => setBanTarget({ name: user.name, intra: user.intra })}
                            variant="primary"
                            size="sm"
                            className="bg-ft-accent hover:bg-orange-600"
                          >
                            Ban
                          </Button>
                          <Button
                            onClick={() => handleQuickBan({ name: user.name, intra: user.intra })}
                            variant="secondary"
                            size="sm"
                          >
                            Quick Ban (2d)
                          </Button>
                        </>
                      )}
                      <Button
                        onClick={() => handleDelete(user.intra)}
                        variant="danger"
                        size="sm"
                        loading={deleteUserMutation.isPending}
                      >
                        Delete
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
                borderColor: user.is_banned ? 'rgb(220, 38, 38)' : 'var(--border-color)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                  {user.is_banned && (
                    <span className="px-2 py-0.5 text-xs font-bold bg-red-600 text-white rounded">
                      BANNED
                    </span>
                  )}
                </div>
                <Button
                  onClick={() => handleVerifyToggle(user.intra, user.verified)}
                  disabled={verifyUserMutation.isPending}
                  variant={user.verified ? 'success' : 'secondary'}
                  size="sm"
                >
                  {user.verified ? 'Verified' : 'Unverified'}
                </Button>
              </div>
              <div className="flex items-center justify-between mb-3 text-sm">
                <span style={{ color: 'var(--text-secondary)' }}>{user.intra}</span>
                <span style={{ color: 'var(--text-secondary)' }}>
                  {new Date(user.created_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {user.is_banned ? (
                  <Button
                    onClick={() => handleUnban({ name: user.name, intra: user.intra, user_id: user.user_id })}
                    variant="success"
                    size="sm"
                    loading={unbanUserMutation.isPending}
                    fullWidth
                  >
                    Unban
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setBanTarget({ name: user.name, intra: user.intra })}
                      variant="primary"
                      size="sm"
                      className="bg-ft-accent hover:bg-orange-600"
                      fullWidth
                    >
                      Ban
                    </Button>
                    <Button
                      onClick={() => handleQuickBan({ name: user.name, intra: user.intra })}
                      variant="secondary"
                      size="sm"
                      fullWidth
                    >
                      Quick Ban (2d)
                    </Button>
                  </>
                )}
                <Button
                  onClick={() => handleDelete(user.intra)}
                  variant="danger"
                  size="sm"
                  loading={deleteUserMutation.isPending}
                  fullWidth
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BanDialog
        isOpen={banTarget !== null}
        targetUser={banTarget}
        onConfirm={handleBanConfirm}
        onCancel={() => setBanTarget(null)}
        isPending={banUserMutation.isPending}
      />

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

export default AdminUserManagement;
