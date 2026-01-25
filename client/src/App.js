// client/src/App.js
// Shree Ram Tour and Travels - Bus Booking System

import React from 'react';
// FIX: Ensure Link is imported along with Router, Routes, and Route
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'; 

import HomePage from './components/HomePage';
import BusSchedulePage from './components/BusSchedulePage';
import SeatSelectionPage from './components/SeatSelectionPage'; 
import PaymentPage from './components/PaymentPage';
import AdminDashboard from './components/AdminDashboard';
import Footer from './components/Footer'; 
import './App.css'; 

function App() {
  return (
    <Router>
      <div className="App">
        {/* --- Header with Logo/Link --- */}
        <header className="App-header">
            <div className="page-container" style={{textAlign: 'center'}}>
                <Link to="/">
                    <img 
                        src="/shree-ram-logo-new.png" 
                        alt="Shree Ram Tour and Travels Logo" 
                        style={{height: '80px', width: 'auto', borderRadius: '0', display: 'block', margin: '0 auto', backgroundColor: 'white', padding: '5px'}}
                        onError={(e) => {
                            console.log('Logo failed to load, using fallback');
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'inline-block';
                        }}
                    />
                    <div style={{
                        background: 'linear-gradient(135deg, #ff6b35, #f7931e)',
                        color: 'white',
                        padding: '15px 30px',
                        borderRadius: '10px',
                        display: 'none',
                        fontFamily: 'Arial, sans-serif',
                        fontWeight: 'bold',
                        fontSize: '1.5rem',
                        textAlign: 'center',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                        margin: '10px 0'
                    }}>
                        <div style={{fontSize: '1.8rem', marginBottom: '5px'}}>
                            Shree<span style={{color: '#fff200'}}>Ram</span>
                        </div>
                        <div style={{fontSize: '1rem', fontWeight: 'normal', color: '#fff200'}}>
                            Tour and Travels
                        </div>
                    </div>
                </Link>
            </div>
        </header>

        {/* --- Main Content Routes --- */}
        <main>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/select-schedule" element={<BusSchedulePage />} />
              <Route path="/select-seat" element={<SeatSelectionPage />} /> 
              <Route path="/payment" element={<PaymentPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="*" element={<h1 style={{textAlign: 'center', padding: '50px'}}>404 | Page Not Found</h1>} />
            </Routes>
        </main>

        {/* --- Footer Integration --- */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;