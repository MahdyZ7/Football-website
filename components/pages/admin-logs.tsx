
import React from 'react';
import Navbar from './Navbar';
import Footer from './footer';
import { useAdminLogs } from '../../hooks/useQueries';


const AdminLogs: React.FC = () => {
  const { data: logs = [], isLoading: loading, error } = useAdminLogs();

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const getActionColor = (action: string) => {
    switch (action.toLowerCase()) {
      case 'user_deleted':
        return '#ff6b6b';
      case 'user_banned':
        return '#ff8c42';
      case 'user_unbanned':
        return '#4CAF50';
      case 'user_verified':
        return '#2196F3';
      case 'user_unverified':
        return '#9E9E9E';
      default:
        return 'var(--text-primary)';
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container">
          <h1>Admin Action Logs</h1>
          <p style={{ textAlign: 'center' }}>Loading admin logs...</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Admin Action Logs</h1>
        <p style={{ 
          color: 'var(--text-secondary)', 
          marginBottom: '2rem',
          textAlign: 'center'
        }}>
          Public log of all administrative actions performed on the system
        </p>

        {error && (
          <div style={{
            background: '#ff6b6b',
            color: 'white',
            padding: '1rem',
            borderRadius: '6px',
            marginBottom: '2rem',
            textAlign: 'center'
          }}>
            Failed to load admin logs
          </div>
        )}

        <div className="card">
          <h3>Recent Admin Actions ({logs.length})</h3>
          
          {logs.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
              No admin actions logged yet
            </p>
          ) : (
            <div className="responsive-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target User</th>
                    <th>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id}>
                      <td data-label="Timestamp">
                        {formatTimestamp(log.timestamp)}
                      </td>
                      <td data-label="Admin">
                        <strong style={{ color: 'var(--ft-primary)' }}>
                          {log.admin_user}
                        </strong>
                      </td>
                      <td data-label="Action">
                        <span style={{ 
                          color: getActionColor(log.action),
                          fontWeight: 'bold'
                        }}>
                          {log.action.replace(/_/g, ' ').toUpperCase()}
                        </span>
                      </td>
                      <td data-label="Target User">
                        {log.target_user && (
                          <div>
                            <div><strong>{log.target_name}</strong></div>
                            <div style={{ 
                              fontSize: '0.9rem', 
                              color: 'var(--text-secondary)' 
                            }}>
                              ({log.target_user})
                            </div>
                          </div>
                        )}
                      </td>
                      <td data-label="Details">
                        {log.details && (
                          <span style={{ 
                            fontSize: '0.9rem',
                            fontStyle: 'italic'
                          }}>
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

        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          background: 'var(--bg-card)',
          borderRadius: '6px',
          fontSize: '0.9rem',
          color: 'var(--text-secondary)'
        }}>
          <strong>Note:</strong> This page shows the last 100 admin actions for transparency. 
          All administrative actions are automatically logged and publicly viewable.
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminLogs;
