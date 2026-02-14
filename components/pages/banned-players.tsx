
import React from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './footer';
import { Button } from '../ui/Button';
import { useBannedUsers } from '../../hooks/useQueries';
import { useBannedPlayersFilter } from '../../hooks/useBannedPlayersFilter';
import { TableRowSkeleton } from '../Skeleton';

/**
 * BannedPlayersPage Component
 * Single Responsibility: Display public list of banned players
 *
 * Business logic extracted to custom hooks:
 * - useBannedPlayersFilter: Filter and format banned users data
 */
const BannedPlayersPage: React.FC = () => {
  const { data: bannedUsers = [], isLoading: loading, error } = useBannedUsers();
  const { activeBans, expiredBans, formatDate } = useBannedPlayersFilter(bannedUsers);

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
            <Link href="/">
              <Button variant="primary">← Back to Registration</Button>
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
                    <>
                      {/* Desktop Table */}
                      <div className="hidden md:block overflow-x-auto">
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

                      {/* Mobile Card View */}
                      <div className="md:hidden space-y-3">
                        {activeBans.map((user, idx) => (
                          <div
                            key={`${user.intra}-${user.banned_at}-${idx}`}
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
                              <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {user.intra}
                              </span>
                            </div>
                            <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                              {user.reason}
                            </p>
                            <div className="flex items-center justify-between text-xs">
                              <span style={{ color: 'var(--text-secondary)' }}>
                                Banned: {formatDate(user.banned_at)}
                              </span>
                              <span className="text-red-600 font-bold">
                                Expires: {formatDate(user.banned_until)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
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
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
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

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-3">
                      {expiredBans.map((user, idx) => (
                        <div
                          key={`${user.intra}-${user.banned_at}-${idx}`}
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
                            <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                              {user.intra}
                            </span>
                          </div>
                          <p className="text-sm mb-2" style={{ color: 'var(--text-primary)' }}>
                            {user.reason}
                          </p>
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: 'var(--text-secondary)' }}>
                              Banned: {formatDate(user.banned_at)}
                            </span>
                            <span className="text-green-600 font-bold">
                              Expired: {formatDate(user.banned_until)}
                            </span>
                          </div>
                        </div>
                      ))}
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
