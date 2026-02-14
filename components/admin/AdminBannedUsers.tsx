'use client';

import React from 'react';
import { Skeleton, TableRowSkeleton } from '../Skeleton';
import { Button } from '../ui/Button';
import { useAdminBanned, useUnbanUser } from '../../hooks/useQueries';
import { useConfirmDialog } from '../../hooks/useConfirmDialog';
import ConfirmDialog from '../ConfirmDialog';
import { toast } from 'sonner';

const AdminBannedUsers: React.FC = () => {
  const { confirmDialog, showConfirm, closeConfirm } = useConfirmDialog();
  const { data: bannedUsers = [], isLoading: bannedLoading, error: bannedError } = useAdminBanned();
  const unbanUserMutation = useUnbanUser();

  const handleUnban = (userId: string, userName: string) => {
    showConfirm({
      title: 'Unban User',
      message: `Are you sure you want to unban "${userName}"? They will be able to register again.`,
      type: 'warning',
      onConfirm: () => {
        unbanUserMutation.mutate(userId, {
          onSuccess: () => toast.success('User unbanned successfully'),
          onError: () => toast.error('Failed to unban user'),
        });
      },
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6" style={{ color: 'var(--text-primary)' }}>
        Banned Users ({bannedLoading ? '...' : bannedUsers.length})
      </h2>

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
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Name</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Intra</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Reason</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Banned Date</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Ban Expires</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Status</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bannedUsers.map((user, index) => {
                const isExpired = new Date(user.banned_until) < new Date();
                return (
                  <tr key={`${user.intra}-${index}`} className={`border-b ${isExpired ? 'opacity-60' : ''}`} style={{ borderColor: 'var(--border-color)' }}>
                    <td className="px-4 py-3 font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{user.intra}</td>
                    <td className="px-4 py-3" style={{ color: 'var(--text-primary)' }}>{user.reason}</td>
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
                  <span className="font-medium" style={{ color: 'var(--text-primary)' }}>{user.name}</span>
                  <span className={`font-bold text-sm ${isExpired ? 'text-green-600' : 'text-red-600'}`}>
                    {isExpired ? 'Expired' : 'Active'}
                  </span>
                </div>
                <div className="text-sm mb-2" style={{ color: 'var(--text-secondary)' }}>{user.intra}</div>
                <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>{user.reason}</p>
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

export default AdminBannedUsers;
