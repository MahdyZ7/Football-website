
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from './Navbar';
import Footer from './footer';

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
    if (isAuthenticated) {
      fetchUsers();
    }
  }, [isAuthenticated]);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/admin/auth');
      setIsAuthenticated(response.data.authenticated);
    } catch (error) {
      setIsAuthenticated(false);
    }
  };

  const fetchUsers = async () => {
    const response = await axios.get('/api/users');
    setUsers(response.data);
  };

  const handleDelete = async (id: string) => {
    try {
      await axios.delete('/api/admin/users', { data: { id } });
      await fetchUsers();
    } catch (error) {
      alert('Failed to delete user');
    }
  };

  const login42 = () => {
    window.location.href = '/api/admin/auth/42';
  };

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="container">
          <h1>Admin Login</h1>
          <button onClick={login42}>Login with 42</button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="container">
        <h1>Admin Dashboard</h1>
        <div className="admin-panel">
          <h2>Registered Users</h2>
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>ID</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.id}</td>
                  <td>{user.verified ? '✅' : '❌'}</td>
                  <td>
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="delete-btn"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Admin;
