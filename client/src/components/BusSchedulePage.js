// client/src/components/BusSchedulePage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BusSchedulePage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [availableBuses, setAvailableBuses] = useState([]);
    
    // Trip data from localStorage
    const bookingId = localStorage.getItem('currentBookingId');
    // const userToken = localStorage.getItem('userToken'); // Not used in this component
    const departureCity = localStorage.getItem('lastDepartureCity');
    const destinationCity = localStorage.getItem('lastDestination');
    const departureDate = localStorage.getItem('lastDepartureDate');
    
    // API BASE URL (Auto-detects environment)
    const API_BASE_URL = process.env.REACT_APP_API_URL || 
        (process.env.NODE_ENV === 'production' 
            ? 'https://shree-ram-travels-api.onrender.com' 
            : 'http://localhost:5000');
    const RENDER_API_URL = API_BASE_URL;

    // Fetch schedule on load
    useEffect(() => {
        window.scrollTo(0, 0);
        
        if (!bookingId || !departureCity || !destinationCity || !departureDate) {
            setError('Error: Missing trip details. Please start a new search.');
            setLoading(false);
            return;
        }

        const fetchSchedule = async () => {
            try {
                // Fetch the available times (routes) based on the selected departure/destination
                const routeResponse = await axios.get(`${RENDER_API_URL}/api/routes/all`);
                
                const foundRoute = routeResponse.data.routes.find(r => 
                    r.departure === departureCity && r.destination === destinationCity
                );

                if (foundRoute && foundRoute.availableTime.length > 0) {
                    // NOTE: In a real app, this would be a search API checking inventory.
                    // Here, we simulate multiple "buses" from the available times.
                    const buses = foundRoute.availableTime.map((time, index) => ({
                        time: time,
                        price: 850 + (index * 50), // Mock dynamic pricing
                        seatsAvailable: 35 - (index * 2) // Mock seats
                    }));
                    setAvailableBuses(buses);
                } else {
                    setAvailableBuses([]);
                    setError('No buses found for this route and date.');
                }

            } catch (err) {
                console.error('Error fetching schedule:', err);
                setError('Could not fetch bus schedules. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [bookingId, departureCity, destinationCity, departureDate]);

    // Action when user selects a bus (time)
    const handleBusSelect = async (busTime) => {
        setLoading(true);
        setError('');
        
        try {
            // Update the initial booking with the actual selected departureTime
            // This re-uses the PUT route for updating seats/amount, but just sends the time for now.
            // NOTE: We need a dedicated API route for just updating time, but for simplicity, 
            // we will simulate the update needed for the next step.
            
            // Reusing the PUT /api/bookings/:id/seats endpoint by sending dummy data 
            // is not ideal, so we will simplify: We just save the time to storage and navigate.
            
            // For now, we update localStorage and navigate. The seat selection page 
            // should fetch its occupied seats correctly using this time.
            localStorage.setItem('finalDepartureTime', busTime); 

            // Redirect to seat selection page
            navigate('/select-seat');

        } catch (err) {
            console.error('Error selecting bus:', err);
            setError('Failed to select bus. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="page-container"><h2>Loading Bus Schedules...</h2></div>;
    }

    if (error) {
        return <div className="page-container"><p className="error-message">{error}</p></div>;
    }
    
    const displayDate = new Date(departureDate).toLocaleDateString();

    return (
        <div className="page-container">
            <h2>Available Buses</h2>
            <h3 style={{color: 'var(--primary-blue)', marginBottom: '20px'}}>
                {departureCity} &rarr; {destinationCity} on {displayDate}
            </h3>

            {availableBuses.length === 0 ? (
                <p className="error-message">No buses found for this route on the selected date.</p>
            ) : (
                <div className="bus-schedule-list">
                    {availableBuses.map((bus, index) => (
                        <div key={index} className="form-card bus-entry" style={{
                            display: 'flex', 
                            justifyContent: 'space-between', 
                            alignItems: 'center',
                            padding: '20px',
                            marginBottom: '15px'
                        }}>
                            <div>
                                <span style={{fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-green)'}}>
                                    {bus.time}
                                </span>
                                <p style={{margin: '5px 0 0 0', fontSize: '0.9rem', color: 'var(--text-dark)'}}>
                                    Available Seats: {bus.seatsAvailable}
                                </p>
                            </div>
                            <div style={{textAlign: 'right'}}>
                                <span style={{fontSize: '1.2rem', fontWeight: 'bold', display: 'block'}}>
                                    ₹{bus.price.toFixed(2)}
                                </span>
                                <button 
                                    onClick={() => handleBusSelect(bus.time)}
                                    className="primary-button" 
                                    style={{padding: '8px 15px', marginTop: '10px'}}
                                    disabled={bus.seatsAvailable === 0}
                                >
                                    {bus.seatsAvailable > 0 ? 'Select Bus' : 'Sold Out'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BusSchedulePage;