import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Shield, Trash2, Edit } from 'lucide-react';
import { useFoodSharingContext } from '../hooks/useFoodSharing';

const EmptyState = ({ message }) => (
  <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-100 text-gray-500 text-md">
    <p>{message}</p>
  </div>
);

const UserCard = ({ user, handleUpdateRole, handleDeleteUser }) => (
  <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100 transition-all duration-200 hover:shadow-md">
    <h5 className="font-semibold text-lg text-gray-800 mb-1">{user.name}</h5>
    <p className="text-sm text-gray-600 mb-1">Email: <span className="font-medium">{user.email}</span></p>
    <p className="text-sm text-gray-600 mb-2">Role: <span className="font-medium capitalize">{user.role}</span></p>
    <div className="flex space-x-2">
      <select
        value={user.role}
        onChange={(e) => handleUpdateRole(user.user_id, e.target.value)}
        className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
      >
        <option value="donor">Donor</option>
        <option value="recipient">Recipient</option>
        <option value="admin">Admin</option>
      </select>
      <button
        onClick={() => handleDeleteUser(user.user_id)}
        className="px-3 py-1 bg-red-500 text-white text-sm rounded-md hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  </div>
);

const SuperAdminPage = () => {
  const { user, userRole, setCurrentView } = useFoodSharingContext();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Create a reusable axios instance for authenticated requests
  const getAuthHeaders = () => {
    const token = localStorage.getItem('userToken');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!user || userRole !== 'admin') {
        setLoading(false);
        setError("Access denied. Admin role required.");
        setCurrentView('login');
        return;
      }

      setLoading(true);
      setError(null);

      const token = localStorage.getItem('userToken');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        setLoading(false);
        setCurrentView('login');
        return;
      }

      try {
        const usersRes = await axios.get(`http://localhost:4000/api/users`, getAuthHeaders());
        setUsers(usersRes.data);
      } catch (err) {
        console.error('Error fetching users:', err.response?.data?.error || err.message);
        setError('Failed to load users: ' + (err.response?.data?.error || err.message));
        if (err.response?.status === 403 || err.response?.status === 401) {
          setCurrentView('login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, userRole, setCurrentView]);

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const response = await axios.put(
        `http://localhost:4000/api/users/${userId}/role`,
        { role: newRole }, // Only send the new role in the body
        getAuthHeaders()
      );
      setUsers(prev => prev.map(u => u.user_id === userId ? response.data : u));
    } catch (err) {
      console.error('Error updating user role:', err.response?.data?.error || err.message);
      alert('Failed to update user role: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await axios.delete(
          `http://localhost:4000/api/users/${userId}`,
          getAuthHeaders() // Pass headers for authorization
        );
        setUsers(prev => prev.filter(u => u.user_id !== userId));
      } catch (err) {
        console.error('Error deleting user:', err.response?.data?.error || err.message);
        alert('Failed to delete user: ' + (err.response?.data?.error || err.message));
      }
    }
  };

  if (loading) return <div className="text-center py-12 text-gray-600 text-lg">Loading admin dashboard...</div>;
  if (error) return <div className="text-center py-12 text-red-600 text-lg">Error: {error}</div>;
  if (!user || userRole !== 'admin') return null; // Fallback redirect

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-inter antialiased">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-100">
          <div className="flex items-center space-x-2 mb-4">
            <Shield className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-bold text-gray-900">Super Admin Dashboard</h2>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Manage Users</h3>
          {users.length === 0 ? (
            <EmptyState message="No users found." />
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {users.map((u) => (
                <UserCard
                  key={u.user_id}
                  user={u}
                  handleUpdateRole={handleUpdateRole}
                  handleDeleteUser={handleDeleteUser}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPage;