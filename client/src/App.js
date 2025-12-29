// client/src/App.js

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
                        src="/shree-ram-logo.png" 
                        alt="Shree Ram Tour and Travels Logo" 
                        style={{height: '80px', width: 'auto', borderRadius: '0', display: 'block', margin: '0 auto'}}
                    />
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