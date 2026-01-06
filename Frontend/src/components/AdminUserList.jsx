import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import EditProfile from './EditProfile';

function AdminUserList() {
    const { user: authUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingUser, setEditingUser] = useState(null);

    useEffect(() => {
        if (authUser?.role !== 'Administrator') {
        setError('Access denied. Admin only.');
        setLoading(false);
        return;
        }
        loadUsers();
    }, [authUser]);

    const loadUsers = async () => {
        try {
        setLoading(true);
        setError('');
        const data = await userService.getAllUsers();
        setUsers(data);
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    };

    const handleEditUser = async (userId) => {
        try {
        const user = await userService.getUser(userId);
        setEditingUser(user);
        } catch (err) {
        alert('Failed to load user: ' + err.message);
        }
    };

    const handleUpdateSuccess = (updatedUser) => {
        setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
        setEditingUser(null);
    };

    if (loading) {
        return (
        <div className="container mt-5">
            <div className="text-center">
            <div className="spinner-border" role="status"></div>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="container mt-5">
            <div className="alert alert-danger">{error}</div>
        </div>
        );
    }

    if (editingUser) {
        return (
        <EditProfile
            profile={editingUser}
            onSuccess={handleUpdateSuccess}
            onCancel={() => setEditingUser(null)}
            isAdmin={true}
            userId={editingUser.id}
        />
        );
    }

    return (
        <div className="container mt-5">
        <div className="card shadow">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
            <h3 className="mb-0">👥 User Management</h3>
            <span className="badge bg-light text-dark">{users.length} users</span>
            </div>
            <div className="card-body p-0">
            <div className="table-responsive">
                <table className="table table-hover mb-0">
                <thead className="table-light">
                    <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                    <tr key={user.id}>
                        <td>{user.email}</td>
                        <td>{user.firstName} {user.lastName}</td>
                        <td>{user.phoneNumber || '-'}</td>
                        <td>
                        <span className={`badge ${user.role === 'Administrator' ? 'bg-danger' : 'bg-primary'}`}>
                            {user.role}
                        </span>
                        </td>
                        <td>
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => handleEditUser(user.id)}
                        >
                            ✏️ Edit
                        </button>
                        </td>
                    </tr>
                    ))}
                </tbody>
                </table>
            </div>
            </div>
        </div>
        </div>
    );
}

export default AdminUserList;