// client/src/components/SeatSelectionPage.js - FINAL WITH DYNAMIC OCCUPIED SEATS RESTORED

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// --- CONFIGURATION (Auto-detects environment) ---
const API_BASE_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
        ? 'https://shree-ram-travels-api.onrender.com' 
        : 'http://localhost:5000');
const RENDER_API_URL = API_BASE_URL;
const LOWER_PRICE = 699.00;
const UPPER_PRICE = 599.00;
// const TOTAL_SEATS = 40; // Not used - calculated from layout
// ---------------------

// --- ADVANCED SEAT LAYOUT STRUCTURE ---
const SEAT_MAP_LAYOUT = {
    // Upper Deck (20 seats, 4 rows of 4 + 4 singles)
    UpperDeck: [
        // Row 1: Single | Aisle | Pair | Pair | Steering Wheel/Gap
        ['U-A1', null, 'U-C1', 'U-D1', 'WHEEL'], 
        // Row 2: Single | Aisle | Pair | Pair
        ['U-A2', null, 'U-C2', 'U-D2', null], 
        ['U-A3', null, 'U-C3', 'U-D3', null], 
        ['U-A4', null, 'U-C4', 'U-D4', null],
        ['U-A5', null, 'U-C5', 'U-D5', null],
        ['U-A6', null, 'U-C6', 'U-D6', null],
        // Back Row: Pair | Pair (A, B, C, D)
        ['U-A7', 'U-B7', 'U-C7', 'U-D7', null],
    ],
    // Lower Deck (20 seats)
    LowerDeck: [
        // Row 1: Single | Aisle | Pair | Pair | Steering Wheel/Gap
        ['L-A1', null, 'L-C1', 'L-D1', 'WHEEL'], 
        ['L-A2', null, 'L-C2', 'L-D2', null], 
        ['L-A3', null, 'L-C3', 'L-D3', null], 
        ['L-A4', null, 'L-C4', 'L-D4', null],
        ['L-A5', null, 'L-C5', 'L-D5', null],
        ['L-A6', null, 'L-C6', 'L-D6', null],
        // Back Row: Pair | Pair 
        ['L-A7', 'L-B7', 'L-C7', 'L-D7', null],
    ],
};
// ----------------------------------------------------


// --- SEAT COMPONENT ---
const Seat = ({ id, price, status, onClick, deck }) => {
    let className = 'seat-button';
    if (status === 'occupied') className += ' occupied';
    else if (status === 'selected') className += ' selected';
    
    // Add specific style to single seats (A-column) for the visual effect
    const isSingle = id && id.includes('-A') && !id.includes('-B');

    return (
        <button
            key={id}
            className={className}
            onClick={onClick}
            disabled={status === 'occupied'}
            style={{
                width: isSingle ? '40px' : '60px', // Smaller width for single seats
                height: '60px',
                margin: '5px',
                flexShrink: 0,
                backgroundColor: status === 'occupied' ? '#dc3545' : status === 'selected' ? 'var(--accent-green)' : deck === 'UpperDeck' ? '#cfe2ff' : '#d1f0d8' // Different color per deck
            }}
        >
            <span style={{fontSize: '0.7rem'}}>{id.replace(/-/g, '')}</span>
            <span style={{fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginTop: '3px'}}>
                {price ? `₹${price.toFixed(0)}` : ''}
            </span>
            {status === 'occupied' && <span style={{fontSize: '0.7rem'}}>Sold</span>}
        </button>
    );
};
// -----------------------


