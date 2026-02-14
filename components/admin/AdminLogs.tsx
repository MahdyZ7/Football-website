'use client';

import React from 'react';
import { TableRowSkeleton } from '../Skeleton';
import { useAdminLogs } from '../../hooks/useQueries';
import { useAdminLogsFormatter } from '../../hooks/useAdminLogsFormatter';
import { AdminLog } from '../../types/user';

const AdminLogsTab: React.FC = () => {
  const { data: logs = [], isLoading: loading, error } = useAdminLogs();
  const { formatTimestamp, getActionColorClass, formatActionName } = useAdminLogsFormatter();

  if (loading) {
    return (
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
              <tr>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Timestamp</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Admin</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Action</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Target User</th>
                <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Details</th>
              </tr>
            </thead>
            <tbody>
              <TableRowSkeleton columns={5} rows={10} />
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg shadow-md p-6 text-center bg-red-500 text-white">
        <p className="font-medium">Failed to load admin logs</p>
      </div>
    );
  }

  return (
    <div>
      <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
          <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
            Recent Admin Actions ({logs.length})
          </h3>
        </div>
        <div className="p-6">
          {logs.length === 0 ? (
            <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
              No admin actions logged yet
            </p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Timestamp</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Admin</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Action</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Target User</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log: AdminLog) => (
                      <tr key={log.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                        <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-4 py-3">
                          <strong className="text-ft-primary">{log.admin_user}</strong>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`font-bold ${getActionColorClass(log.action)}`}>
                            {formatActionName(log.action)}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {log.target_user && (
                            <div>
                              <div className="font-medium" style={{ color: 'var(--text-primary)' }}>{log.target_name}</div>
                              <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>({log.target_user})</div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {log.details && (
                            <span className="text-sm italic" style={{ color: 'var(--text-primary)' }}>{log.details}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden space-y-3">
                {logs.map((log: AdminLog) => (
                  <div
                    key={log.id}
                    className="rounded-lg p-4 border"
                    style={{
                      backgroundColor: 'var(--bg-secondary)',
                      borderColor: 'var(--border-color)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`font-bold text-sm ${getActionColorClass(log.action)}`}>
                        {formatActionName(log.action)}
                      </span>
                      <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                        {formatTimestamp(log.timestamp)}
                      </span>
                    </div>
                    <div className="text-sm mb-1">
                      <span style={{ color: 'var(--text-secondary)' }}>By: </span>
                      <strong className="text-ft-primary">{log.admin_user}</strong>
                    </div>
                    {log.target_user && (
                      <div className="text-sm mb-1">
                        <span style={{ color: 'var(--text-secondary)' }}>Target: </span>
                        <span style={{ color: 'var(--text-primary)' }}>
                          {log.target_name} ({log.target_user})
                        </span>
                      </div>
                    )}
                    {log.details && (
                      <p className="text-sm italic mt-2" style={{ color: 'var(--text-primary)' }}>{log.details}</p>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="mt-8 p-4 rounded-lg text-sm" style={{
        backgroundColor: 'var(--bg-card)',
        color: 'var(--text-secondary)'
      }}>
        <strong>Note:</strong> This page shows the last 100 admin actions for transparency.
        All administrative actions are automatically logged and publicly viewable.
      </div>
    </div>
  );
};

export default AdminLogsTab;
