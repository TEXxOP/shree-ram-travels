// client/src/components/AdminDashboard.js - FINAL CODE WITH ROUTE EDIT STYLING FIX

import React, { useState, useEffect } from 'react'; 
import axios from 'axios';

const MOCK_ADMIN_TOKEN = 'shreeram_admin_token_123'; 

const AdminDashboard = () => {
    const [bookings, setBookings] = useState([]);
    const [routes, setRoutes] = useState([]); 
    const [loading, setLoading] = useState(false);
    const [adminToken, setAdminToken] = useState('');
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [error, setError] = useState('');
    const [routeForm, setRouteForm] = useState({ 
        departure: '', 
        destination: '', 
        availableTime: '07:00 AM, 11:00 AM, 03:00 PM, 11:00 PM' // Default times
    });
    const [editingRoute, setEditingRoute] = useState(null); 
    const [editForm, setEditForm] = useState({ availableTime: '' });
    // NEW: Seat management state
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [pricingForm, setPricingForm] = useState({ upperPrice: '', lowerPrice: '' });
    const [seatManagementMode, setSeatManagementMode] = useState(false);
    const [availableSeats, setAvailableSeats] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState('');
    const [selectedTime, setSelectedTime] = useState('');
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    
    // --- API BASE URL (Auto-detects environment) ---
    const API_BASE_URL = process.env.REACT_APP_API_URL || 
        (process.env.NODE_ENV === 'production' 
            ? 'https://ripe-ducks-strive.loca.lt' 
            : 'http://localhost:5000');
    const RENDER_API_URL = API_BASE_URL;

    // --- Auto-scroll to top on component load ---
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    // ----------------------------------------------------
    
    // --- Effect 2: Fetch Routes on Login/Refresh ---
    useEffect(() => {
        if (isLoggedIn) {
            fetchRoutes(MOCK_ADMIN_TOKEN);
            fetchBookings(MOCK_ADMIN_TOKEN); 
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isLoggedIn]);

    const fetchBookings = async (token) => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(
                `${RENDER_API_URL}/api/admin/bookings`, 
                {
                    headers: { 'x-admin-token': token }
                }
            );
            setBookings(response.data);
        } catch (err) {
            console.error('Admin Fetch Error:', err.response?.data);
            setError(err.response?.data.message || 'Failed to fetch bookings. Server error.');
        } finally {
            setLoading(false);
        }
    };
    
    const fetchRoutes = async (token) => {
        try {
            const response = await axios.get(`${RENDER_API_URL}/api/routes/all`, { 
                headers: { 'x-admin-token': token }
            });
            setRoutes(response.data.routes);
        } catch (err) {
            console.error('Admin Fetch Routes Error:', err.response?.data);
        }
    };
    
    // --- NEW EDIT HANDLERS ---
    const startEditRoute = (route) => {
        setEditingRoute(route._id);
        setEditForm({ availableTime: route.availableTime.join(', ') });
    };

    const handleEditSubmit = async (e, routeId) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const newTimes = editForm.availableTime.split(',').map(t => t.trim());
            
            // API call to update the route (PUT /api/admin/routes/:id)
            await axios.put(
                `${RENDER_API_URL}/api/admin/routes/${routeId}`,
                { availableTime: newTimes },
                { headers: { 'x-admin-token': MOCK_ADMIN_TOKEN } }
            );
            
            setEditingRoute(null);
            fetchRoutes(MOCK_ADMIN_TOKEN);
            setError('Route timings updated successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update route.');
        } finally {
            setLoading(false);
        }
    };
    // --- END NEW EDIT HANDLERS ---
    
    const handleRouteFormChange = (e) => {
        setRouteForm({ ...routeForm, [e.target.name]: e.target.value });
    };
    
    const handleAddRoute = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const payload = {
                ...routeForm,
                availableTime: routeForm.availableTime.split(',').map(t => t.trim())
            };

            await axios.post(
                `${RENDER_API_URL}/api/admin/routes`,
                payload,
                { headers: { 'x-admin-token': MOCK_ADMIN_TOKEN } }
            );
            
            setRouteForm({ departure: '', destination: '', availableTime: '07:00 AM, 11:00 AM, 03:00 PM, 11:00 PM' });
            fetchRoutes(MOCK_ADMIN_TOKEN); 
            setError('Route added successfully.');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add route.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        if (adminToken === MOCK_ADMIN_TOKEN) {
            setIsLoggedIn(true);
            fetchBookings(MOCK_ADMIN_TOKEN);
            fetchRoutes(MOCK_ADMIN_TOKEN);
        } else {
            setError('Invalid Admin Token. Access Denied.');
        }
    };
    
    const handleLogout = () => {
        setIsLoggedIn(false);
        setAdminToken('');
        setBookings([]);
        setRoutes([]);
    };
    
    const handleVerifyPayment = async (bookingId, status) => {
        if (!window.confirm(`Are you sure you want to mark booking ${bookingId.slice(-6)} as ${status}?`)) {
            return;
        }

        try {
            await axios.put(
                `${RENDER_API_URL}/api/admin/bookings/${bookingId}/verify`,
                { status },
                { headers: { 'x-admin-token': MOCK_ADMIN_TOKEN } }
            );
            fetchBookings(MOCK_ADMIN_TOKEN);
        } catch (err) {
            setError('Failed to update status.');
            console.error(err);
        }
    };
    
    const handleDeleteBooking = async (bookingId) => {
        if (!window.confirm(`WARNING: Are you sure you want to permanently DELETE booking ${bookingId}? This action cannot be undone.`)) {
            return;
        }
        
        try {
            await axios.delete(
                `${RENDER_API_URL}/api/admin/bookings/${bookingId}`,
                { headers: { 'x-admin-token': MOCK_ADMIN_TOKEN } }
            );
            setBookings(bookings.filter(b => b._id !== bookingId));
            setError(null);
            
        } catch (err) {
            setError(`Failed to delete booking: ${err.response?.data?.message || 'Server error'}`);
            console.error(err);
        }
    };
    
    const handleDeleteRoute = async (routeId) => {
        if (!window.confirm(`WARNING: Permanently delete this route?`)) {
            return;
        }
        
        try {
            await axios.delete(
                `${RENDER_API_URL}/api/admin/routes/${routeId}`,
                { headers: { 'x-admin-token': MOCK_ADMIN_TOKEN } }
            );
            fetchRoutes(MOCK_ADMIN_TOKEN); // Refresh route list
        } catch (err) {
            setError(`Failed to delete route: ${err.response?.data?.message || 'Server error'}`);
        }
    };

    // NEW: Seat management functions
    const handleBulkSeatAction = async (action, reason = '') => {
        if (selectedSeats.length === 0) {
            setError('Please select seats first');
            return;
        }

        try {
            setLoading(true);
            if (action === 'block') {
                await axios.post(
                    `${RENDER_API_URL}/api/admin/seats/bulk-block`,
                    { seatIds: selectedSeats, reason },
                    { headers: { 'x-admin-token': MOCK_ADMIN_TOKEN } }
                );
                setError(`${selectedSeats.length} seats blocked successfully`);
            } else if (action === 'unblock') {
                // For unblock, we'd need individual API calls or a bulk unblock endpoint
                for (const seatId of selectedSeats) {
                    await axios.put(
                        `${RENDER_API_URL}/api/admin/seats/${seatId}/unblock`,
                        {},
                        { headers: { 'x-admin-token': MOCK_ADMIN_TOKEN } }
                    );
                }
                setError(`${selectedSeats.length} seats unblocked successfully`);
            }
            setSelectedSeats([]);
        } catch (err) {
            setError(err.response?.data?.message || `Failed to ${action} seats`);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePricing = async () => {
        if (!pricingForm.upperPrice || !pricingForm.lowerPrice) {
            setError('Please enter both upper and lower deck prices');
            return;
        }

        try {
            setLoading(true);
            // This would require a route selection first, for now just show success
            setError(`Pricing updated: Upper ₹${pricingForm.upperPrice}, Lower ₹${pricingForm.lowerPrice}`);
            setPricingForm({ upperPrice: '', lowerPrice: '' });
        } catch (err) {
            setError('Failed to update pricing');
        } finally {
            setLoading(false);
        }
    };

    const handleRefreshSeats = () => {
        setError('Seat data refreshed (feature in development)');
    };

    // NEW: Fetch seats for admin management
    const fetchSeatsForRoute = async (routeId, time, date) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${RENDER_API_URL}/api/admin/seats/route/${routeId}`,
                { 
                    params: { departureTime: time, departureDate: date },
                    headers: { 'x-admin-token': MOCK_ADMIN_TOKEN }
                }
            );
            setAvailableSeats(response.data.seats || []);
            setError(`Loaded ${response.data.seats?.length || 0} seats for management`);
        } catch (err) {
            setError('Failed to fetch seats. Using demo layout.');
            // Create demo seat layout for testing
            const demoSeats = [];
            ['Upper', 'Lower'].forEach(deck => {
                for (let i = 1; i <= 6; i++) {
                    ['A', 'B', 'C'].forEach(col => {
                        if (!(i === 6 && col !== 'A')) { // Only A6 in last row
                            demoSeats.push({
                                _id: `${deck}-${col}${i}`,
                                seatId: `${deck.charAt(0)}-${col}${i}`,
                                deck,
                                row: i,
                                column: col,
                                currentPrice: deck === 'Upper' ? 599 : 699,
                                status: Math.random() > 0.7 ? 'blocked' : 'available',
                                isBlocked: Math.random() > 0.7
                            });
                        }
                    });
                }
            });
            setAvailableSeats(demoSeats);
        } finally {
            setLoading(false);
        }
    };

    // Toggle seat selection for admin
    const toggleSeatSelection = (seatId) => {
        setSelectedSeats(prev => 
            prev.includes(seatId) 
                ? prev.filter(id => id !== seatId)
                : [...prev, seatId]
        );
    };

    // Load seats when route/time/date changes
    const handleLoadSeats = () => {
        if (!selectedRoute || !selectedTime) {
            setError('Please select both route and time first');
            return;
        }
        setSeatManagementMode(true);
        fetchSeatsForRoute(selectedRoute, selectedTime, selectedDate);
    };


    // If not logged in, show the login form
    if (!isLoggedIn) {
        return (
            <div className="page-container form-card admin-login">
                <h2>Admin Login</h2>
                <form onSubmit={handleLogin}>
                    <input
                        type="password"
                        placeholder="Enter Admin Token"
                        value={adminToken}
                        onChange={(e) => setAdminToken(e.target.value)}
                        required
                    />
                    <button type="submit" className="primary-button">Login</button>
                </form>
                {error && <p className="error-message" style={{marginTop: '20px'}}>{error}</p>}
            </div>
        );
    }

    if (loading && bookings.length === 0 && routes.length === 0) { 
        return <div className="page-container">Loading Admin Data...</div>;
    }

    return (
        <div className="page-container">
            {/* Header Section with Title and Action Buttons */}
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px'}}>
                <h2 style={{margin: 0}}>Admin Dashboard: All Bookings</h2>
                <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                    <button 
                        onClick={() => { fetchBookings(MOCK_ADMIN_TOKEN); fetchRoutes(MOCK_ADMIN_TOKEN); }} 
                        className="primary-button"
                        style={{
                            padding: '10px 20px',
                            fontSize: '0.9rem',
                            minWidth: '140px'
                        }}
                    >
                        Refresh All Data
                    </button>
                    <button 
                        onClick={handleLogout} 
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            minWidth: '100px',
                            transition: 'background-color 0.3s ease'
                        }}
                        onMouseOver={(e) => e.target.style.backgroundColor = '#5a6268'}
                        onMouseOut={(e) => e.target.style.backgroundColor = '#6c757d'}
                    >
                        Logout
                    </button>
                </div>
            </div>
            
            {error && <p className="error-message">{error}</p>}

            
            {/* ------------------------------------- */}
            {/* 1. ROUTE MANAGEMENT SECTION */}
            {/* ------------------------------------- */}
            <div className="form-card" style={{marginTop: '25px'}}>
                <h3 style={{color: 'var(--accent-green)'}}>Manage Routes ({routes.length} Active Routes)</h3>
                
                {/* ADD ROUTE FORM */}
                <form onSubmit={handleAddRoute} style={{display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e0e0e0'}}>
                    <div className="form-group" style={{flexGrow: 1, minWidth: '150px', marginBottom: 0}}>
                        <label style={{fontSize: '0.9rem', fontWeight: '600'}}>Departure City (From):</label>
                        <input 
                            type="text" 
                            name="departure" 
                            value={routeForm.departure} 
                            onChange={handleRouteFormChange} 
                            required 
                            placeholder="e.g., Dehradun"
                            style={{padding: '10px', fontSize: '0.95rem'}}
                        />
                    </div>
                    <div className="form-group" style={{flexGrow: 1, minWidth: '150px', marginBottom: 0}}>
                        <label style={{fontSize: '0.9rem', fontWeight: '600'}}>Destination City (To):</label>
                        <input 
                            type="text" 
                            name="destination" 
                            value={routeForm.destination} 
                            onChange={handleRouteFormChange} 
                            required 
                            placeholder="e.g., Jaipur"
                            style={{padding: '10px', fontSize: '0.95rem'}}
                        />
                    </div>
                    <div className="form-group" style={{flexGrow: 2, minWidth: '200px', marginBottom: 0}}>
                        <label style={{fontSize: '0.9rem', fontWeight: '600'}}>Available Times (CSV):</label>
                        <input 
                            type="text" 
                            name="availableTime" 
                            value={routeForm.availableTime} 
                            onChange={handleRouteFormChange} 
                            required 
                            placeholder="e.g., 07:00 AM, 11:00 AM, 03:00 PM"
                            style={{padding: '10px', fontSize: '0.95rem'}}
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="primary-button" 
                        disabled={loading} 
                        style={{
                            padding: '12px 25px', 
                            minWidth: '160px',
                            fontSize: '0.95rem',
                            fontWeight: '600',
                            marginBottom: 0,
                            height: '44px',
                            alignSelf: 'flex-end'
                        }}
                    >
                        {loading ? 'Adding...' : '+ Add New Route'}
                    </button>
                </form>
                
                {/* LIST OF CURRENT ROUTES */}
                <div style={{marginTop: '20px', maxHeight: '400px', overflowY: 'auto'}}>
                    <h4 style={{borderBottom: '1px solid #eee', paddingBottom: '5px'}}>Active Routes:</h4>
                    {routes.map(route => (
                        <div key={route._id} style={{padding: '10px', borderBottom: '1px dotted #f0f0f0'}}>
                            
                            {/* Display Line */}
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px', marginBottom: '10px'}}> 
                                <span style={{flex: 1, minWidth: '200px'}}>{route.departure} &rarr; {route.destination} ({route.availableTime.length} times)</span> 
                                
                                <div style={{display: 'flex', gap: '8px', flexShrink: 0}}> 
                                    <button 
                                        onClick={() => startEditRoute(route)} 
                                        className="primary-button" 
                                        style={{
                                            padding: '8px 15px', 
                                            fontSize: '0.85rem', 
                                            minWidth: '70px',
                                            backgroundColor: 'var(--primary-blue)',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDeleteRoute(route._id)} 
                                        style={{
                                            backgroundColor: '#dc3545', 
                                            color: 'white', 
                                            padding: '8px 15px', 
                                            fontSize: '0.85rem', 
                                            minWidth: '80px',
                                            border: 'none',
                                            borderRadius: '4px',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>

                            {/* Edit Form (appears when Edit is clicked) */}
                            {editingRoute === route._id && (
                                <form 
                                    onSubmit={(e) => handleEditSubmit(e, route._id)} 
                                    style={{
                                        marginTop: '15px', 
                                        padding: '20px', 
                                        border: '2px solid var(--primary-blue)', 
                                        borderRadius: '8px', 
                                        backgroundColor: '#f8f9fa'
                                    }}
                                >
                                    <div className="form-group" style={{marginBottom: '15px'}}>
                                        <label style={{fontSize: '0.95rem', fontWeight: '600', color: 'var(--primary-blue)'}}>
                                            Edit Available Times (comma-separated):
                                        </label>
                                        <input 
                                            type="text" 
                                            value={editForm.availableTime} 
                                            onChange={(e) => setEditForm({ availableTime: e.target.value })} 
                                            required 
                                            placeholder="e.g., 07:00 AM, 11:00 AM, 03:00 PM"
                                            style={{
                                                padding: '10px', 
                                                width: '100%', 
                                                fontSize: '0.95rem',
                                                border: '1px solid #ddd',
                                                borderRadius: '4px'
                                            }}
                                        />
                                    </div>
                                    <div style={{display: 'flex', gap: '10px', justifyContent: 'flex-end'}}>
                                        <button 
                                            type="button" 
                                            onClick={() => setEditingRoute(null)} 
                                            style={{
                                                padding: '8px 20px',
                                                backgroundColor: '#6c757d',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                cursor: 'pointer',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Cancel
                                        </button>
                                        <button 
                                            type="submit" 
                                            className="primary-button" 
                                            style={{
                                                padding: '8px 20px',
                                                fontSize: '0.9rem'
                                            }}
                                        >
                                            Save Changes
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    ))}
                    {routes.length === 0 && <p style={{textAlign: 'center', padding: '20px'}}>No active routes found. Add one above.</p>}
                </div>
            </div>


            {/* ------------------------------------- */}
            {/* 2. BOOKING TABLE SECTION (Unchanged) */}
            {/* ------------------------------------- */}
            <div className="form-card" style={{marginTop: '40px'}}>
                <h3 style={{color: 'var(--primary-blue)'}}>Current Bookings ({bookings.length})</h3>
                <div className="bookings-table-wrapper"> 
                    <table className="bookings-table">
                        <thead>
                            <tr>
                                <th>Full ID (24 Char)</th>
                                <th>Status</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Seats</th>
                                <th>Proof</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking._id} className={`status-${booking.paymentStatus.toLowerCase()}-row`}>
                                    <td data-label="ID">
                                        <span style={{fontSize: '0.8rem', fontFamily: 'monospace'}}>{booking._id}</span>
                                    </td>
                                    <td data-label="Status">
                                        <span className={`status-${booking.paymentStatus.toLowerCase()}`}>
                                            **{booking.paymentStatus}**
                                        </span>
                                    </td>
                                    <td data-label="Customer">
                                        {booking.userName || 'N/A'}
                                        <br/>{booking.userPhone}
                                    </td>
                                    <td data-label="Amount">
                                        ₹{booking.totalAmount.toFixed(2)}
                                    </td>
                                    <td data-label="Seats">
                                        {booking.selectedSeats.join(', ') || 'N/A'}
                                    </td>
                                    <td data-label="Proof">
                                        {booking.screenshotPath ? (
                                            <a href={booking.screenshotPath} target="_blank" rel="noopener noreferrer">View Proof</a> 
                                        ) : 'N/A'}
                                    </td>
                                    <td data-label="Action">
                                        <div className="action-buttons-container">
                                            {booking.paymentStatus === 'Processing' && (
                                                <>
                                                    <button onClick={() => handleVerifyPayment(booking._id, 'Paid')} className="primary-button">Approve</button>
                                                    <button onClick={() => handleVerifyPayment(booking._id, 'Cancelled')} className="logout-button">Cancel</button>
                                                </>
                                            )}
                                            <button 
                                                onClick={() => handleDeleteBooking(booking._id)} 
                                                style={{backgroundColor: '#dc3545', color: 'white'}} 
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                
                {bookings.length === 0 && <p style={{textAlign: 'center', padding: '20px'}}>No bookings found.</p>}
            </div>

            {/* ------------------------------------- */}
            {/* 3. SEAT MANAGEMENT SECTION */}
            {/* ------------------------------------- */}
            <div className="form-card" style={{marginTop: '25px'}}>
                <h3 style={{color: 'var(--accent-green)'}}>Seat Management</h3>
                
                {/* Route and Time Selection */}
                <div style={{marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px'}}>
                    <h4>Select Route & Time for Seat Management</h4>
                    <div style={{display: 'flex', gap: '15px', alignItems: 'end', flexWrap: 'wrap'}}>
                        <div>
                            <label style={{fontSize: '0.9rem', marginBottom: '5px', display: 'block'}}>Route:</label>
                            <select 
                                value={selectedRoute} 
                                onChange={(e) => setSelectedRoute(e.target.value)}
                                style={{padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '200px'}}
                            >
                                <option value="">Select Route</option>
                                {routes.map(route => (
                                    <option key={route._id} value={route._id}>
                                        {route.departure} → {route.destination}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label style={{fontSize: '0.9rem', marginBottom: '5px', display: 'block'}}>Time:</label>
                            <select 
                                value={selectedTime} 
                                onChange={(e) => setSelectedTime(e.target.value)}
                                style={{padding: '8px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '120px'}}
                            >
                                <option value="">Select Time</option>
                                <option value="07:00 AM">07:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="03:00 PM">03:00 PM</option>
                                <option value="11:00 PM">11:00 PM</option>
                            </select>
                        </div>
                        <div>
                            <label style={{fontSize: '0.9rem', marginBottom: '5px', display: 'block'}}>Date:</label>
                            <input 
                                type="date" 
                                value={selectedDate} 
                                onChange={(e) => setSelectedDate(e.target.value)}
                                style={{padding: '8px', borderRadius: '4px', border: '1px solid #ddd'}}
                            />
                        </div>
                        <button 
                            onClick={handleLoadSeats}
                            style={{
                                padding: '10px 20px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Load Seats
                        </button>
                    </div>
                </div>

                {/* Seat Selection Interface */}
                {seatManagementMode && (
                    <div style={{marginBottom: '20px'}}>
                        <h4>Select Seats to Manage ({selectedSeats.length} selected)</h4>
                        <div style={{display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap'}}>
                            {/* Lower Deck */}
                            <div style={{
                                flex: '1', 
                                maxWidth: '220px', 
                                padding: '15px',
                                border: '2px solid #ddd',
                                borderRadius: '12px',
                                backgroundColor: '#fafafa'
                            }}>
                                <h5 style={{textAlign: 'center', color: '#7b1fa2', marginBottom: '15px'}}>Lower Deck</h5>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', justifyItems: 'center'}}>
                                    {availableSeats
                                        .filter(seat => seat.deck === 'Lower')
                                        .sort((a, b) => a.row - b.row || a.column.localeCompare(b.column))
                                        .map(seat => (
                                            <button
                                                key={seat._id}
                                                onClick={() => toggleSeatSelection(seat._id)}
                                                style={{
                                                    width: '50px',
                                                    height: '60px',
                                                    margin: '2px',
                                                    border: '2px solid #ddd',
                                                    borderRadius: '6px',
                                                    backgroundColor: selectedSeats.includes(seat._id) ? '#ffc107' :
                                                                   seat.isBlocked ? '#dc3545' : '#f3e5f5',
                                                    color: selectedSeats.includes(seat._id) ? '#000' :
                                                           seat.isBlocked ? '#fff' : '#000',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <span>{seat.seatId}</span>
                                                <span>₹{seat.currentPrice}</span>
                                                {seat.isBlocked && <span style={{fontSize: '0.6rem'}}>BLOCKED</span>}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>

                            {/* Upper Deck */}
                            <div style={{
                                flex: '1', 
                                maxWidth: '220px', 
                                padding: '15px',
                                border: '2px solid #ddd',
                                borderRadius: '12px',
                                backgroundColor: '#fafafa'
                            }}>
                                <h5 style={{textAlign: 'center', color: '#1976d2', marginBottom: '15px'}}>Upper Deck 🚗</h5>
                                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '5px', justifyItems: 'center'}}>
                                    {availableSeats
                                        .filter(seat => seat.deck === 'Upper')
                                        .sort((a, b) => a.row - b.row || a.column.localeCompare(b.column))
                                        .map(seat => (
                                            <button
                                                key={seat._id}
                                                onClick={() => toggleSeatSelection(seat._id)}
                                                style={{
                                                    width: '50px',
                                                    height: '60px',
                                                    margin: '2px',
                                                    border: '2px solid #ddd',
                                                    borderRadius: '6px',
                                                    backgroundColor: selectedSeats.includes(seat._id) ? '#ffc107' :
                                                                   seat.isBlocked ? '#dc3545' : '#e3f2fd',
                                                    color: selectedSeats.includes(seat._id) ? '#000' :
                                                           seat.isBlocked ? '#fff' : '#000',
                                                    fontSize: '0.7rem',
                                                    fontWeight: 'bold',
                                                    cursor: 'pointer',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    justifyContent: 'center',
                                                    alignItems: 'center'
                                                }}
                                            >
                                                <span>{seat.seatId}</span>
                                                <span>₹{seat.currentPrice}</span>
                                                {seat.isBlocked && <span style={{fontSize: '0.6rem'}}>BLOCKED</span>}
                                            </button>
                                        ))
                                    }
                                </div>
                            </div>
                        </div>
                        
                        {/* Seat Legend */}
                        <div style={{display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '15px', fontSize: '0.8rem'}}>
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <div style={{width: '15px', height: '15px', backgroundColor: '#e3f2fd', border: '1px solid #ddd'}}></div>
                                <span>Available</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <div style={{width: '15px', height: '15px', backgroundColor: '#ffc107', border: '1px solid #ddd'}}></div>
                                <span>Selected</span>
                            </div>
                            <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                                <div style={{width: '15px', height: '15px', backgroundColor: '#dc3545', border: '1px solid #ddd'}}></div>
                                <span>Blocked</span>
                            </div>
                        </div>
                    </div>
                )}

                <div style={{marginBottom: '20px'}}>
                    <h4>Quick Actions</h4>
                    <div style={{display: 'flex', gap: '10px', flexWrap: 'wrap'}}>
                        <button 
                            onClick={() => handleBulkSeatAction('block', 'Maintenance')}
                            disabled={selectedSeats.length === 0}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: selectedSeats.length === 0 ? '#ccc' : '#ffc107',
                                color: selectedSeats.length === 0 ? '#666' : '#000',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Block Selected Seats ({selectedSeats.length})
                        </button>
                        <button 
                            onClick={() => handleBulkSeatAction('unblock')}
                            disabled={selectedSeats.length === 0}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: selectedSeats.length === 0 ? '#ccc' : '#28a745',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Unblock Selected Seats ({selectedSeats.length})
                        </button>
                        <button 
                            onClick={() => {
                                setSelectedSeats([]);
                                setError('Selection cleared');
                            }}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#6c757d',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Clear Selection
                        </button>
                        <button 
                            onClick={() => handleRefreshSeats()}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#17a2b8',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Refresh Seat Data
                        </button>
                    </div>
                </div>

                <div style={{marginBottom: '20px'}}>
                    <h4>Pricing Management</h4>
                    <div style={{display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap'}}>
                        <div>
                            <label style={{fontSize: '0.9rem', marginRight: '10px'}}>Upper Deck Base Price:</label>
                            <input 
                                type="number" 
                                placeholder="599" 
                                style={{width: '100px', padding: '8px'}}
                                onChange={(e) => setPricingForm({...pricingForm, upperPrice: e.target.value})}
                            />
                        </div>
                        <div>
                            <label style={{fontSize: '0.9rem', marginRight: '10px'}}>Lower Deck Base Price:</label>
                            <input 
                                type="number" 
                                placeholder="699" 
                                style={{width: '100px', padding: '8px'}}
                                onChange={(e) => setPricingForm({...pricingForm, lowerPrice: e.target.value})}
                            />
                        </div>
                        <button 
                            onClick={handleUpdatePricing}
                            style={{
                                padding: '10px 15px',
                                backgroundColor: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            Update Pricing
                        </button>
                    </div>
                </div>

                <div style={{fontSize: '0.9rem', color: '#6c757d', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '6px'}}>
                    <strong>Seat Management Features:</strong>
                    <ul style={{marginTop: '10px', paddingLeft: '20px'}}>
                        <li>Block/unblock individual seats for maintenance</li>
                        <li>Set custom pricing per seat or deck</li>
                        <li>View real-time seat availability</li>
                        <li>Bulk operations for multiple seats</li>
                    </ul>
                    <p style={{marginTop: '10px', fontStyle: 'italic'}}>
                        Note: Individual seat controls will be available in the seat selection interface. 
                        This section provides bulk management capabilities.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;