// client/src/components/PaymentPage.js - FINAL GUARANTEED TS CODE DISPLAY

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { QRCodeSVG } from 'qrcode.react'; 

const PaymentPage = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    
    // finalBookingId holds the TS number for display
    const [finalBookingId, setFinalBookingId] = useState(null); 
    
    const [formData, setFormData] = useState({
        userName: '',
        userPhone: '',
        userEmail: '',
        screenshot: null,
    });
    
    // --- API BASE URL (Auto-detects environment) ---
    const API_BASE_URL = process.env.REACT_APP_API_URL || 
        (process.env.NODE_ENV === 'production' 
            ? 'https://floppy-trains-do.loca.lt' 
            : 'http://localhost:5000');
    const RENDER_API_URL = API_BASE_URL;
    
    // --- Bank Details for QR Code / Manual Payment ---
    const bankDetails = {
        bankName: "Shree Ram Tour and Travels Pvt Ltd",
        accountNumber: "42479127271",
        ifscCode: "SBIN0001576",
        upiId: "shrir987090991@barodampay"
    };
    const qrData = `upi://pay?pa=${bankDetails.upiId}&pn=${bankDetails.bankName}&am=${amount.toFixed(2)}`;

    // Read initial data from local storage
    const currentBookingId = localStorage.getItem('currentBookingId');
    const userToken = localStorage.getItem('userToken');
    const totalAmount = localStorage.getItem('bookingTotalAmount');

    useEffect(() => {
        if (!currentBookingId || !userToken || !totalAmount) {
            setMessage('Booking details missing. Please restart the booking process.');
            return;
        } 
        
        setAmount(parseFloat(totalAmount));
        // FIX: Ensure finalBookingId is captured into local state right when the component mounts.
        setFinalBookingId(currentBookingId); 
    }, [currentBookingId, userToken, totalAmount]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleFileChange = (e) => {
        setFormData(prev => ({
            ...prev,
            screenshot: e.target.files[0],
        }));
    };

    const handleSubmitProof = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('Submitting payment proof...');
        
        // --- VALIDATION CHECKS ---
        if (!currentBookingId || currentBookingId === "null") {
            setMessage('Error: Booking session ID is invalid. Please start the search again.');
            setLoading(false);
            return;
        }
        
        if (!formData.screenshot) {
            setMessage('Please upload the payment screenshot.');
            setLoading(false);
            return;
        }
        
        const phoneRegex = /^\d{10}$/; 
        if (!phoneRegex.test(formData.userPhone)) {
             setMessage('Please ensure a proper 10-digit phone number is entered.');
             setLoading(false);
             return;
        }
        // --- END VALIDATION CHECKS ---

        const data = new FormData();
        data.append('userName', formData.userName);
        data.append('userPhone', formData.userPhone);
        data.append('userEmail', formData.userEmail);
        data.append('screenshot', formData.screenshot); 

        try {
            const response = await axios.post(
                `${RENDER_API_URL}/api/bookings/${currentBookingId}/submit`, 
                data,
                {
                    headers: { 
                        'x-auth-token': userToken,
                        'Content-Type': 'multipart/form-data'
                    }
                }
            );
            
            // CRITICAL FIX: The server returns the final TS number in the response.
            const tsNumber = response.data.tsNumber;
            // Update state with the user-friendly TS number
            setFinalBookingId(tsNumber); 

            setMessage(response.data.message + ' You will receive a ticket via email upon verification.');
            
            // Clean up session data
            localStorage.removeItem('currentBookingId');
            localStorage.removeItem('bookingTotalAmount');
            localStorage.removeItem('initialPassengers');
            
            setIsSubmitted(true);

        } catch (err) {
            console.error('Submission Error:', err.response?.data);
            setMessage(`Submission failed: ${err.response?.data.message || 'Server error'}`);
            setIsSubmitted(false);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <h2>Complete Your Booking (Page 3)</h2>
            
            {/* --- DISPLAY TS CODE AT THE TOP (Visible only before submission) --- */}
            {!isSubmitted && (
                <p style={{
                    fontSize: '1.2rem', 
                    fontWeight: 'bold', 
                    color: 'var(--accent-green)', 
                    textAlign: 'center', 
                    marginBottom: '20px'
                }}>
                    Tracking Code (TS): {finalBookingId}
                </p>
            )}
            {/* ---------------------------------------------------------------- */}
            
            <div className="form-card" style={{display: isSubmitted ? 'block' : 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px'}}>
                
                {/* --- LOADING BAR IMPLEMENTATION --- */}
                {loading && (
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                        backgroundColor: 'rgba(255, 255, 255, 0.8)', zIndex: 10
                    }}>
                        <div style={{
                            width: '100%', height: '10px', backgroundColor: 'var(--accent-green)',
                            animation: 'progress-bar 2s infinite linear', opacity: 0.8
                        }}></div>
                        <p style={{textAlign: 'center', marginTop: '50px', fontWeight: 'bold', color: 'var(--primary-blue)'}}>
                            Submitting proof and sending email... Please wait.
                        </p>
                    </div>
                )}
                {/* Ensure @keyframes progress-bar is in App.css */}
                {/* --- END LOADING BAR --- */}


                {!isSubmitted && (
                    <div className="payment-qr-section">
                        <h3 style={{color: 'var(--primary-blue)'}}>1. Make Payment (₹{amount.toFixed(2)})</h3>
                        
                        <div style={{border: '1px solid var(--border-color)', padding: '20px', borderRadius: '8px', textAlign: 'center', marginBottom: '20px'}}>
                            <p style={{fontWeight: 'bold'}}>Scan to Pay via UPI</p>
                            {/* QR Code display */}
                            {amount > 0 && (
                                <div style={{padding: '10px', display: 'inline-block', border: '2px solid #000'}}>
                                    <QRCodeSVG value={qrData} size={180} level="H" /> 
                                </div>
                            )}
                            <p style={{fontSize: '0.9rem', marginTop: '10px'}}>UPI ID: {bankDetails.upiId}</p>
                        </div>
                    </div>
                )}


                <form onSubmit={handleSubmitProof} className="payment-form-section" style={{position: 'relative'}}>
                    <h3 style={{color: 'var(--primary-blue)'}}>{isSubmitted ? 'Submission Complete' : '2. Submit Proof & Details'}</h3>
                    
                    {!isSubmitted ? (
                        <>
                            <div className="form-group">
                                <label htmlFor="userName">Your Full Name:</label>
                                <input type="text" name="userName" value={formData.userName} onChange={handleChange} required />
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="userPhone">Phone Number: (10 digits)</label>
                                <input type="number" name="userPhone" value={formData.userPhone} onChange={handleChange} required placeholder="Ensure proper 10-digit number" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="userEmail">Email (For Ticket):</label>
                                <input type="email" name="userEmail" value={formData.userEmail} onChange={handleChange} required />
                            </div>

                            <div className="form-group">
                                <label htmlFor="screenshot">Upload Payment Screenshot:</label>
                                <input type="file" name="screenshot" accept="image/*" onChange={handleFileChange} required />
                            </div>
                            
                            {message && <p className={message.includes('successful') ? 'success-message' : 'error-message'}>{message}</p>}

                            <button 
                                type="submit"
                                disabled={loading}
                                className="primary-button pay-button"
                            >
                                {loading ? 'Submitting...' : 'Submit Proof & Book'}
                            </button>
                        </>
                    ) : (
                        <div className="success-message">
                            <p style={{fontSize: '1.1rem', lineHeight: '1.6'}}>
                                Thank you, <span style={{fontWeight: 'bold'}}>{formData.userName}</span>! 
                                Your booking (TS Code: <span style={{fontWeight: 'bold'}}>{finalBookingId}</span>) is now in **PROCESSING** status.
                                We have notified the admin and will verify your payment and send 
                                your e-ticket to <span style={{fontWeight: 'bold'}}>{formData.userEmail}</span> shortly.
                            </p>
                            <button onClick={() => navigate('/')} className="primary-button" style={{marginTop: '20px', width: 'auto'}}>
                                Return to Home
                            </button>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default PaymentPage;