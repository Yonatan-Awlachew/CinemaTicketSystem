const API_BASE_URL = 'http://localhost:5139/api';

class ScreeningService {
    getAuthHeader() {
        const token = localStorage.getItem('token');
        return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        };
    }

    async getAllScreenings() {
        try {
        const response = await fetch(`${API_BASE_URL}/screenings`);
        if (!response.ok) throw new Error('Failed to fetch screenings');
        return response.json();
        } catch (error) {
        console.error('Get screenings error:', error);
        throw error;
        }
    }

    async getScreening(id) {
        try {
        const response = await fetch(`${API_BASE_URL}/screenings/${id}`);
        if (!response.ok) throw new Error('Failed to fetch screening');
        return response.json();
        } catch (error) {
        console.error('Get screening error:', error);
        throw error;
        }
    }

    async createScreening(screeningData) {
        try {
        const response = await fetch(`${API_BASE_URL}/screenings`, {
            method: 'POST',
            headers: this.getAuthHeader(),
            body: JSON.stringify(screeningData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Failed to create screening');
        }

        return data;
        } catch (error) {
        console.error('Create screening error:', error);
        throw error;
        }
    }

    async deleteScreening(id) {
        try {
        const response = await fetch(`${API_BASE_URL}/screenings/${id}`, {
            method: 'DELETE',
            headers: this.getAuthHeader()
        });

        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Failed to delete screening');
        }

        return response.json();
        } catch (error) {
        console.error('Delete screening error:', error);
        throw error;
        }
    }

    async getAllCinemas() {
        try {
        const response = await fetch(`${API_BASE_URL}/cinemas`);
        if (!response.ok) throw new Error('Failed to fetch cinemas');
        return response.json();
        } catch (error) {
        console.error('Get cinemas error:', error);
        throw error;
        }
    }
}

export default new ScreeningService();