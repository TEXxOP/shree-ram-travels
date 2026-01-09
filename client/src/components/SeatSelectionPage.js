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

// Get the selected bus price from localStorage, fallback to default prices
const getSelectedBusPrice = () => {
    const storedPrice = localStorage.getItem('selectedBusPrice');
    return storedPrice ? parseFloat(storedPrice) : 850; // Default fallback price
};

const SELECTED_BUS_PRICE = getSelectedBusPrice();
// For seat differentiation, we can still have slight price differences
const LOWER_PRICE = SELECTED_BUS_PRICE; // Use the selected bus price for lower deck
const UPPER_PRICE = SELECTED_BUS_PRICE - 50; // Upper deck slightly cheaper
// ---------------------

// --- NEW SEAT LAYOUT STRUCTURE (Based on your image with walking areas) ---
const SEAT_MAP_LAYOUT = {
    // Lower Deck (Left side - 22 seats with walking areas)
    LowerDeck: [
        // Row 1: Single | GAP | Pair | GAP | Pair
        ['L-A1', 'AISLE', 'L-B1', 'L-C1'], 
        // Row 2: Single (blocked) | GAP | Pair
        ['L-A2-BLOCKED', 'AISLE', 'L-B2', 'L-C2'], 
        // Row 3: Single (blocked) | GAP | Pair
        ['L-A3-BLOCKED', 'AISLE', 'L-B3', 'L-C3'], 
        // Row 4: Single | GAP | Pair (blocked)
        ['L-A4', 'AISLE', 'L-B4-BLOCKED', 'L-C4-BLOCKED'],
        // Row 5: Single (blocked) | GAP | Pair
        ['L-A5-BLOCKED', 'AISLE', 'L-B5', 'L-C5'],
        // Row 6: Single (back row)
        ['L-A6', 'AISLE', '', ''],
    ],
    // Upper Deck (Right side - 22 seats with walking areas)  
    UpperDeck: [
        // Row 1: Single | GAP | Pair | GAP | Pair
        ['U-A1', 'AISLE', 'U-B1', 'U-C1'], 
        // Row 2: Single (blocked) | GAP | Pair
        ['U-A2-BLOCKED', 'AISLE', 'U-B2', 'U-C2'], 
        // Row 3: Single | GAP | Pair
        ['U-A3', 'AISLE', 'U-B3', 'U-C3'], 
        // Row 4: Single | GAP | Pair (blocked)
        ['U-A4', 'AISLE', 'U-B4-BLOCKED', 'U-C4-BLOCKED'],
        // Row 5: Single (blocked) | GAP | Pair
        ['U-A5-BLOCKED', 'AISLE', 'U-B5', 'U-C5'],
        // Row 6: Single (back row)
        ['U-A6', 'AISLE', '', ''],
    ],
};
// ----------------------------------------------------


