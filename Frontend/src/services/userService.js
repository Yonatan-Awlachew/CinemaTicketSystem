const API_BASE_URL = 'http://localhost:5139/api';

class UserService {
    getAuthHeader() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async getCurrentUser() {
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user profile');
            }

            return response.json();
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    }

    async updateCurrentUser(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/me`, {
                method: 'PUT',
                headers: this.getAuthHeader(),
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    // Concurrency conflict
                    throw { code: 'CONCURRENCY_CONFLICT', message: data.message };
                }
                throw new Error(data.message || 'Failed to update profile');
            }

            return data;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    }

    async getAllUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch users');
            }

            return response.json();
        } catch (error) {
            console.error('Get all users error:', error);
            throw error;
        }
    }

    async getUser(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }

            return response.json();
        } catch (error) {
            console.error('Get user error:', error);
            throw error;
        }
    }

    async updateUser(id, userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'PUT',
                headers: this.getAuthHeader(),
                body: JSON.stringify(userData)
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409) {
                    throw { code: 'CONCURRENCY_CONFLICT', message: data.message };
                }
                throw new Error(data.message || 'Failed to update user');
            }

            return data;
        } catch (error) {
            console.error('Update user error:', error);
            throw error;
        }
    }

    async deleteUser(id) {
        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to delete user');
            }

            return data;
        } catch (error) {
            console.error('Delete user error:', error);
            throw error;
        }
    }
}

export default new UserService();