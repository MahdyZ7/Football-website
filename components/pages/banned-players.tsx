
import React from 'react';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './footer';
import { useBannedUsers } from '../../hooks/useQueries';


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
    <>
      <Navbar />
      <div className="container">
        <h1>Banned Players</h1>
        
        <div style={{ marginBottom: '2rem' }}>
          <Link 
            href="/" 
            style={{ 
              color: 'var(--ft-primary)', 
              textDecoration: 'none',
              fontSize: '1rem'
            }}
          >
            ← Back to Registration
          </Link>
        </div>

        {loading ? (
          <div className="card">
            <div className="card-body">
              <p style={{ textAlign: 'center' }}>Loading banned players...</p>
            </div>
          </div>
        ) : error ? (
          <div className="card">
            <div className="card-body">
              <p style={{ textAlign: 'center', color: '#ff6b6b' }}>Error loading banned users</p>
            </div>
          </div>
        ) : (
          <>
            {/* Active Bans */}
            <div className="card">
              <div className="card-header">
                <h3>Currently Banned Players ({activeBans.length})</h3>
              </div>
              <div className="card-body">
                {activeBans.length === 0 ? (
                  <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                    No players are currently banned
                  </p>
                ) : (
                  <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>Player</th>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>ID</th>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>Reason</th>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>Banned Date</th>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>Ban Expires</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeBans.map((user, idx) => (
                          <tr key={`${user.intra}-${user.banned_at}-${idx}`}>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              {user.name}
                            </td>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              {user.intra}
                            </td>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              {user.reason}
                            </td>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              {formatDate(user.banned_at)}
                            </td>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              <span style={{ color: '#ff6b6b', fontWeight: 'bold' }}>
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
              <div className="card" style={{ marginTop: '2rem' }}>
                <div className="card-header">
                  <h3>Recently Expired Bans ({expiredBans.length})</h3>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table" style={{ width: '100%', borderCollapse: 'collapse', opacity: 0.7 }}>
                      <thead>
                        <tr>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>Player</th>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>ID</th>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>Reason</th>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>Banned Date</th>
                          <th style={{ padding: '0.8rem', borderBottom: '2px solid var(--bg-secondary)' }}>Expired On</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expiredBans.map((user, idx) => (
                          <tr key={`${user.intra}-${user.banned_at}-${idx}`}>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              {user.name}
                            </td>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              {user.intra}
                            </td>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              {user.reason}
                            </td>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              {formatDate(user.banned_at)}
                            </td>
                            <td style={{ padding: '0.8rem', borderBottom: '1px solid var(--bg-secondary)' }}>
                              <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>
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
      <Footer />
    </>
  );
};

export default BannedPlayersPage;
