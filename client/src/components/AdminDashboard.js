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
    
    // --- API BASE URL (Auto-detects environment) ---
    const API_BASE_URL = process.env.REACT_APP_API_URL || 
        (process.env.NODE_ENV === 'production' 
            ? 'https://shree-ram-travels-api.onrender.com' 
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
        </div>
    );
};

export default AdminDashboard;