import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

function Register({ onSwitchToLogin }) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: ''
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        setLoading(true);

        console.log('Submitting registration with data:', {
        ...formData,
        password: '***'
        });

        try {
        const data = await authService.register(formData);
        console.log('Registration successful:', data);

        // Auto login after successful registration
        login(data.token, {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role
        });

        alert('Registration successful! You are now logged in.');
        
        
        // Optionally redirect or change view
        if (onSwitchToLogin) {
            setTimeout(() => {
            window.location.reload(); // Reload to show logged in state
            }, 1000);
        }
        } catch (err) {
        console.error('Registration error:', err);
        
    
        // Handle different error formats
        if (err.message) {
            setErrors([err.message]);
        } else if (err.errors) {
            // Handle validation errors from backend
            const errorMessages = Object.values(err.errors).flat();
            setErrors(errorMessages);
        } else {
            setErrors(['Registration failed. Please try again.']);
        }
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
        <div className="row justify-content-center">
            <div className="col-md-6">
            <div className="card shadow">
                <div className="card-body p-5">
                <h2 className="card-title text-center mb-4">Create Account</h2>
                
                {errors.length > 0 && (
                    <div className="alert alert-danger" role="alert">
                    <strong>Registration Failed:</strong>
                    <ul className="mb-0 mt-2">
                        {errors.map((error, index) => (
                        <li key={index}>{error}</li>
                        ))}
                    </ul>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Email <span className="text-danger">*</span>
                    </label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="your.email@example.com"
                    />
                    </div>

                    <div className="mb-3">
                    <label htmlFor="password" className="form-label">
                        Password <span className="text-danger">*</span>
                    </label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        minLength={6}
                        placeholder="Min 6 characters"
                    />
                    <small className="text-muted">
                        Must contain: 1 uppercase letter, 1 lowercase letter, 1 digit
                    </small>
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
                        placeholder="John"
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
                        placeholder="Doe"
                    />
                    </div>

                    <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label">
                        Phone Number <span className="text-muted">(optional)</span>
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

                    <button 
                    type="submit" 
                    className="btn btn-primary w-100 mb-3"
                    disabled={loading}
                    >
                    {loading ? (
                        <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                        </>
                    ) : (
                        'Create Account'
                    )}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <span className="text-muted">Already have an account? </span>
                    <button 
                    className="btn btn-link p-0"
                    onClick={onSwitchToLogin}
                    >
                    Login here
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default Register;