// client/src/components/HomePage.js - FINAL CODE WITH TS TRACKER

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const HomePage = () => {
    const navigate = useNavigate();
    const [searchForm, setSearchForm] = useState({
        departureCity: '',
        destinationCity: '',
        departureDate: new Date().toISOString().split('T')[0],
        passengers: 1,
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    // --- New States for Dynamic Routes ---
    const [availableDepartures, setAvailableDepartures] = useState([]);
    const [availableDestinations, setAvailableDestinations] = useState([]);
    const [allRoutes, setAllRoutes] = useState([]); 
    
    // State for Payment Tracker - UPDATED VARIABLE NAME
    const [tsTrackerId, setTsTrackerId] = useState(''); // Use a specific state for TS tracking
    const [trackResult, setTrackResult] = useState(null);
    const [trackError, setTrackError] = useState('');

    // --- API BASE URL (Auto-detects environment) ---
    const API_BASE_URL = process.env.REACT_APP_API_URL || 
        (process.env.NODE_ENV === 'production' 
            ? 'https://ripe-ducks-strive.loca.lt' 
            : 'http://localhost:5000');
    const RENDER_API_URL = API_BASE_URL;

    // --- EFFECT 1: Fetch Initial Routes ---
    useEffect(() => {
        const fetchRoutes = async () => {
            try {
                const response = await axios.get(`${RENDER_API_URL}/api/routes/all`); 
                const { routes, departureCities } = response.data;
                
                setAllRoutes(routes);
                setAvailableDepartures(departureCities);
                
                // Initialize default selections and destinations
                if (departureCities.length > 0) {
                    const defaultDeparture = departureCities[0];
                    setSearchForm(prev => ({ ...prev, departureCity: defaultDeparture }));
                    
                    handleDepartureChange(defaultDeparture, routes);
                }
            } catch (err) {
                console.error('Failed to load routes:', err);
                setError('Failed to load available travel routes from server.');
            }
        };
        fetchRoutes();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); 

    // --- HELPER: Logic to update destinations based on departure city ---
    const handleDepartureChange = (selectedDeparture, routes = allRoutes) => {
        
        const newDestinations = [...new Set(
            routes.filter(r => r.departure === selectedDeparture).map(r => r.destination)
        )].sort();
        
        setAvailableDestinations(newDestinations);
        
        const defaultDestination = newDestinations[0] || '';
        setSearchForm(prev => ({ 
            ...prev, 
            departureCity: selectedDeparture,
            destinationCity: defaultDestination 
        }));
    };

    // --- HELPER: Logic to handle form changes ---
    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'departureCity') {
            handleDepartureChange(value);
        }

        setSearchForm(prev => ({
            ...prev,
            [name]: name === 'passengers' ? parseInt(value) : value,
        }));
    };

    const handleSearchSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        if (!searchForm.departureCity || !searchForm.destinationCity || !searchForm.departureDate) {
            setError('Please select valid Departure, Destination, and Date.');
            setLoading(false);
            return;
        }

        const ARBITRARY_TIME = "00:00 AM"; 

        try {
            const payload = {
                ...searchForm, 
                departureTime: ARBITRARY_TIME 
            };

            const response = await axios.post(
                `${RENDER_API_URL}/api/bookings/initiate`,
                payload 
            );

            const { bookingId, userToken } = response.data;

            // Store session data for the next page
            localStorage.setItem('userToken', userToken);
            localStorage.setItem('currentBookingId', bookingId);
            localStorage.setItem('initialPassengers', searchForm.passengers); 
            localStorage.setItem('lastDestination', searchForm.destinationCity); 
            localStorage.setItem('lastDepartureDate', searchForm.departureDate); 
            localStorage.setItem('lastDepartureCity', searchForm.departureCity);

            navigate('/select-schedule');
            
        } catch (err) {
            console.error('Search/Booking Initiation Error:', err.response?.data || err);
            setError(err.response?.data?.message || 'Could not initiate booking. Check Render server status.'); 
        } finally {
            setLoading(false);
        }
    };
    
    // --- UPDATED TRACKER FUNCTION ---
    const handleTrackPayment = async (e) => {
        e.preventDefault();
        setTrackResult(null);
        setTrackError('');
        
        if (!tsTrackerId) { // Use new state variable
            setTrackError('Please enter a Tracking Code (TS).');
            return;
        }

        try {
            // CRITICAL FIX: Use the specific TS tracking route
            const response = await axios.get(`${RENDER_API_URL}/api/bookings/status/${tsTrackerId}`); 
            setTrackResult(response.data);
        } catch (err) {
            setTrackError(err.response?.data?.message || 'Invalid Tracking Code or server error.');
        }
    };
    // --- END UPDATED TRACKER ---


    return (
        <div 
            className="page-container home-grid" 
            style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '40px'}} 
        >
            
            {/* 1. Main Search Form (Booking Initiation) */}
            <div className="search-section">
                <h2 style={{color: 'var(--primary-blue)', marginBottom: '20px'}}>Book Your Bus Ticket</h2>
                <div className="form-card">
                    <form onSubmit={handleSearchSubmit}>
                        
                         <div className="form-group">
                            <label htmlFor="departureCity">From:</label> 
                            <select
                                name="departureCity"
                                id="departureCity"
                                value={searchForm.departureCity}
                                onChange={handleChange}
                                required
                                disabled={availableDepartures.length === 0}
                            >
                                {availableDepartures.length === 0 && <option value="">Loading...</option>}
                                {availableDepartures.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>
                        
                        <div className="form-group">
                            <label htmlFor="destinationCity">To:</label> 
                            <select
                                name="destinationCity"
                                id="destinationCity"
                                value={searchForm.destinationCity}
                                onChange={handleChange}
                                required
                                disabled={availableDestinations.length === 0}
                            >
                                {/* Display loading/instruction messages */}
                                {availableDestinations.length === 0 && availableDepartures.length > 0 && <option value="">No routes from this city</option>}
                                {availableDestinations.length === 0 && availableDepartures.length === 0 && <option value="">Select Departure First</option>}
                                {availableDestinations.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="departureDate">Date:</label>
                            <input
                                type="date"
                                name="departureDate"
                                id="departureDate"
                                value={searchForm.departureDate}
                                onChange={handleChange}
                                min={new Date().toISOString().split('T')[0]}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="passengers">No. of Passengers:</label>
                            <input
                                type="number"
                                name="passengers"
                                id="passengers"
                                value={searchForm.passengers}
                                onChange={handleChange}
                                min="1"
                                max="50"
                                required
                            />
                        </div>

                        {error && <p className="error-message" style={{marginBottom: '20px'}}>{error}</p>}
                        
                        <button type="submit" className="primary-button pay-button" disabled={loading}>
                            {loading ? 'Searching...' : 'Search & Select Seat'}
                        </button>
                    </form>
                </div>
            </div>
            
            {/* 2. Payment Verification/Tracker Section */}
            <div className="tracker-section">
                <h3 style={{color: 'var(--accent-green)', marginBottom: '20px'}}>Payment Verification Tracker</h3>
                <div className="form-card">
                    <form onSubmit={handleTrackPayment}>
                        <div className="form-group">
                            <label htmlFor="trackerId">Enter Tracking Code (TS):</label> {/* <-- UPDATED LABEL */}
                            <input
                                type="text"
                                id="trackerId"
                                value={tsTrackerId} // <-- Use TS state variable
                                onChange={(e) => setTsTrackerId(e.target.value)}
                                placeholder="E.g., 37F0299F"
                                required
                            />
                        </div>
                        <button type="submit" className="primary-button" style={{width: '100%'}}>
                            Track Status
                        </button>
                    </form>
                    
                    {trackError && <p className="error-message" style={{marginTop: '15px'}}>{trackError}</p>}
                    
                    {trackResult && (
                        <div style={{marginTop: '20px', padding: '20px', borderTop: '2px solid #004d99', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                            <h3 style={{color: '#004d99', marginBottom: '20px', borderBottom: '1px solid #ddd', paddingBottom: '10px'}}>
                                🎫 Booking Details
                            </h3>
                            
                            {/* Tracking Code */}
                            <div style={{marginBottom: '15px'}}>
                                <p style={{fontWeight: 'bold', margin: '0 0 5px 0'}}>Tracking Code (TS):</p>
                                <span style={{fontWeight: 'bold', fontSize: '1.3rem', color: '#004d99', letterSpacing: '2px', backgroundColor: 'white', padding: '5px 10px', borderRadius: '4px', border: '2px solid #004d99'}}>
                                    {trackResult.tsNumber}
                                </span>
                            </div>

                            {/* Payment Status */}
                            <div style={{marginBottom: '15px'}}>
                                <p style={{fontWeight: 'bold', margin: '0 0 5px 0'}}>Payment Status:</p>
                                <span className={`status-${trackResult.status.toLowerCase()}`} style={{
                                    fontSize: '1.1rem', 
                                    fontWeight: 'bold',
                                    padding: '5px 12px',
                                    borderRadius: '20px',
                                    backgroundColor: trackResult.status === 'Paid' ? '#28a745' : trackResult.status === 'Processing' ? '#ffc107' : '#dc3545',
                                    color: 'white'
                                }}>
                                    {trackResult.status === 'Paid' ? '✅ CONFIRMED' : 
                                     trackResult.status === 'Processing' ? '⏳ PROCESSING' : 
                                     trackResult.status === 'Pending' ? '⏳ PENDING' : '❌ CANCELLED'}
                                </span>
                            </div>

                            {/* Passenger Information */}
                            <div style={{marginBottom: '20px'}}>
                                <h4 style={{color: '#28a745', marginBottom: '10px'}}>👤 Passenger Information</h4>
                                <div style={{backgroundColor: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd'}}>
                                    <p><strong>Name:</strong> {trackResult.passengerName}</p>
                                    <p><strong>Contact:</strong> {trackResult.contactNumber}</p>
                                    <p><strong>Email:</strong> {trackResult.email}</p>
                                </div>
                            </div>

                            {/* Trip Details */}
                            <div style={{marginBottom: '20px'}}>
                                <h4 style={{color: '#007bff', marginBottom: '10px'}}>🚌 Trip Details</h4>
                                <div style={{backgroundColor: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd'}}>
                                    <p><strong>Route:</strong> {trackResult.route}</p>
                                    <p><strong>Pickup Location:</strong> {trackResult.pickupLocation}</p>
                                    <p><strong>Drop Location:</strong> {trackResult.dropLocation}</p>
                                    <p><strong>Travel Date:</strong> {new Date(trackResult.travelDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                                    <p><strong>Departure Time:</strong> {trackResult.departureTime}</p>
                                    <p><strong>Seat Numbers:</strong> <span style={{color: '#28a745', fontWeight: 'bold'}}>{trackResult.selectedSeats.join(', ')}</span></p>
                                    <p><strong>Total Amount:</strong> <span style={{color: '#28a745', fontWeight: 'bold', fontSize: '1.1rem'}}>₹{trackResult.amount.toFixed(2)}</span></p>
                                </div>
                            </div>

                            {/* Bus Provider Contact */}
                            <div style={{marginBottom: '15px'}}>
                                <h4 style={{color: '#6f42c1', marginBottom: '10px'}}>📞 Bus Provider Contact</h4>
                                <div style={{backgroundColor: 'white', padding: '15px', borderRadius: '6px', border: '1px solid #ddd'}}>
                                    <p><strong>Company:</strong> {trackResult.busProvider.name}</p>
                                    <p><strong>Phone:</strong> <a href={`tel:${trackResult.busProvider.phone}`} style={{color: '#007bff', textDecoration: 'none'}}>{trackResult.busProvider.phone}</a></p>
                                    <p><strong>Email:</strong> <a href={`mailto:${trackResult.busProvider.email}`} style={{color: '#007bff', textDecoration: 'none'}}>{trackResult.busProvider.email}</a></p>
                                    <p><strong>Address:</strong> {trackResult.busProvider.address}</p>
                                </div>
                            </div>
                            
                            {/* Status-specific messages */}
                            {trackResult.status === 'Processing' && (
                                <div style={{backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '15px', marginTop: '15px'}}>
                                    <p style={{color: '#856404', fontSize: '0.9rem', margin: '0', fontWeight: 'bold'}}>
                                        ⏳ We are manually verifying your payment proof. Please allow up to 30 minutes.
                                    </p>
                                </div>
                            )}
                            
                            {trackResult.status === 'Paid' && (
                                <div style={{backgroundColor: '#d4edda', border: '1px solid #28a745', borderRadius: '6px', padding: '15px', marginTop: '15px'}}>
                                    <p style={{color: '#155724', fontSize: '0.9rem', margin: '0', fontWeight: 'bold'}}>
                                        ✅ Your ticket is confirmed! Please arrive 15 minutes before departure.
                                    </p>
                                </div>
                            )}

                            {trackResult.status === 'Pending' && (
                                <div style={{backgroundColor: '#fff3cd', border: '1px solid #ffc107', borderRadius: '6px', padding: '15px', marginTop: '15px'}}>
                                    <p style={{color: '#856404', fontSize: '0.9rem', margin: '0', fontWeight: 'bold'}}>
                                        ⏳ Please complete your payment and upload the proof to confirm your booking.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
};

export default HomePage;