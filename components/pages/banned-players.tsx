
import React from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './footer';
import { useBannedUsers } from '../../hooks/useQueries';
import { TableRowSkeleton } from '../Skeleton';


const BannedPlayersPage: React.FC = () => {
  const { data: bannedUsers = [], isLoading: loading, error } = useBannedUsers();

  const isExpired = (bannedUntil: string) => {
    return new Date(bannedUntil) < new Date();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const activeBans = bannedUsers.filter(user => !isExpired(user.banned_until));
  const expiredBans = bannedUsers.filter(user => isExpired(user.banned_until));

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--bg-primary)' }}>
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 pt-24 pb-8 px-4 md:px-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-6" style={{ color: 'var(--text-primary)' }}>
            Banned Players
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

          {loading ? (
            <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'var(--bg-card)' }}>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Player</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>ID</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Reason</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Banned Date</th>
                      <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>Ban Expires</th>
                    </tr>
                  </thead>
                  <tbody>
                    <TableRowSkeleton columns={5} rows={6} />
                  </tbody>
                </table>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-lg shadow-md p-8 text-center" style={{ backgroundColor: 'var(--bg-card)' }}>
              <p className="text-red-600 font-medium">Error loading banned users</p>
            </div>
          ) : (
            <>
              {/* Active Bans */}
              <div className="rounded-lg shadow-md overflow-hidden mb-8" style={{ backgroundColor: 'var(--bg-card)' }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                  <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                    Currently Banned Players ({activeBans.length})
                  </h3>
                </div>
                <div className="p-6">
                  {activeBans.length === 0 ? (
                    <p className="text-center py-8" style={{ color: 'var(--text-secondary)' }}>
                      No players are currently banned
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Player
                            </th>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              ID
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
                          </tr>
                        </thead>
                        <tbody>
                          {activeBans.map((user, idx) => (
                            <tr key={`${user.intra}-${user.banned_at}-${idx}`} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
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
                                {formatDate(user.banned_at)}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-red-600 font-bold">
                                  {formatDate(user.banned_until)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>

              {/* Expired Bans */}
              {expiredBans.length > 0 && (
                <div className="rounded-lg shadow-md overflow-hidden opacity-75" style={{ backgroundColor: 'var(--bg-card)' }}>
                  <div className="px-6 py-4 border-b" style={{ borderColor: 'var(--border-color)' }}>
                    <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                      Recently Expired Bans ({expiredBans.length})
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead style={{ backgroundColor: 'var(--bg-secondary)' }}>
                          <tr>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Player
                            </th>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              ID
                            </th>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Reason
                            </th>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Banned Date
                            </th>
                            <th className="px-4 py-3 text-left font-semibold" style={{ color: 'var(--text-secondary)' }}>
                              Expired On
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {expiredBans.map((user, idx) => (
                            <tr key={`${user.intra}-${user.banned_at}-${idx}`} className="border-b" style={{ borderColor: 'var(--border-color)' }}>
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
                                {formatDate(user.banned_at)}
                              </td>
                              <td className="px-4 py-3">
                                <span className="text-green-600 font-bold">
                                  {formatDate(user.banned_until)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BannedPlayersPage;
