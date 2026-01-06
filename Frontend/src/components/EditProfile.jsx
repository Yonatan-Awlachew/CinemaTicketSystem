import React, { useState } from 'react';
import userService from '../services/userService';

function EditProfile({ profile, onSuccess, onCancel, isAdmin = false, userId = null }) {
    const [formData, setFormData] = useState({
        firstName: profile?.firstName || '',
        lastName: profile?.lastName || '',
        phoneNumber: profile?.phoneNumber || '',
        rowVersion: profile?.rowVersion || []
    });
    const [error, setError] = useState('');
    const [concurrencyError, setConcurrencyError] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
        setError('');
        setConcurrencyError(false);
    };

    const handleReload = async () => {
        try {
        setLoading(true);
        const refreshedProfile = isAdmin && userId
            ? await userService.getUser(userId)
            : await userService.getCurrentUser();
        
        setFormData({
            firstName: refreshedProfile.firstName,
            lastName: refreshedProfile.lastName,
            phoneNumber: refreshedProfile.phoneNumber || '',
            rowVersion: refreshedProfile.rowVersion
        });
        setConcurrencyError(false);
        setError('');
        alert('Profile reloaded with latest data. You can now edit again.');
        } catch (err) {
        setError('Failed to reload profile');
        } finally {
        setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setConcurrencyError(false);
        setLoading(true);

        try {
        const updateData = {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phoneNumber: formData.phoneNumber || null,
            rowVersion: formData.rowVersion
        };

        const updatedProfile = isAdmin && userId
            ? await userService.updateUser(userId, updateData)
            : await userService.updateCurrentUser(updateData);

        alert('Profile updated successfully!');
        onSuccess(updatedProfile);
        } catch (err) {
        if (err.code === 'CONCURRENCY_CONFLICT') {
            setConcurrencyError(true);
            setError(err.message);
        } else {
            setError(err.message || 'Failed to update profile');
        }
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
        <div className="row justify-content-center">
            <div className="col-md-8">
            <div className="card shadow">
                <div className="card-header bg-primary text-white">
                <h3 className="mb-0">✏️ Edit Profile</h3>
                </div>
                <div className="card-body p-4">
                {error && (
                    <div className={`alert ${concurrencyError ? 'alert-warning' : 'alert-danger'}`} role="alert">
                    <strong>{concurrencyError ? '⚠️ Concurrency Conflict' : 'Error'}:</strong>
                    <p className="mb-2">{error}</p>
                    {concurrencyError && (
                        <button 
                        className="btn btn-warning btn-sm"
                        onClick={handleReload}
                        disabled={loading}
                        >
                        🔄 Reload Latest Data
                        </button>
                    )}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        value={profile?.email}
                        disabled
                    />
                    <small className="text-muted">Email cannot be changed</small>
                    </div>

                    <div className="mb-3">
                    <label htmlFor="firstName" className="form-label">
                        First Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="firstName"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    </div>

                    <div className="mb-3">
                    <label htmlFor="lastName" className="form-label">
                        Last Name <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="lastName"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                    </div>

                    <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label">
                        Phone Number
                    </label>
                    <input
                        type="tel"
                        className="form-control"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleChange}
                        placeholder="+1234567890"
                    />
                    </div>

                    <div className="d-flex gap-2">
                    <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={loading}
                    >
                        {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Saving...
                        </>
                        ) : (
                        '💾 Save Changes'
                        )}
                    </button>
                    <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={onCancel}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    </div>
                </form>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default EditProfile;