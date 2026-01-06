import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import screeningService from '../services/screeningService';

function AdminCreateScreening({ onBack }) {
    const { user } = useAuth();
    const [cinemas, setCinemas] = useState([]);
    const [formData, setFormData] = useState({
        filmTitle: '',
        cinemaId: '',
        startDateTime: '',
        price: '10.00'
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (user?.role !== 'Administrator') {
        setError('Access denied. Admin only.');
        return;
        }
        loadCinemas();
    }, [user]);

    const loadCinemas = async () => {
        try {
        const data = await screeningService.getAllCinemas();
        setCinemas(data);
        if (data.length > 0) {
            setFormData(prev => ({ ...prev, cinemaId: data[0].id.toString() }));
        }
        } catch (err) {
        setError('Failed to load cinemas: ' + err.message);
        }
    };

    const handleChange = (e) => {
        setFormData({
        ...formData,
        [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
        const screeningData = {
            filmTitle: formData.filmTitle,
            cinemaId: parseInt(formData.cinemaId),
            startDateTime: new Date(formData.startDateTime).toISOString(),
            price: parseFloat(formData.price)
        };

        await screeningService.createScreening(screeningData);
        alert('Screening created successfully!');
        
        // Reset form
        setFormData({
            filmTitle: '',
            cinemaId: cinemas[0]?.id.toString() || '',
            startDateTime: '',
            price: '10.00'
        });

        if (onBack) {
            onBack();
        }
        } catch (err) {
        setError(err.message);
        } finally {
        setLoading(false);
        }
    };

    if (user?.role !== 'Administrator') {
        return (
        <div className="container mt-5">
            <div className="alert alert-danger">Access denied. Admin only.</div>
        </div>
        );
    }

    // Get minimum date (tomorrow)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().slice(0, 16);

    return (
        <div className="container mt-5">
        <div className="row justify-content-center">
            <div className="col-md-8">
            <div className="card shadow">
                <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
                <h3 className="mb-0">➕ Create New Screening</h3>
                {onBack && (
                    <button className="btn btn-light btn-sm" onClick={onBack}>
                    ← Back
                    </button>
                )}
                </div>
                <div className="card-body p-4">
                {error && (
                    <div className="alert alert-danger" role="alert">
                    {error}
                    </div>
                )}

                <div className="alert alert-info">
                    <strong>Note:</strong> Screenings cannot be edited after creation. 
                    To modify, you must delete and recreate.
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                    <label htmlFor="filmTitle" className="form-label">
                        Film Title <span className="text-danger">*</span>
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="filmTitle"
                        name="filmTitle"
                        value={formData.filmTitle}
                        onChange={handleChange}
                        required
                        maxLength={300}
                        placeholder="e.g., The Matrix Resurrections"
                    />
                    </div>

                    <div className="mb-3">
                    <label htmlFor="cinemaId" className="form-label">
                        Cinema <span className="text-danger">*</span>
                    </label>
                    <select
                        className="form-select"
                        id="cinemaId"
                        name="cinemaId"
                        value={formData.cinemaId}
                        onChange={handleChange}
                        required
                    >
                        {cinemas.map(cinema => (
                        <option key={cinema.id} value={cinema.id}>
                            {cinema.name} ({cinema.rowsCount} rows × {cinema.seatsPerRow} seats = {cinema.rowsCount * cinema.seatsPerRow} total)
                        </option>
                        ))}
                    </select>
                    <small className="text-muted">
                        Seats will be automatically generated for the selected cinema
                    </small>
                    </div>

                    <div className="mb-3">
                    <label htmlFor="startDateTime" className="form-label">
                        Start Date & Time <span className="text-danger">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        className="form-control"
                        id="startDateTime"
                        name="startDateTime"
                        value={formData.startDateTime}
                        onChange={handleChange}
                        min={minDate}
                        required
                    />
                    <small className="text-muted">
                        Must be a future date
                    </small>
                    </div>

                    <div className="mb-3">
                    <label htmlFor="price" className="form-label">
                        Ticket Price ($) <span className="text-danger">*</span>
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        min="0"
                        max="1000"
                        step="0.01"
                        required
                    />
                    </div>

                    <div className="d-flex gap-2">
                    <button 
                        type="submit" 
                        className="btn btn-success"
                        disabled={loading}
                    >
                        {loading ? (
                        <>
                            <span className="spinner-border spinner-border-sm me-2"></span>
                            Creating...
                        </>
                        ) : (
                        '✅ Create Screening'
                        )}
                    </button>
                    {onBack && (
                        <button 
                        type="button" 
                        className="btn btn-secondary"
                        onClick={onBack}
                        disabled={loading}
                        >
                        Cancel
                        </button>
                    )}
                    </div>
                </form>
                </div>
            </div>
            </div>
        </div>
        </div>
    );
}

export default AdminCreateScreening;