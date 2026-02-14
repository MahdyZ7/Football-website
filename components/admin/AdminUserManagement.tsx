'use client';

import React from 'react';
import { Skeleton, TableRowSkeleton } from '../Skeleton';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { useUsers, useAdminDeleteUser, useVerifyUser } from '../../hooks/useQueries';
import { useAdminBanForm } from '../../hooks/useAdminBanForm';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import ConfirmDialog from '../ConfirmDialog';
import { toast } from 'sonner';

const AdminUserManagement: React.FC = () => {
  const { confirmDialog, showConfirm, closeConfirm } = useConfirmDialog();
  const banFormHook = useAdminBanForm();

  const { data: users = [], isLoading: usersLoading, error: usersError } = useUsers();
  const deleteUserMutation = useAdminDeleteUser();
  const verifyUserMutation = useVerifyUser();

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
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Intra</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Verified</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Registered</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                <tr key={user.intra + index} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</td>
                  <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{user.intra}</td>
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
                <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
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
