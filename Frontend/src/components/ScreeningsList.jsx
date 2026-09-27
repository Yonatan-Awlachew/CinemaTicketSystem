import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import screeningService from '../services/screeningService';

function ScreeningsList({ onNavigate, onSelectScreening }) {
    const { user } = useAuth();
    const [screenings, setScreenings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    useEffect(() => {
        loadScreenings();
    }, []);

    const loadScreenings = async () => {
        try {
            setLoading(true);
            setError('');
            const data = await screeningService.getAllScreenings();
            setScreenings(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, filmTitle) => {
        if (!window.confirm(`Are you sure you want to delete "${filmTitle}"? This will remove all seats for this screening.`)) {
            return;
        }

        try {
            setDeletingId(id);
            await screeningService.deleteScreening(id);
            alert('Screening deleted successfully!');
            loadScreenings();
        } catch (err) {
            alert('Error: ' + err.message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleSelectSeats = (screening) => {
        if (!user) {
            alert('Please login to reserve seats');
            return;
        }
        
        if (onSelectScreening) {
            onSelectScreening(screening);
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

    return (
        <div className="container mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>🎬 Current Screenings</h2>
                {user?.role === 'Administrator' && (
                    <button 
                        className="btn btn-success"
                        onClick={() => onNavigate('create-screening')}
                    >
                        ➕ Add Screening
                    </button>
                )}
            </div>

            {screenings.length === 0 ? (
                <div className="alert alert-info">
                    No screenings available at the moment.
                </div>
            ) : (
                <div className="row">
                    {screenings.map((screening) => (
                        <div key={screening.id} className="col-md-6 col-lg-4 mb-4">
                            <div className={`card h-100 shadow-sm ${isPastScreening(screening.startDateTime) ? 'border-secondary' : ''}`}>
                                <div className="card-body">
                                    <h5 className="card-title">{screening.filmTitle}</h5>
                                    
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            <strong>🏛️ Cinema:</strong> {screening.cinemaName}
                                        </small>
                                    </div>
                                    
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            <strong>📅 Time:</strong> {formatDateTime(screening.startDateTime)}
                                        </small>
                                    </div>
                                    
                                    <div className="mb-2">
                                        <small className="text-muted">
                                            <strong>💵 Price:</strong> ${screening.price.toFixed(2)}
                                        </small>
                                    </div>
                                    
                                    <div className="mb-3">
                                        <small className={`text-${screening.availableSeats > 0 ? 'success' : 'danger'}`}>
                                            <strong>🪑 Available:</strong> {screening.availableSeats} / {screening.totalSeats}
                                        </small>
                                    </div>

                                    {isPastScreening(screening.startDateTime) && (
                                        <span className="badge bg-secondary mb-2">Past Screening</span>
                                    )}

                                    <div className="d-flex gap-2">
                                        <button 
                                            className="btn btn-primary btn-sm flex-grow-1"
                                            onClick={() => handleSelectSeats(screening)}
                                            disabled={isPastScreening(screening.startDateTime) || screening.availableSeats === 0}
                                        >
                                            {isPastScreening(screening.startDateTime) 
                                                ? 'Screening Ended' 
                                                : screening.availableSeats === 0 
                                                ? 'Sold Out' 
                                                : '🎟️ Select Seats'}
                                        </button>
                                        
                                        {user?.role === 'Administrator' && (
                                            <button 
                                                className="btn btn-danger btn-sm"
                                                onClick={() => handleDelete(screening.id, screening.filmTitle)}
                                                disabled={deletingId === screening.id}
                                            >
                                                {deletingId === screening.id ? (
                                                    <span className="spinner-border spinner-border-sm"></span>
                                                ) : (
                                                    '🗑️'
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default ScreeningsList;