const SeatSelectionPage = () => {
    const navigate = useNavigate();
    const [selectedSeats, setSelectedSeats] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [initialPassengers, setInitialPassengers] = useState(1);
    // FIX 1: Initialize occupiedSeats to an empty array, replacing mock data
    const [occupiedSeats, setOccupiedSeats] = useState([]); 
    const [tripDetails, setTripDetails] = useState(null); 
    // FIX 2: Initialize dataLoaded to false
    const [dataLoaded, setDataLoaded] = useState(false); 

    const totalAmount = selectedSeats.reduce((sum, seatId) => {
        const price = seatId.startsWith('U-') ? UPPER_PRICE : LOWER_PRICE;
        return sum + price;
    }, 0);

    const bookingId = localStorage.getItem('currentBookingId');
    const userToken = localStorage.getItem('userToken');

    // --- RESTORED LOGIC: Fetch Occupied Seats ---
    const fetchOccupiedSeats = async (destination, date, time) => {
        setLoading(true);
        try {
            // API call to fetch seats that are PAID for this specific trip (date + time)
            const response = await axios.get(`${RENDER_API_URL}/api/seats/occupied`, {
                params: { destination, date, time }
            });
            // Set state with dynamically fetched occupied seats
            setOccupiedSeats(response.data.occupiedSeats); 
            setError(null); 
        } catch (err) {
            console.error('Error fetching occupied seats:', err);
            setError('Could not retrieve occupied seat status. Proceed with caution.'); 
        } finally {
            setLoading(false);
            setDataLoaded(true);
        }
    };
    // ----------------------------------------------------

    // FIX 3: Corrected useEffect dependencies and logic to prevent infinite loop/crash
    useEffect(() => {
        const storedPassengers = parseInt(localStorage.getItem('initialPassengers'));
        const storedDeparture = localStorage.getItem('lastDepartureCity');
        const storedDestination = localStorage.getItem('lastDestination');
        const storedDate = localStorage.getItem('lastDepartureDate');
        const storedTime = localStorage.getItem('finalDepartureTime'); 
        
        if (!bookingId || !userToken || !storedDestination || !storedDate || !storedTime) {
            setError('Trip details are missing. Please return to schedule page.');
            navigate('/select-schedule'); // Force navigation back if user skipped a step
            return;
        }

        if (!isNaN(storedPassengers) && storedPassengers > 0) {
            setInitialPassengers(storedPassengers);
        }

        // Set trip details for display
        if (!tripDetails) {
             setTripDetails({ 
                departure: storedDeparture,
                destination: storedDestination, 
                date: storedDate, 
                time: storedTime 
            });
        }
        
        // Only fetch occupied seats if data hasn't been loaded yet
        if (!dataLoaded) { 
            fetchOccupiedSeats(storedDestination, storedDate, storedTime);
        }
        
    }, [bookingId, userToken, navigate, dataLoaded, tripDetails]);


    const toggleSeat = (seatId) => {
        // Validation check for already occupied seats is handled via disabled button state

        if (selectedSeats.includes(seatId)) {
            setSelectedSeats(selectedSeats.filter(s => s !== seatId));
            setError(null); 
        } 
        
        else {
            const currentCount = selectedSeats.length;
            
            if (currentCount >= initialPassengers) {
                setError(`You can only select ${initialPassengers} seat(s) for your party.`);
                return;
            }
            
            setSelectedSeats([...selectedSeats, seatId]);
            setError(null); 
        }
    };

    const handleProceedToPayment = async () => {
        if (selectedSeats.length === 0) {
            setError('Please select at least one seat.');
            return;
        }
        
        if (selectedSeats.length !== initialPassengers) {
            setError(`Please select exactly ${initialPassengers} seat(s) to proceed.`);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await axios.put(
                `${RENDER_API_URL}/api/bookings/${bookingId}/seats`, 
                { selectedSeats, totalAmount },
                {
                    headers: { 'x-auth-token': userToken }
                }
            );

            localStorage.setItem('bookingTotalAmount', totalAmount);
            navigate('/payment');

        } catch (err) {
            console.error('Error updating seats:', err.response?.data);
            setError(err.response?.data?.message || 'Failed to reserve seats. Please try again.');
        } finally {
            setLoading(false);
        }
    };
    
    // Helper function to render a deck
    const renderDeck = (deckName, layout) => (
        <div key={deckName} style={{ marginBottom: '40px', padding: '15px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h3 style={{ borderBottom: '2px solid var(--primary-blue)', paddingBottom: '10px', marginBottom: '15px', color: 'var(--primary-blue)' }}>
                {deckName.replace(/([A-Z])/g, ' $1').trim()}
            </h3>
            
            {layout.map((row, rowIndex) => (
                <div key={rowIndex} style={{ display: 'flex', justifyContent: 'center', margin: '5px 0' }}>
                    {row.map((seatId, colIndex) => {
                        if (seatId === null) {
                            return <div key={colIndex} style={{ width: '40px', margin: '5px' }}></div>; // Aisle Space
                        }
                        if (seatId === 'WHEEL') {
                            return <div key={colIndex} style={{ width: '60px', height: '60px', margin: '5px', backgroundColor: '#e0e0e0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>&#9981;</div>; // Steering Wheel Icon
                        }
                        
                        const status = occupiedSeats.includes(seatId) ? 'occupied' : selectedSeats.includes(seatId) ? 'selected' : 'available';
                        const price = seatId.startsWith('U-') ? UPPER_PRICE : LOWER_PRICE;

                        return (
                            <Seat 
                                key={seatId}
                                id={seatId} 
                                price={price}
                                status={status}
                                deck={deckName}
                                onClick={() => toggleSeat(seatId)}
                            />
                        );
                    })}
                </div>
            ))}
        </div>
    );


    // Display loading state while fetching dynamic occupied seats
    if (loading && !dataLoaded) {
        return (
            <div className="page-container" style={{textAlign: 'center', padding: '50px'}}>
                <h2>Loading Bus Availability...</h2>
                <p>Checking confirmed bookings from the server.</p>
            </div>
        );
    }

    return (
        <div className="page-container">
            <h2 style={{borderBottom: '1px solid #ddd', paddingBottom: '10px'}}>Select Your Seats</h2>
            <p style={{marginBottom: '10px', fontWeight: 'bold'}}>
                Trip: {tripDetails ? `${tripDetails.departure} to ${tripDetails.destination} on ${new Date(tripDetails.date).toLocaleDateString()} at ${tripDetails.time}` : 'Details Unavailable'}
            </p>
            <p style={{marginBottom: '25px'}}>
                **Max {initialPassengers} Seat(s)** | Lower Deck: ₹{LOWER_PRICE} | Upper Deck: ₹{UPPER_PRICE}
            </p>
            
            {error && <p className="error-message">{error}</p>}
            
            {/* --- DUAL DECK LAYOUT --- */}
            <div className="seat-map-main" style={{display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap'}}>
                {renderDeck('LowerDeck', SEAT_MAP_LAYOUT.LowerDeck)}
                {renderDeck('UpperDeck', SEAT_MAP_LAYOUT.UpperDeck)}
            </div>
            {/* ------------------------- */}


            <div className="summary-box" style={{marginTop: '30px'}}>
                <h3 style={{borderBottom: '1px solid #ddd', paddingBottom: '10px', marginBottom: '15px'}}>Booking Summary</h3>
                
                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '10px'}}>
                    <span>Selected Seats:</span>
                    <span style={{fontWeight: '600', color: 'var(--primary-blue)'}}>
                        {selectedSeats.join(', ') || 'None'}
                    </span>
                </div>

                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px', paddingBottom: '15px', borderBottom: '1px solid #f0f0f0'}}>
                    <span>Total Seats Selected:</span>
                    <span style={{fontWeight: '600'}}>
                        {selectedSeats.length} (Required: {initialPassengers})
                    </span>
                </div>
                
                <div style={{display: 'flex', justifyContent: 'space-between', fontSize: '1.4rem', fontWeight: 'bold', color: 'var(--accent-green)'}}>
                    <span>Total Payable:</span>
                    <span>₹{totalAmount.toFixed(2)}</span>
                </div>
                
                <button 
                    onClick={handleProceedToPayment} 
                    disabled={selectedSeats.length === 0 || selectedSeats.length !== initialPassengers}
                    className="primary-button pay-button"
                    style={{marginTop: '20px'}}
                >
                    Proceed to Pay (₹{totalAmount.toFixed(2)})
                </button>
            </div>
        </div>
    );
};

export default SeatSelectionPage;