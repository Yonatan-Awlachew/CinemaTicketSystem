import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import reservationService from '../services/reservationService';

function MyReservations() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelingId, setCancelingId] = useState(null);

    useEffect(() => {
        if (user) {
            loadReservations();
        }
    }, [user]);

    const loadReservations = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await reservationService.getMyReservations();
            setReservations(data);
        } catch (err) {
            setError('Failed to load reservations: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelReservation = async (reservation) => {
        if (!window.confirm(`Cancel reservation for "${reservation.filmTitle}"?\nSeat: Row ${reservation.rowNumber}, Seat ${reservation.seatNumber}`)) {
            return;
        }

        try {
            setCancelingId(reservation.id);
            await reservationService.cancelReservation(reservation.id);
            alert('Reservation cancelled successfully!');
            await loadReservations(); // Reload list
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setCancelingId(null);
        }
    };

    const formatDateTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const isPastScreening = (dateString) => {
        return new Date(dateString) < new Date();
    };

    const isUpcoming = (dateString) => {
        return new Date(dateString) > new Date();
    };

    const upcomingReservations = reservations.filter(r => isUpcoming(r.startDateTime));
    const pastReservations = reservations.filter(r => isPastScreening(r.startDateTime));

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading your reservations...</p>
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

    return (
        <div className="container mt-4">
            <div className="card shadow">
                <div className="card-header bg-primary text-white">
                    <h3 className="mb-0">🎟️ My Reservations</h3>
                </div>
                <div className="card-body">
                    {reservations.length === 0 ? (
                        <div className="alert alert-info">
                            You don't have any reservations yet. Browse screenings to make your first reservation!
                        </div>
                    ) : (
                        <>
                            {/* Upcoming Reservations */}
                            {upcomingReservations.length > 0 && (
                                <div className="mb-4">
                                    <h4 className="mb-3">
                                        <span className="badge bg-success">Upcoming</span>
                                        <span className="ms-2 text-muted" style={{ fontSize: '1rem' }}>
                                            ({upcomingReservations.length})
                                        </span>
                                    </h4>
                                    <div className="row">
                                        {upcomingReservations.map((reservation) => (
                                            <div key={reservation.id} className="col-md-6 col-lg-4 mb-3">
                                                <div className="card border-success h-100">
                                                    <div className="card-body">
                                                        <h5 className="card-title">{reservation.filmTitle}</h5>
                                                        
                                                        <div className="mb-2">
                                                            <small className="text-muted">
                                                                <strong>🏛️ Cinema:</strong> {reservation.cinemaName}
                                                            </small>
                                                        </div>
                                                        
                                                        <div className="mb-2">
                                                            <small className="text-muted">
                                                                <strong>📅 Time:</strong> {formatDateTime(reservation.startDateTime)}
                                                            </small>
                                                        </div>
                                                        
                                                        <div className="mb-3">
                                                            <span className="badge bg-primary">
                                                                🪑 Row {reservation.rowNumber}, Seat {reservation.seatNumber}
                                                            </span>
                                                        </div>

                                                        <div className="mb-2">
                                                            <small className="text-muted">
                                                                <strong>Reserved:</strong> {formatDateTime(reservation.reservationDateTime)}
                                                            </small>
                                                        </div>

                                                        <button
                                                            className="btn btn-danger btn-sm w-100 mt-2"
                                                            onClick={() => handleCancelReservation(reservation)}
                                                            disabled={cancelingId === reservation.id}
                                                        >
                                                            {cancelingId === reservation.id ? (
                                                                <>
                                                                    <span className="spinner-border spinner-border-sm me-2"></span>
                                                                    Canceling...
                                                                </>
                                                            ) : (
                                                                '🗑️ Cancel Reservation'
                                                            )}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Past Reservations */}
                            {pastReservations.length > 0 && (
                                <div>
                                    <h4 className="mb-3">
                                        <span className="badge bg-secondary">Past</span>
                                        <span className="ms-2 text-muted" style={{ fontSize: '1rem' }}>
                                            ({pastReservations.length})
                                        </span>
                                    </h4>
                                    <div className="row">
                                        {pastReservations.map((reservation) => (
                                            <div key={reservation.id} className="col-md-6 col-lg-4 mb-3">
                                                <div className="card border-secondary h-100 opacity-75">
                                                    <div className="card-body">
                                                        <h5 className="card-title text-muted">{reservation.filmTitle}</h5>
                                                        
                                                        <div className="mb-2">
                                                            <small className="text-muted">
                                                                <strong>🏛️ Cinema:</strong> {reservation.cinemaName}
                                                            </small>
                                                        </div>
                                                        
                                                        <div className="mb-2">
                                                            <small className="text-muted">
                                                                <strong>📅 Time:</strong> {formatDateTime(reservation.startDateTime)}
                                                            </small>
                                                        </div>
                                                        
                                                        <div className="mb-2">
                                                            <span className="badge bg-secondary">
                                                                🪑 Row {reservation.rowNumber}, Seat {reservation.seatNumber}
                                                            </span>
                                                        </div>

                                                        <div className="mt-2">
                                                            <span className="badge bg-dark">Completed</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MyReservations;