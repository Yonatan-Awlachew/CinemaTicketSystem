const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5139/api';

class AuthService {
    async register(userData) {
        console.log('🔵 Registering user:', { ...userData, password: '***' });
        console.log('🔵 API URL:', `${API_BASE_URL}/auth/register`);
        
        try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData)
        });

        console.log('🔵 Response status:', response.status);
        console.log('🔵 Response headers:', response.headers);

        const data = await response.json();
        console.log('🔵 Response data:', data);

        if (!response.ok) {
            console.error('❌ Registration failed:', data);
            
            // Handle different error formats
            if (data.errors) {
            // Validation errors
            const errorMessages = Object.entries(data.errors)
                .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                .join('\n');
            throw new Error(errorMessages);
            } else if (data.message) {
            throw new Error(data.message);
            } else {
            throw new Error('Registration failed');
            }
        }

        console.log('✅ Registration successful');
        return data;
        } catch (error) {
        console.error('❌ Fetch error:', error);
        
        if (error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5139');
        }
        
        throw error;
        }
    }

    async login(credentials) {
        console.log('🔵 Logging in user:', { email: credentials.email, password: '***' });
        console.log('🔵 API URL:', `${API_BASE_URL}/auth/login`);
        
        try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        console.log('🔵 Response status:', response.status);

        const data = await response.json();
        console.log('🔵 Response data:', data);

        if (!response.ok) {
            console.error('❌ Login failed:', data);
            throw new Error(data.message || 'Invalid email or password');
        }

        console.log('✅ Login successful');
        return data;
        } catch (error) {
        console.error('❌ Fetch error:', error);
        
        if (error.message === 'Failed to fetch') {
            throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5139');
        }
        
        throw error;
        }
    }
}

export default new AuthService();
