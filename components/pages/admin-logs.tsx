import React from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './footer';
import { TableRowSkeleton } from '../Skeleton';
import { useAdminLogs } from '../../hooks/useQueries';
import { AdminLog } from '../../types/user';


const AdminLogs: React.FC = () => {
  const { data: logs = [], isLoading: loading, error } = useAdminLogs();

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColorClass = (action: string): string => {
    switch (action.toLowerCase()) {
      case 'user_deleted':
        return 'text-red-500';
      case 'user_banned':
        return 'text-orange-500';
      case 'user_unbanned':
        return 'text-green-600';
      case 'user_verified':
        return 'text-blue-500';
      case 'user_unverified':
        return 'text-gray-500';
      default:
        return '';
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-4" style={{ color: 'var(--text-primary)' }}>
            Admin Action Logs
          </h1>
          <p className="text-center mb-8" style={{ color: 'var(--text-secondary)' }}>
            Public log of all administrative actions performed on the system
          </p>

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

          {loading ? (
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
          ) : error ? (
            <div className="rounded-lg shadow-md p-6 text-center bg-red-500 text-white mb-8">
              <p className="font-medium">Failed to load admin logs</p>
            </div>
          ) : (
            <>
              {/* Admin Logs Card */}
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
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Timestamp
                            </th>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Admin
                            </th>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Action
                            </th>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Target User
                            </th>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Details
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {logs.map((log: AdminLog) => (
                            <tr key={log.id} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
                              <td className="px-4 py-3 text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {formatTimestamp(log.timestamp)}
                              </td>
                              <td className="px-4 py-3">
                                <strong className="text-ft-primary">
                                  {log.admin_user}
                                </strong>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`font-bold ${getActionColorClass(log.action)}`}>
                                  {log.action.replace(/_/g, ' ').toUpperCase()}
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                {log.target_user && (
                                  <div>
                                    <div className="font-medium" style={{ color: 'var(--text-primary)' }}>
                                      {log.target_name}
                                    </div>
                                    <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                      ({log.target_user})
                                    </div>
                                  </div>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                {log.details && (
                                  <span className="text-sm italic" style={{ color: 'var(--text-primary)' }}>
                                    {log.details}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Info Note */}
              <div className="mt-8 p-4 rounded-lg text-sm" style={{
                backgroundColor: 'var(--bg-card)',
                color: 'var(--text-secondary)'
              }}>
                <strong>Note:</strong> This page shows the last 100 admin actions for transparency.
                All administrative actions are automatically logged and publicly viewable.
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminLogs;
