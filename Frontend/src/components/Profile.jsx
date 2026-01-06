import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import userService from '../services/userService';
import EditProfile from './EditProfile';

function Profile() {
    const { user: authUser } = useAuth();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
        setLoading(true);
        setError('');
        const data = await userService.getCurrentUser();
        setProfile(data);
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    };

    const handleUpdateSuccess = (updatedProfile) => {
        setProfile(updatedProfile);
        setIsEditing(false);
    };

    if (loading) {
        return (
        <div className="container mt-5">
            <div className="text-center">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
            </div>
        </div>
        );
    }

    if (error) {
        return (
        <div className="container mt-5">
            <div className="alert alert-danger" role="alert">
            {error}
            </div>
        </div>
        );
    }

    if (isEditing) {
        return (
        <EditProfile
            profile={profile}
            onSuccess={handleUpdateSuccess}
            onCancel={() => setIsEditing(false)}
        />
        );
    }

    return (
        <div className="container mt-5">
        <div className="row justify-content-center">
            <div className="col-md-8">
            <div className="card shadow">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h3 className="mb-0">👤 My Profile</h3>
                {authUser?.role === 'Administrator' && (
                    <span className="badge bg-danger">Admin</span>
                )}
                </div>
                <div className="card-body p-4">
                <div className="row mb-3">
                    <div className="col-md-4 text-muted">Email:</div>
                    <div className="col-md-8">
                    <strong>{profile?.email}</strong>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4 text-muted">First Name:</div>
                    <div className="col-md-8">
                    <strong>{profile?.firstName}</strong>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4 text-muted">Last Name:</div>
                    <div className="col-md-8">
                    <strong>{profile?.lastName}</strong>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4 text-muted">Phone Number:</div>
                    <div className="col-md-8">
                    <strong>{profile?.phoneNumber || 'Not provided'}</strong>
                    </div>
                </div>

                <div className="row mb-3">
                    <div className="col-md-4 text-muted">Role:</div>
                    <div className="col-md-8">
                    <span className={`badge ${profile?.role === 'Administrator' ? 'bg-danger' : 'bg-primary'}`}>
                        {profile?.role}
                    </span>
                    </div>
                </div>

                <hr />

                <button 
                    className="btn btn-primary"
                    onClick={() => setIsEditing(true)}
                >
                    ✏️ Edit Profile
                </button>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default Profile;