import React, { useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { AdminOnly } from '../components/AdminOnly';
import './AdminUsers.css';

const AdminUsers: React.FC = () => {
  const { user } = useUser();
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  const users = useQuery(api.users.getAllUsers, user?.id ? { requestingClerkId: user.id } : "skip");
  
  const updateUserRole = useMutation(api.users.updateUserRole);
  const deleteUser = useMutation(api.users.deleteUser);

  const handleRoleChange = async (clerkId: string, newRole: 'admin' | 'user') => {
    try {
      await updateUserRole({ clerkId, role: newRole });
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  const handleDeleteUser = async (clerkId: string) => {
    if (!user?.id) {
      alert('User not authenticated');
      return;
    }
    
    try {
      await deleteUser({ 
        targetClerkId: clerkId, 
        requestingClerkId: user.id 
      });
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert('Failed to delete user');
    }
  };

  const filteredUsers = users?.filter(user => {
    const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.lastName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !selectedRole || user.role === selectedRole;
    return matchesSearch && matchesRole;
  }) || [];

  if (!users) {
    return (
      <div className="admin-users-container">
        <div className="loading">Loading users...</div>
      </div>
    );
  }

  return (
    <AdminOnly>
      <div className="admin-users-container">
        <div className="admin-users-header">
          <h1>User Management</h1>
          <p>Manage user accounts and roles</p>
        </div>

        <div className="admin-controls">
          <div className="search-filter">
            <input
              type="text"
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="role-filter"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="user">User</option>
            </select>
          </div>
        </div>

        <div className="users-stats">
          <div className="stat-card">
            <span className="stat-number">{users.length}</span>
            <span className="stat-label">Total Users</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{users.filter(u => u.role === 'admin').length}</span>
            <span className="stat-label">Admins</span>
          </div>
          <div className="stat-card">
            <span className="stat-number">{users.filter(u => u.role === 'user').length}</span>
            <span className="stat-label">Regular Users</span>
          </div>
        </div>

        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((userData) => (
                <tr key={userData.clerkId} className="user-row">
                  <td className="user-info">
                    <div className="user-avatar">
                      {userData.imageUrl ? (
                        <img src={userData.imageUrl} alt="User avatar" />
                      ) : (
                        <div className="avatar-placeholder">
                          {userData.firstName?.[0] || userData.email[0].toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="user-details">
                      <div className="user-name">
                        {userData.firstName && userData.lastName 
                          ? `${userData.firstName} ${userData.lastName}`
                          : userData.firstName || 'No name'
                        }
                      </div>
                      <div className="user-id">ID: {userData.clerkId.slice(0, 8)}...</div>
                    </div>
                  </td>
                  <td className="user-email">{userData.email}</td>
                  <td className="user-role">
                    <select
                      value={userData.role}
                      onChange={(e) => handleRoleChange(userData.clerkId, e.target.value as 'admin' | 'user')}
                      className={`role-select ${userData.role}`}
                      disabled={userData.clerkId === user?.id}
                    >
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="user-created">
                    {new Date(userData.createdAt).toLocaleDateString()}
                  </td>
                  <td className="user-actions">
                    {userData.clerkId !== user?.id && (
                      <button
                        onClick={() => setShowDeleteConfirm(userData.clerkId)}
                        className="delete-btn"
                        title="Delete user"
                      >
                        🗑️
                      </button>
                    )}
                    {userData.clerkId === user?.id && (
                      <span className="current-user-badge">Current User</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="no-users">
            <p>No users found matching your criteria.</p>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="modal-overlay">
            <div className="delete-confirm-modal">
              <h3>Confirm Delete</h3>
              <p>Are you sure you want to delete this user? This action cannot be undone.</p>
              <div className="modal-actions">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="cancel-btn"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteUser(showDeleteConfirm)}
                  className="confirm-delete-btn"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminOnly>
  );
};

export default AdminUsers; 