// --- SEAT COMPONENT ---
const Seat = ({ id, price, status, onClick, deck, isBlocked }) => {
    let className = 'seat-button';
    if (status === 'occupied' || isBlocked) className += ' occupied';
    else if (status === 'selected') className += ' selected';
    
    // Handle blocked seats from layout
    const seatIsBlocked = id && id.includes('BLOCKED');
    const cleanId = id ? id.replace('-BLOCKED', '') : '';

    return (
        <button
            key={cleanId}
            className={className}
            onClick={onClick}
            disabled={status === 'occupied' || seatIsBlocked || isBlocked}
            style={{
                width: '60px',
                height: '80px', // Taller seats like in the image
                margin: '3px',
                flexShrink: 0,
                backgroundColor: (status === 'occupied' || seatIsBlocked || isBlocked) ? '#dc3545' : 
                               status === 'selected' ? 'var(--accent-green)' : 
                               deck === 'UpperDeck' ? '#e3f2fd' : '#f3e5f5', // Light blue for upper, light purple for lower
                border: '2px solid #ddd',
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                fontSize: '0.75rem',
                fontWeight: 'bold'
            }}
        >
            <span style={{fontSize: '0.7rem', color: '#666'}}>{cleanId.replace(/-/g, '')}</span>
            <span style={{fontSize: '0.8rem', fontWeight: 'bold', display: 'block', marginTop: '2px'}}>
                {price && !seatIsBlocked ? `₹${price.toFixed(0)}` : ''}
            </span>
            {(status === 'occupied' || seatIsBlocked) && <span style={{fontSize: '0.6rem', color: '#fff'}}>N/A</span>}
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
    // NEW: Add state for dynamic pricing
    const [seatPricing, setSeatPricing] = useState({});

    const totalAmount = selectedSeats.reduce((sum, seatId) => {
        // Use dynamic pricing if available, fallback to hardcoded prices
        const price = seatPricing[seatId] || (seatId.startsWith('U-') ? UPPER_PRICE : LOWER_PRICE);
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

    // NEW: Fetch seat pricing from API
    const fetchSeatPricing = async (routeId, departureTime, departureDate) => {
        try {
            const response = await axios.get(
                `${RENDER_API_URL}/api/seats/availability/${routeId}`,
                { params: { departureTime, departureDate } }
            );
            
            // Build pricing map from seat data
            const pricingMap = {};
            if (response.data.seats && response.data.seats.length > 0) {
                response.data.seats.forEach(seat => {
                    pricingMap[seat.seatId] = seat.currentPrice;
                });
            } else {
                // Fallback to hardcoded prices if no seat data
                console.log('No seat data found, using fallback pricing');
                // Generate fallback pricing for all seats
                Object.values(SEAT_MAP_LAYOUT).flat().forEach(row => {
                    if (Array.isArray(row)) {
                        row.forEach(seatId => {
                            if (seatId && seatId !== 'WHEEL' && seatId !== 'AISLE' && seatId !== '') {
                                const cleanSeatId = seatId.replace('-BLOCKED', '');
                                pricingMap[cleanSeatId] = cleanSeatId.startsWith('U-') ? UPPER_PRICE : LOWER_PRICE;
                            }
                        });
                    }
                });
            }
            
            setSeatPricing(pricingMap);
        } catch (err) {
            console.error('Error fetching seat pricing:', err);
            // Fallback to hardcoded pricing
            const fallbackPricing = {};
            Object.values(SEAT_MAP_LAYOUT).flat().forEach(row => {
                if (Array.isArray(row)) {
                    row.forEach(seatId => {
                        if (seatId && seatId !== 'WHEEL' && seatId !== 'AISLE' && seatId !== '') {
                            const cleanSeatId = seatId.replace('-BLOCKED', '');
                            fallbackPricing[cleanSeatId] = cleanSeatId.startsWith('U-') ? UPPER_PRICE : LOWER_PRICE;
                        }
                    });
                }
            });
            setSeatPricing(fallbackPricing);
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
            // Also fetch pricing data - we'll need to get routeId from routes
            // For now, use a placeholder routeId or fetch from routes API
            fetchSeatPricing('placeholder-route-id', storedTime, storedDate);
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
    // NEW: Add state for price filtering
    const [priceFilter, setPriceFilter] = useState('All');
    // const [availablePrices, setAvailablePrices] = useState(['All', '₹1199', '₹1299']); // Commented out unused variable

    // Helper function to render a deck
    const renderDeck = (deckName, layout) => (
        <div key={deckName} style={{
            flex: '1', 
            maxWidth: '220px', 
            margin: '10px',
            padding: '15px',
            border: '2px solid #ddd',
            borderRadius: '12px',
            backgroundColor: '#fafafa'
        }}>
            <h3 style={{
                textAlign: 'center', 
                margin: '0 0 15px 0', 
                color: deckName === 'UpperDeck' ? '#1976d2' : '#7b1fa2',
                fontSize: '1.1rem',
                fontWeight: 'bold'
            }}>
                {deckName === 'UpperDeck' ? 'Upper' : 'Lower'}
                {deckName === 'UpperDeck' && <span style={{fontSize: '1.5rem', marginLeft: '10px'}}>🚗</span>}
            </h3>
            
            {layout.map((row, rowIndex) => (
                <div key={rowIndex} style={{
                    display: 'flex', 
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: '5px',
                    gap: '5px'
                }}>
                    {row.map((seatId, colIndex) => {
                        // Handle aisle/walking area
                        if (seatId === 'AISLE') {
                            return (
                                <div key={`aisle-${colIndex}`} style={{
                                    width: '20px', 
                                    height: '80px',
                                    margin: '3px',
                                    backgroundColor: '#f0f0f0',
                                    border: '2px dashed #ccc',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '0.6rem',
                                    color: '#999',
                                    writingMode: 'vertical-rl',
                                    textOrientation: 'mixed'
                                }}>
                                    🚶
                                </div>
                            );
                        }
                        
                        // Handle empty spaces
                        if (!seatId || seatId === '') {
                            return <div key={colIndex} style={{ width: '60px', margin: '3px' }}></div>; // Empty space
                        }
                        
                        const cleanSeatId = seatId.replace('-BLOCKED', '');
                        const isBlocked = seatId.includes('BLOCKED');
                        const status = occupiedSeats.includes(cleanSeatId) ? 'occupied' : 
                                     selectedSeats.includes(cleanSeatId) ? 'selected' : 'available';
                        
                        // Use dynamic pricing if available, fallback to hardcoded prices
                        const price = seatPricing[cleanSeatId] || (cleanSeatId.startsWith('U-') ? UPPER_PRICE : LOWER_PRICE);

                        return (
                            <Seat 
                                key={cleanSeatId}
                                id={seatId}
                                price={price}
                                status={status}
                                deck={deckName}
                                isBlocked={isBlocked}
                                onClick={() => !isBlocked && toggleSeat(cleanSeatId)}
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

            {/* SEAT LEGEND */}
            <div style={{
                display: 'flex', 
                justifyContent: 'center', 
                gap: '15px', 
                marginBottom: '20px',
                flexWrap: 'wrap',
                fontSize: '0.8rem'
            }}>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <div style={{width: '20px', height: '20px', backgroundColor: '#e3f2fd', border: '2px solid #ddd', borderRadius: '4px'}}></div>
                    <span>Available</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <div style={{width: '20px', height: '20px', backgroundColor: '#fce4ec', border: '2px solid #ddd', borderRadius: '4px'}}></div>
                    <span>For Female</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <div style={{width: '20px', height: '20px', backgroundColor: '#e8f5e8', border: '2px solid #ddd', borderRadius: '4px'}}></div>
                    <span>For Male</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <div style={{width: '20px', height: '20px', backgroundColor: '#f3e5f5', border: '2px solid #ddd', borderRadius: '4px'}}></div>
                    <span>Female booked</span>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <div style={{width: '20px', height: '20px', backgroundColor: '#dc3545', border: '2px solid #ddd', borderRadius: '4px'}}></div>
                    <span>Booked</span>
                </div>
            </div>

            {/* PRICE FILTER BUTTONS */}
            <div style={{
                display: 'flex', 
                justifyContent: 'center', 
                gap: '10px', 
                marginBottom: '25px',
                flexWrap: 'wrap'
            }}>
                {['All', `₹${UPPER_PRICE}`, `₹${LOWER_PRICE}`].map(price => (
                    <button
                        key={price}
                        onClick={() => setPriceFilter(price)}
                        style={{
                            padding: '8px 16px',
                            border: '2px solid #ddd',
                            borderRadius: '20px',
                            backgroundColor: priceFilter === price ? '#ff6b6b' : 'white',
                            color: priceFilter === price ? 'white' : '#333',
                            fontSize: '0.9rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                        }}
                    >
                        {price}
                    </button>
                ))}
            </div>
            
            {error && <p className="error-message">{error}</p>}
            
            {/* --- SIDE BY SIDE DECK LAYOUT WITH CENTRAL WALKING AREA --- */}
            <div className="seat-map-main" style={{
                display: 'flex', 
                justifyContent: 'center', 
                gap: '30px', // Increased gap for walking area
                flexWrap: 'wrap',
                marginBottom: '30px'
            }}>
                {renderDeck('LowerDeck', SEAT_MAP_LAYOUT.LowerDeck)}
                
                {/* Central Walking Area */}
                <div style={{
                    width: '40px',
                    minHeight: '400px',
                    backgroundColor: '#f8f9fa',
                    border: '2px dashed #dee2e6',
                    borderRadius: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    padding: '10px 0'
                }}>
                    <div style={{
                        writingMode: 'vertical-rl',
                        textOrientation: 'mixed',
                        fontSize: '0.8rem',
                        color: '#6c757d',
                        fontWeight: 'bold'
                    }}>
                        WALKING AREA
                    </div>
                    <div style={{fontSize: '1.5rem'}}>🚶</div>
                    <div style={{fontSize: '1.5rem'}}>🚶</div>
                    <div style={{fontSize: '1.5rem'}}>🚶</div>
                </div>
                
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