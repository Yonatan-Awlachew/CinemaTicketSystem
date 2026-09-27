import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import screeningService from '../services/screeningService';
import reservationService from '../services/reservationService';

function SeatSelection({ screening, onBack }) {
    const { user } = useAuth();
    const [cinema, setCinema] = useState(null);
    const [reservedSeats, setReservedSeats] = useState([]);
    const [myReservations, setMyReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reserving, setReserving] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        loadSeatData();
    }, [screening.id]);

    const loadSeatData = async () => {
        try {
            setLoading(true);
            setError('');

            // Get screening details to get cinema info
            const screeningDetails = await screeningService.getScreening(screening.id);
            
            // Get cinema details
            const cinemas = await screeningService.getAllCinemas();
            const cinemaData = cinemas.find(c => c.id === screeningDetails.cinemaId);
            
            if (!cinemaData) {
                throw new Error('Cinema information not found');
            }
            
            setCinema(cinemaData);

            // Get reserved seats (this endpoint doesn't require auth)
            try {
                const seats = await reservationService.getReservedSeats(screening.id);
                setReservedSeats(Array.isArray(seats) ? seats : []);
            } catch (seatErr) {
                console.error('Error loading seats:', seatErr);
                setReservedSeats([]); // Continue with empty array if seats fail to load
            }

            // Check if current user has reservations for this screening
            if (user) {
                try {
                    const allMyReservations = await reservationService.getMyReservations();
                    const myScreeningReservations = allMyReservations.filter(r => r.screeningId === screening.id);
                    setMyReservations(myScreeningReservations);
                } catch (resErr) {
                    console.error('Error loading user reservations:', resErr);
                    setMyReservations([]);
                }
            }
        } catch (err) {
            console.error('Load seat data error:', err);
            setError('Failed to load seat information: ' + (err.message || 'Unknown error'));
        } finally {
            setLoading(false);
        }
    };

    const isSeatReserved = (row, seat) => {
        return reservedSeats.some(s => s.rowNumber === row && s.seatNumber === seat);
    };

    const isMyReservation = (row, seat) => {
        return myReservations.some(r => r.rowNumber === row && r.seatNumber === seat);
    };

    const handleSeatClick = async (row, seat) => {
        if (!user) {
            alert('Please login to reserve seats');
            return;
        }

        // Check if this is the user's reservation - allow cancel
        if (isMyReservation(row, seat)) {
            const reservation = myReservations.find(r => r.rowNumber === row && r.seatNumber === seat);
            if (reservation && window.confirm('Do you want to cancel this reservation?')) {
                await handleCancelReservation(reservation.id);
            }
            return;
        }

        // Check if seat is already reserved by someone else
        if (isSeatReserved(row, seat)) {
            alert('This seat is already reserved');
            return;
        }

        // Reserve the seat (users can reserve multiple seats)
        await handleReserveSeat(row, seat);
    };

    const handleReserveSeat = async (row, seat) => {
        try {
            setReserving(true);
            setError('');

            await reservationService.reserveSeat(screening.id, row, seat);
            
            alert(`Seat ${row}-${seat} reserved successfully!`);
            await loadSeatData(); // Reload to get updated seat status
        } catch (err) {
            if (err.code === 'SEAT_ALREADY_RESERVED') {
                setError('This seat was just reserved by someone else. Please choose another seat.');
                await loadSeatData(); // Reload to show updated seats
            } else {
                setError(err.message || 'Failed to reserve seat');
            }
        } finally {
            setReserving(false);
        }
    };

    const handleCancelReservation = async (reservationId) => {
        try {
            setReserving(true);
            setError('');

            await reservationService.cancelReservation(reservationId);
            
            alert('Reservation cancelled successfully!');
            await loadSeatData();
        } catch (err) {
            setError('Failed to cancel reservation: ' + err.message);
        } finally {
            setReserving(false);
        }
    };

    const getSeatClass = (row, seat) => {
        if (isMyReservation(row, seat)) {
            return 'btn btn-success'; // My reservation - green
        }
        if (isSeatReserved(row, seat)) {
            return 'btn btn-danger'; // Reserved by others - red
        }
        return 'btn btn-outline-primary'; // Available - blue outline
    };

    const getSeatIcon = (row, seat) => {
        if (isMyReservation(row, seat)) {
            return '✓'; // My reservation
        }
        if (isSeatReserved(row, seat)) {
            return '✗'; // Reserved
        }
        return '○'; // Available
    };

    if (loading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Loading seats...</p>
                </div>
            </div>
        );
    }

    if (!cinema) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger">Failed to load cinema information</div>
                {onBack && (
                    <button className="btn btn-secondary" onClick={onBack}>
                        ← Back to Screenings
                    </button>
                )}
            </div>
        );
    }

    return (
        <div className="container mt-4">
            <div className="row">
                <div className="col-12">
                    <div className="card shadow">
                        <div className="card-header bg-primary text-white">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h3 className="mb-0">🎬 {screening.filmTitle}</h3>
                                    <small>{cinema.name} • {new Date(screening.startDateTime).toLocaleString()}</small>
                                </div>
                                {onBack && (
                                    <button className="btn btn-light btn-sm" onClick={onBack}>
                                        ← Back
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="card-body">
                            {error && (
                                <div className="alert alert-warning" role="alert">
                                    {error}
                                </div>
                            )}

                            {/* Legend */}
                            <div className="mb-4 p-3 bg-light rounded">
                                <strong>Legend:</strong>
                                <div className="d-flex gap-3 mt-2 flex-wrap">
                                    <div>
                                        <button className="btn btn-outline-primary btn-sm me-2" disabled>○</button>
                                        Available
                                    </div>
                                    <div>
                                        <button className="btn btn-danger btn-sm me-2" disabled>✗</button>
                                        Reserved
                                    </div>
                                    <div>
                                        <button className="btn btn-success btn-sm me-2" disabled>✓</button>
                                        Your Reservation
                                    </div>
                                </div>
                                {myReservations.length > 0 && (
                                    <div className="mt-2">
                                        <strong>Your Reservations:</strong>
                                        <div className="d-flex gap-2 flex-wrap mt-1">
                                            {myReservations.map(res => (
                                                <span key={res.id} className="badge bg-success">
                                                    Row {res.rowNumber}, Seat {res.seatNumber}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Screen */}
                            <div className="text-center mb-3">
                                <div className="bg-dark text-white py-2 px-4 d-inline-block rounded">
                                    🎥 SCREEN
                                </div>
                            </div>

                            {/* Seat Grid */}
                            <div className="seat-grid" style={{ overflowX: 'auto' }}>
                                <table className="table table-borderless text-center mx-auto" style={{ width: 'auto' }}>
                                    <tbody>
                                        {Array.from({ length: cinema.rowsCount }, (_, rowIndex) => {
                                            const row = rowIndex + 1;
                                            return (
                                                <tr key={row}>
                                                    <td className="align-middle">
                                                        <strong>Row {row}</strong>
                                                    </td>
                                                    {Array.from({ length: cinema.seatsPerRow }, (_, seatIndex) => {
                                                        const seat = seatIndex + 1;
                                                        return (
                                                            <td key={seat} className="p-1">
                                                                <button
                                                                    className={`${getSeatClass(row, seat)} btn-sm`}
                                                                    onClick={() => handleSeatClick(row, seat)}
                                                                    disabled={reserving || (isSeatReserved(row, seat) && !isMyReservation(row, seat))}
                                                                    style={{ 
                                                                        width: '45px', 
                                                                        height: '45px',
                                                                        fontSize: '18px'
                                                                    }}
                                                                    title={`Row ${row}, Seat ${seat}`}
                                                                >
                                                                    {getSeatIcon(row, seat)}
                                                                </button>
                                                                <div style={{ fontSize: '10px' }}>{seat}</div>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {/* Info */}
                            <div className="mt-4 text-center">
                                <p className="text-muted mb-2">
                                    <strong>Available:</strong> {screening.availableSeats} / {screening.totalSeats} seats
                                    <span className="ms-3">
                                        <strong>Price:</strong> ${screening.price.toFixed(2)} per seat
                                    </span>
                                </p>
                                {!user && (
                                    <div className="alert alert-info">
                                        Please login to reserve seats
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default SeatSelection;