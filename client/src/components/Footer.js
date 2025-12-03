// client/src/components/Footer.js - HINT REMOVED

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
    // This URL is extracted from the map embed code you provided
    const mapEmbedUrl = "https://maps.google.com/maps?width=625&height=325&hl=en&q=shree ram tours and travels&t=&z=15&ie=UTF8&iwloc=B&output=embed";

    return (
        <footer className="app-footer">
            <div className="footer-content page-container">
                
                <div className="footer-section footer-map">
                    <h4>Our Location (Shree Ram Travels)</h4>
                    
                    {/* --- Integrated Google Map Embed --- */}
                    <div className="mapouter">
                        <div className="gmap_canvas">
                            <iframe 
                                className="gmap_iframe" 
                                width="100%" 
                                frameBorder="0" 
                                scrolling="no" 
                                marginHeight="0" 
                                marginWidth="0" 
                                src={mapEmbedUrl}
                                title="Shree Ram Travels Location"
                            ></iframe>
                        </div>
                    </div>
                    {/* ------------------------------------- */}
                </div>

                <div className="footer-section footer-links">
                    <h4>Quick Links</h4>
                    <p><Link to="/">Home</Link></p>
                    <p>
                        <Link to="/admin" className="admin-link-button">
                            Admin Login Portal
                        </Link>
                    </p>
                    <p style={{marginTop: '15px', fontSize: '0.9rem'}}>
                        © {new Date().getFullYear()} Shree Ram Travels. All rights reserved.
                    </p>
                </div>

                <div className="footer-section footer-contact">
                    <h4>Contact Us</h4>
                    <p>Email: mj732411@gmail.com</p>
                    <p>Phone: +91 98709 95956</p>
                    <p>Address: Nathuwa wala, Dehradun, Dehradun, Uttarakhand-248008</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;