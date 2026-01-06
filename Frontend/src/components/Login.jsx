import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';

function Login({ onSwitchToRegister }) {
    const { login } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
        const data = await authService.login(formData);
        
        login(data.token, {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            role: data.role
        });

        alert('Login successful!');
        } catch (err) {
        setError(err.message);
        console.error('Login error:', err);
        } finally {
        setLoading(false);
        }
    };

    return (
        <div className="container mt-5">
        <div className="row justify-content-center">
            <div className="col-md-5">
            <div className="card shadow">
                <div className="card-body p-5">
                <h2 className="card-title text-center mb-4">Login</h2>
                
                {error && (
                    <div className="alert alert-danger" role="alert">
                    {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                    <label htmlFor="email" className="form-label">Email</label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    </div>

                    <div className="mb-3">
                    <label htmlFor="password" className="form-label">Password</label>
                    <input
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    </div>

                    <button 
                    type="submit" 
                    className="btn btn-primary w-100"
                    disabled={loading}
                    >
                    {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>

                <div className="text-center mt-3">
                    <span className="text-muted">Don't have an account? </span>
                    <button 
                    className="btn btn-link p-0"
                    onClick={onSwitchToRegister}
                    >
                    Register here
                    </button>
                </div>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default Login;