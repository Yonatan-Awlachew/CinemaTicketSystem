const API_BASE_URL = 'http://localhost:5139/api';

class ReservationService {
    getAuthHeader() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    async reserveSeat(screeningId, rowNumber, seatNumber) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations`, {
                method: 'POST',
                headers: this.getAuthHeader(),
                body: JSON.stringify({
                    screeningId,
                    rowNumber,
                    seatNumber
                })
            });

            const data = await response.json();

            if (!response.ok) {
                if (response.status === 409 && data.code === 'SEAT_ALREADY_RESERVED') {
                    throw { code: 'SEAT_ALREADY_RESERVED', message: data.message };
                }
                throw new Error(data.message || 'Failed to reserve seat');
            }

            return data;
        } catch (error) {
            console.error('Reserve seat error:', error);
            throw error;
        }
    }

    async cancelReservation(reservationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
                method: 'DELETE',
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Failed to cancel reservation');
            }

            return response.json();
        } catch (error) {
            console.error('Cancel reservation error:', error);
            throw error;
        }
    }

    async getMyReservations() {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/my`, {
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reservations');
            }

            return response.json();
        } catch (error) {
            console.error('Get my reservations error:', error);
            throw error;
        }
    }

    async getReservedSeats(screeningId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/screening/${screeningId}`);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Failed to fetch reserved seats:', response.status, errorText);
                throw new Error(`Failed to fetch reserved seats: ${response.status}`);
            }

            const data = await response.json();
            console.log('Reserved seats data:', data);
            return data;
        } catch (error) {
            console.error('Get reserved seats error:', error);
            throw error;
        }
    }

    async getReservation(reservationId) {
        try {
            const response = await fetch(`${API_BASE_URL}/reservations/${reservationId}`, {
                headers: this.getAuthHeader()
            });

            if (!response.ok) {
                throw new Error('Failed to fetch reservation');
            }

            return response.json();
        } catch (error) {
            console.error('Get reservation error:', error);
            throw error;
        }
    }
}

export default new ReservationService();