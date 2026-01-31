// server/server.js - FINAL CODE WITH CORRECTED NODEMAILER SETUP

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail'); // SendGrid for emails
const multer = require('multer'); 
const path = require('path');
const fs = require('fs');
const cloudinary = require('cloudinary').v2; 
require('dotenv').config();

// Import Models
const Booking = require('./models/Booking');
const Route = require('./models/Route');
const Seat = require('./models/Seat');
const SeatCategory = require('./models/SeatCategory');
const RoutePrice = require('./models/RoutePrice');

const app = express();
const PORT = process.env.PORT || 5000;

// IMPORTANT: Environment variables
const MONGO_URI = process.env.MONGO_URI; 
const JWT_SECRET = process.env.JWT_SECRET || 'YOUR_SUPER_SECRET_KEY'; 
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'shreeram_admin_token_123'; 
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const EMAIL_USER = process.env.EMAIL_USER;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const RENDER_API_URL = 'https://shree-ram-travels-api.onrender.com';

// Configure SendGrid
if (SENDGRID_API_KEY) {
    sgMail.setApiKey(SENDGRID_API_KEY);
    console.log('✅ SendGrid configured successfully');
} else {
    console.warn('⚠️ SENDGRID_API_KEY not set - emails will not be sent');
}

// Log email configuration on startup
console.log('📧 Email Configuration:');
console.log('EMAIL_USER (From):', EMAIL_USER);
console.log('ADMIN_EMAIL (To):', ADMIN_EMAIL);
console.log('SendGrid API Key:', SENDGRID_API_KEY ? '***' + SENDGRID_API_KEY.slice(-4) : 'NOT SET'); 

// --- Cloudinary Configuration ---
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true
});

// --- Middleware & CORS ---
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001', 
    'https://shreerambus.netlify.app',
    'https://shree-ram-travels.vercel.app',
    'https://shree-ram-travels-harishkumarsaini18s-projects.vercel.app', // Vercel preview URLs
    'https://ramjibus.com',
    'https://www.ramjibus.com',
    /\.vercel\.app$/ // Allow all Vercel preview deployments
];

// Temporarily allow all origins for debugging
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: false,
})); 
app.use(express.json()); 

// --- Database Connection ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected!'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- File Upload (Multer) Setup: Use memory storage ---
const upload = multer({ storage: multer.memoryStorage() }); 

// --- SendGrid Email Helper Functions ---

// Send notification to admin when payment proof is submitted
const sendAdminNotification = async (bookingData, imageUrl) => {
    // Convert comma-separated emails to array for SendGrid
    const recipients = ADMIN_EMAIL.includes(',') 
        ? ADMIN_EMAIL.split(',').map(email => email.trim())
        : ADMIN_EMAIL;
    
    const msg = {
        to: recipients,
        from: EMAIL_USER, // Must be verified in SendGrid
        subject: `ACTION REQUIRED: Payment Verification for Booking ${bookingData.TS}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #004d99, #0066cc); color: white; padding: 20px; text-align: center;">
                    <img src="https://www.ramjibus.com/shree-ram-logo-new.png" alt="Shree Ram Tour and Travels" style="height: 60px; width: auto; margin-bottom: 10px; background: white; padding: 5px; border-radius: 5px;" />
                    <h2 style="margin: 10px 0 0 0; color: white;">New Payment Proof Submitted</h2>
                </div>
                
                <div style="padding: 20px;">
                    <p>A new payment proof screenshot has been uploaded.</p>
                    
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                        <h3 style="color: #28a745; margin-top: 0;">Tracking Code (TS): ${bookingData.TS}</h3>
                        <p><strong>Booking ID:</strong> ${bookingData._id}</p>
                        <p><strong>Status:</strong> <span style="color: orange;">Processing</span></p>
                    </div>
                    
                    <h3>Customer Details:</h3>
                    <ul>
                        <li><strong>Name:</strong> ${bookingData.userName}</li>
                        <li><strong>Phone:</strong> ${bookingData.userPhone}</li>
                        <li><strong>Email:</strong> ${bookingData.userEmail}</li>
                    </ul>
                
                <h3>Trip Details:</h3>
                <ul>
                    <li><strong>Route:</strong> ${bookingData.departureCity} → ${bookingData.destinationCity}</li>
                    <li><strong>Date:</strong> ${new Date(bookingData.departureDate).toLocaleDateString()}</li>
                    <li><strong>Time:</strong> ${bookingData.departureTime}</li>
                    <li><strong>Seats:</strong> ${bookingData.selectedSeats.join(', ')}</li>
                    <li><strong>Amount:</strong> ₹${bookingData.totalAmount.toFixed(2)}</li>
                </ul>
                
                <div style="background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0;">
                    <p style="margin: 0;"><strong>📸 Payment Proof:</strong></p>
                    <p style="margin: 10px 0 0 0;">
                        <a href="${imageUrl}" target="_blank" style="color: #004d99; text-decoration: none; font-weight: bold;">
                            Click here to view screenshot →
                        </a>
                    </p>
                </div>
                
                <p style="margin-top: 30px;">Please log into the Admin Dashboard to verify the payment and update the status to 'Paid'.</p>
                
                <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0;">
                    <p style="color: #6c757d; font-size: 0.9rem;">Shree Ram Tour and Travels - Premium Bus Services</p>
                </div>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log('✅ Admin notification email sent successfully via SendGrid!');
        console.log('📧 Email sent to:', ADMIN_EMAIL);
        console.log('📋 Booking TS:', bookingData.TS);
    } catch (error) {
        console.error('❌ Error sending email via SendGrid:', error.message);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
        
        // Log email details for manual checking
        console.log('📧 EMAIL DETAILS (for manual verification):');
        console.log('To:', ADMIN_EMAIL);
        console.log('Booking TS:', bookingData.TS);
        console.log('Customer:', bookingData.userName, bookingData.userEmail);
        console.log('Amount:', bookingData.totalAmount);
        console.log('Payment Proof:', imageUrl);
    }
};

// Send confirmation email to customer when payment is approved/rejected
const sendCustomerNotification = async (bookingData, status) => {
    if (!bookingData.userEmail) {
        console.log('⚠️ No customer email found, skipping notification');
        return;
    }

    const isApproved = status === 'Paid';
    const statusColor = isApproved ? '#28a745' : '#dc3545';
    const statusText = isApproved ? 'APPROVED ✅' : 'REJECTED ❌';
    
    const msg = {
        to: bookingData.userEmail,
        from: EMAIL_USER,
        subject: `${isApproved ? 'E-Ticket Confirmed' : 'Booking Cancelled'} - ${bookingData.TS}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #004d99, #0066cc); color: white; padding: 20px; text-align: center;">
                    <img src="https://www.ramjibus.com/shree-ram-logo-new.png" alt="Shree Ram Tour and Travels" style="height: 60px; width: auto; margin-bottom: 10px; background: white; padding: 5px; border-radius: 5px;" />
                    <h2 style="margin: 10px 0 0 0; font-size: 1.2rem;">${isApproved ? 'E-TICKET CONFIRMED' : 'BOOKING CANCELLED'}</h2>
                </div>
                
                <!-- Status Banner -->
                <div style="background-color: ${statusColor}; color: white; padding: 15px; text-align: center;">
                    <h3 style="margin: 0; font-size: 1.3rem;">Payment ${statusText}</h3>
                </div>
                
                <!-- Customer Greeting -->
                <div style="padding: 20px; background-color: #f8f9fa;">
                    <p style="font-size: 1.1rem; margin: 0;">Dear <strong>${bookingData.userName}</strong>,</p>
                    
                    ${isApproved ? `
                        <p style="margin: 15px 0;">🎉 Congratulations! Your payment has been verified and your bus ticket is confirmed!</p>
                        <p style="margin: 0; color: #28a745; font-weight: bold;">This is your official E-Ticket. Please save this email.</p>
                    ` : `
                        <p style="margin: 15px 0;">We're sorry, but your payment could not be verified. Your booking has been cancelled.</p>
                        <p style="margin: 0;">Please contact us if you believe this is an error.</p>
                    `}
                </div>
                
                <!-- E-Ticket Details -->
                <div style="padding: 20px; background-color: white;">
                    <h3 style="color: #004d99; border-bottom: 3px solid #004d99; padding-bottom: 10px; margin-bottom: 20px;">
                        ${isApproved ? '🎫 E-TICKET DETAILS' : '📋 BOOKING DETAILS'}
                    </h3>
                    
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                        <tr style="background-color: #004d99; color: white;">
                            <td style="padding: 12px; font-weight: bold;">Tracking Code (TS)</td>
                            <td style="padding: 12px; font-weight: bold; font-size: 1.3rem; letter-spacing: 2px;">${bookingData.TS}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Passenger Name</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${bookingData.userName}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Route</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">${bookingData.departureCity} → ${bookingData.destinationCity}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Travel Date</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #004d99;">${new Date(bookingData.departureDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Departure Time</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #004d99;">${bookingData.departureTime}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Seat Numbers</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #28a745;">${bookingData.selectedSeats.join(', ')}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Total Amount</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 1.2rem; color: #28a745;">₹${bookingData.totalAmount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Payment Status</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: ${statusColor};">${status}</td>
                        </tr>
                        <tr style="background-color: #f8f9fa;">
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Contact Number</td>
                            <td style="padding: 10px; border: 1px solid #ddd;">${bookingData.userPhone}</td>
                        </tr>
                    </table>
                </div>
                
                ${isApproved ? `
                    <!-- Important Instructions -->
                    <div style="padding: 20px; background-color: #d4edda; border-left: 5px solid #28a745; margin: 0;">
                        <h4 style="margin: 0 0 15px 0; color: #155724;">📋 IMPORTANT INSTRUCTIONS</h4>
                        <ul style="margin: 0; padding-left: 20px; color: #155724;">
                            <li>Please arrive at the boarding point <strong>15 minutes before departure</strong></li>
                            <li>Carry a valid ID proof along with this e-ticket</li>
                            <li>Keep your tracking code <strong>${bookingData.TS}</strong> handy for reference</li>
                            <li>Contact us immediately if you need to make any changes</li>
                        </ul>
                    </div>
                ` : `
                    <!-- Cancellation Notice -->
                    <div style="padding: 20px; background-color: #f8d7da; border-left: 5px solid #dc3545; margin: 0;">
                        <h4 style="margin: 0 0 15px 0; color: #721c24;">❌ BOOKING CANCELLED</h4>
                        <p style="margin: 0; color: #721c24;">If you believe this is an error, please contact us immediately with your tracking code.</p>
                    </div>
                `}
                
                <!-- Contact Information -->
                <div style="padding: 20px; background-color: #e9ecef; text-align: center;">
                    <h4 style="margin: 0 0 15px 0; color: #004d99;">📞 CONTACT INFORMATION</h4>
                    <p style="margin: 5px 0; font-weight: bold;">Shree Ram Travels</p>
                    <p style="margin: 5px 0;">📧 Email: harishkumarsaini18@gmail.com</p>
                    <p style="margin: 5px 0;">📱 Phone: +91 98709 95956</p>
                    <p style="margin: 5px 0;">📍 Address: Nathuwa wala, Dehradun, Uttarakhand-248008</p>
                    <p style="margin: 15px 0 5px 0; font-size: 0.9rem; color: #6c757d;">For any queries or support, contact us anytime</p>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 15px; background-color: #004d99; color: white;">
                    <p style="margin: 0; font-size: 0.9rem;">Thank you for choosing Shree Ram Tour and Travels!</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.8rem;">Safe Journey & Happy Travels 🚌</p>
                </div>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log(`✅ Customer notification sent to: ${bookingData.userEmail}`);
        console.log(`📋 Status: ${status}, TS: ${bookingData.TS}`);
    } catch (error) {
        console.error('❌ Error sending customer notification:', error.message);
        if (error.response) {
            console.error('SendGrid error:', error.response.body);
        }
    }
};

// NEW: Send notification to admin when a new booking is created
const sendNewBookingNotification = async (bookingData) => {
    const recipients = ADMIN_EMAIL.includes(',') 
        ? ADMIN_EMAIL.split(',').map(email => email.trim())
        : ADMIN_EMAIL;
    
    const msg = {
        to: recipients,
        from: EMAIL_USER,
        subject: `🔔 NEW BOOKING ALERT - ${bookingData.TS}`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #ddd;">
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #28a745, #20c997); color: white; padding: 20px; text-align: center;">
                    <img src="https://www.ramjibus.com/shree-ram-logo-new.png" alt="Shree Ram Tour and Travels" style="height: 60px; width: auto; margin-bottom: 10px; background: white; padding: 5px; border-radius: 5px;" />
                    <h2 style="margin: 10px 0 0 0; font-size: 1.3rem;">🔔 NEW BOOKING RECEIVED</h2>
                </div>
                
                <!-- Alert Banner -->
                <div style="background-color: #fff3cd; border-left: 5px solid #ffc107; padding: 15px; margin: 0;">
                    <p style="margin: 0; font-weight: bold; color: #856404;">
                        📋 A new booking has been created and is awaiting payment proof submission.
                    </p>
                </div>
                
                <!-- Booking Summary -->
                <div style="padding: 20px; background-color: white;">
                    <h3 style="color: #28a745; border-bottom: 3px solid #28a745; padding-bottom: 10px; margin-bottom: 20px;">
                        📊 BOOKING SUMMARY
                    </h3>
                    
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                        <tr style="background-color: #28a745; color: white;">
                            <td style="padding: 12px; font-weight: bold;">Tracking Code (TS)</td>
                            <td style="padding: 12px; font-weight: bold; font-size: 1.3rem; letter-spacing: 2px;">${bookingData.TS}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd;">Booking Status</td>
                            <td style="padding: 10px; border: 1px solid #ddd; color: #ffc107; font-weight: bold;">⏳ PENDING PAYMENT</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Trip Details -->
                <div style="padding: 20px; background-color: #f8f9fa;">
                    <h3 style="color: #004d99; border-bottom: 3px solid #004d99; padding-bottom: 10px; margin-bottom: 20px;">
                        🚌 TRIP DETAILS
                    </h3>
                    
                    <table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: white;">Route</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: white;">${bookingData.departureCity} → ${bookingData.destinationCity}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f8f9fa;">Travel Date</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #004d99; background-color: #f8f9fa;">${new Date(bookingData.departureDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: white;">Departure Time</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #004d99; background-color: white;">${bookingData.departureTime}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f8f9fa;">Passengers</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; background-color: #f8f9fa;">${bookingData.passengers}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: white;">Selected Seats</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; color: #28a745; background-color: white;">${bookingData.selectedSeats.join(', ')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: #f8f9fa;">Total Amount</td>
                            <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold; font-size: 1.2rem; color: #28a745; background-color: #f8f9fa;">₹${bookingData.totalAmount.toFixed(2)}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; font-weight: bold; border: 1px solid #ddd; background-color: white;">Booking Time</td>
                            <td style="padding: 10px; border: 1px solid #ddd; background-color: white;">${new Date(bookingData.bookingDate).toLocaleString('en-IN')}</td>
                        </tr>
                    </table>
                </div>
                
                <!-- Footer -->
                <div style="text-align: center; padding: 15px; background-color: #28a745; color: white;">
                    <p style="margin: 0; font-size: 0.9rem;">Shree Ram Tour and Travels - Admin Notification System</p>
                    <p style="margin: 5px 0 0 0; font-size: 0.8rem;">Stay updated with real-time booking alerts 📱</p>
                </div>
            </div>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log('✅ New booking notification sent to admin via SendGrid!');
        console.log('📧 Email sent to:', ADMIN_EMAIL);
        console.log('📋 New Booking TS:', bookingData.TS);
    } catch (error) {
        console.error('❌ Error sending new booking notification:', error.message);
        if (error.response) {
            console.error('SendGrid error details:', error.response.body);
        }
    }
};


// --- Auth Helper Functions and Middleware ---

// Helper function to generate a unique JWT token
const generateUserToken = () => {
    const secret = JWT_SECRET || 'YOUR_SUPER_SECRET_KEY';
    try {
        const tempId = new mongoose.Types.ObjectId(); 
        const token = jwt.sign({ id: tempId, isGuest: true }, secret, { expiresIn: '7d' });
        return { token, tempId }; 
    } catch (e) {
        console.error("Error generating token:", e);
        return { token: undefined, tempId: undefined }; 
    }
};

// --- NEW HELPER FUNCTION: Generate TS Number ---
const generateTSNumber = () => {
    return Math.random().toString(16).slice(2, 10).toUpperCase();
};
// ---------------------------------------------

const verifyUserToken = (req, res, next) => {
    const userToken = req.headers['x-auth-token'];
    if (!userToken) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    try {
        const decoded = jwt.verify(userToken, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

const verifyAdminToken = (req, res, next) => {
    const adminToken = req.headers['x-admin-token'];

    if (!adminToken || adminToken !== ADMIN_TOKEN) {
        return res.status(403).json({ message: 'Admin access denied' });
    }
    next();
};


// --- API Routes ---

// 1. POST /api/bookings/initiate (Start of the booking process - ADD TS)
app.post('/api/bookings/initiate', async (req, res) => {
    try {
        const { departureCity, destinationCity, departureDate, departureTime, passengers } = req.body; 
        
        const { token, tempId } = generateUserToken();
        const tsNumber = generateTSNumber(); 
        
        const initialBooking = new Booking({
            userId: tempId, 
            token: token,
            TS: tsNumber, 
            destinationCity,
            departureCity, 
            departureDate,
            departureTime,
            passengers,
            selectedSeats: [], 
            totalAmount: 0, 
            paymentStatus: 'Pending'
        });

        await initialBooking.save();

        // Send new booking notification to admin
        await sendNewBookingNotification(initialBooking);

        res.status(201).json({ 
            message: 'Booking initiated. Please select seats.',
            bookingId: initialBooking._id,
            userToken: token,
            tsNumber: tsNumber 
        });

    } catch (error) {
        console.error('Error initiating booking:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// 2. PUT /api/bookings/:id/seats (Update seats and total amount)
app.put('/api/bookings/:id/seats', verifyUserToken, async (req, res) => {
    try {
        const { selectedSeats, totalAmount } = req.body;
        const bookingId = req.params.id;
        const userTokenId = req.user.id; 

        if (!selectedSeats || !totalAmount) {
            return res.status(400).json({ message: 'Missing selectedSeats or totalAmount' });
        }

        const booking = await Booking.findById(bookingId);

        if (!booking || booking.userId.toString() !== userTokenId) {
             return res.status(404).json({ message: 'Booking not found or access denied' });
        }

        booking.selectedSeats = selectedSeats;
        booking.totalAmount = totalAmount;
        
        await booking.save();

        res.json({ message: 'Seats and amount updated successfully', booking });

    } catch (error) {
        console.error('Error updating seats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});


// 3. POST /api/bookings/:id/submit (CLOUDINARY INTEGRATION)
app.post('/api/bookings/:id/submit', verifyUserToken, upload.single('screenshot'), async (req, res) => {
    let cloudinaryResult;
    let tsNumberToReturn = 'N/A';
    
    try {
        const bookingId = req.params.id;
        const userTokenId = req.user.id;
        const { userName, userPhone, userEmail } = req.body;
        
        // 1. Check File Buffer
        if (!req.file || !req.file.buffer) {
             return res.status(400).json({ message: 'Missing payment screenshot file.' });
        }
        
        // 2. Cloudinary Upload
        const base64Image = Buffer.from(req.file.buffer).toString('base64');
        const dataUri = `data:${req.file.mimetype};base64,${base64Image}`;

        cloudinaryResult = await cloudinary.uploader.upload(dataUri, {
            folder: 'shree-ram-travels-proofs',
            public_id: `${bookingId}_${Date.now()}`
        });

        const imageUrl = cloudinaryResult.secure_url;

        // 3. Validate booking and update DB
        const booking = await Booking.findById(bookingId);
        
        if (!booking || booking.userId.toString() !== userTokenId) {
             // Delete the file from Cloudinary if validation fails
             if (cloudinaryResult && cloudinaryResult.public_id) {
                 await cloudinary.uploader.destroy(cloudinaryResult.public_id);
             }
             return res.status(404).json({ message: 'Booking not found or access denied.' });
        }
        
        tsNumberToReturn = booking.TS; // Capture TS number before save

        // Update payment status to 'Processing' and save user details
        booking.paymentStatus = 'Processing';
        booking.userName = userName;
        booking.userPhone = userPhone;
        booking.userEmail = userEmail;
        booking.screenshotPath = imageUrl; 
        await booking.save();

        // 4. Notify Admin
        console.log('📧 Attempting to send admin notification email...');
        console.log('Admin Email:', ADMIN_EMAIL);
        console.log('Booking TS:', booking.TS);
        await sendAdminNotification(booking, imageUrl);
        console.log('📧 Email notification function completed');

        // --- FIX: RETURN TS NUMBER ---
        res.json({ 
            message: 'Submission successful! Your payment is under verification.', 
            bookingId: booking._id,
            tsNumber: tsNumberToReturn // RETURN TS NUMBER
        });
        // ---------------------------------------------------

    } catch (error) {
        console.error('Error processing submission (Cloudinary/Email):', error);
        // Clean up Cloudinary upload on server crash
        if (cloudinaryResult && cloudinaryResult.public_id) {
            await cloudinary.uploader.destroy(cloudinaryResult.public_id);
        }
        res.status(500).json({ message: 'Server error during submission.' });
    }
});


// 4. PUT /api/admin/bookings/:id/verify (Admin changes status)
app.put('/api/admin/bookings/:id/verify', verifyAdminToken, async (req, res) => {
    try {
        const bookingId = req.params.id;
        const { status } = req.body; 

        if (status !== 'Paid' && status !== 'Cancelled') {
            return res.status(400).json({ message: 'Invalid status provided.' });
        }

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid Booking ID format.' });
        }
        
        const booking = await Booking.findByIdAndUpdate(
            bookingId,
            { paymentStatus: status },
            { new: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        
        // Send notification email to customer
        console.log('📧 Sending customer notification...');
        await sendCustomerNotification(booking, status);
        
        res.json({ message: `Booking ${bookingId} status updated to ${status}.`, booking });

    } catch (error) {
        console.error('Error verifying payment:', error);
        res.status(500).json({ message: 'Server error during verification.' });
    }
});


// 5. GET /api/admin/bookings (Admin Dashboard Data)
app.get('/api/admin/bookings', verifyAdminToken, async (req, res) => {
    try {
        const bookings = await Booking.find({})
            .sort({ bookingDate: -1 }) 
            .select('-token'); 

        res.json(bookings);

    } catch (error) {
        console.error('Error fetching admin bookings:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 6. GET /api/seats/occupied (Get all seats from PAID bookings for a trip)
app.get('/api/seats/occupied', async (req, res) => {
    try {
        const { destination, date, time } = req.query;

        if (!destination || !date || !time) {
            return res.status(400).json({ message: 'Missing destination, date, or time query parameters.' });
        }

        const paidBookings = await Booking.find({
            destinationCity: destination,
            departureTime: time, 
            departureDate: { 
                $gte: new Date(date), 
                $lt: new Date(new Date(date).getTime() + 24 * 60 * 60 * 1000) 
            }, 
            paymentStatus: 'Paid'
        }).select('selectedSeats'); 

        const occupiedSeats = paidBookings.reduce((acc, booking) => {
            return acc.concat(booking.selectedSeats);
        }, []);

        res.json({ occupiedSeats });

    } catch (error) {
        console.error('Error fetching occupied seats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// 7. GET /api/bookings/status/:ts (Enhanced route to check booking status with full details)
app.get('/api/bookings/status/:ts', async (req, res) => {
    try {
        const tsNumber = req.params.ts;
        
        // Get full booking details instead of limited fields
        const booking = await Booking.findOne({ TS: tsNumber }); 
        
        if (!booking) {
            return res.status(404).json({ message: 'Tracking Number not found.' });
        }

        // Enhanced response with all requested details
        const trackingDetails = {
            // Basic tracking info
            tsNumber: booking.TS,
            status: booking.paymentStatus,
            amount: booking.totalAmount,
            
            // Passenger details
            passengerName: booking.userName || 'Not provided',
            contactNumber: booking.userPhone || 'Not provided',
            email: booking.userEmail || 'Not provided',
            
            // Trip details
            route: `${booking.departureCity} → ${booking.destinationCity}`,
            pickupLocation: booking.departureCity,
            dropLocation: booking.destinationCity,
            travelDate: booking.departureDate,
            departureTime: booking.departureTime,
            selectedSeats: booking.selectedSeats,
            passengers: booking.passengers,
            
            // Booking metadata
            bookingDate: booking.bookingDate,
            
            // Bus provider contact details
            busProvider: {
                name: 'Shree Ram Tour and Travels',
                phone: '+91 98709 95956',
                email: 'harishkumarsaini18@gmail.com',
                address: 'Nathuwa wala, Dehradun, Uttarakhand-248008',
                website: 'https://shree-ram-travels.vercel.app'
            },
            
            // Status-specific information
            statusInfo: {
                isPaid: booking.paymentStatus === 'Paid',
                isPending: booking.paymentStatus === 'Pending',
                isProcessing: booking.paymentStatus === 'Processing',
                isCancelled: booking.paymentStatus === 'Cancelled'
            }
        };

        res.json(trackingDetails);
        
    } catch(error) {
        console.error('Error retrieving booking status:', error);
        res.status(500).json({ message: 'Internal server error while retrieving status.' });
    }
});

// 8. DELETE /api/admin/bookings/:id (Admin deletes a booking)
app.delete('/api/admin/bookings/:id', verifyAdminToken, async (req, res) => {
    try {
        const bookingId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid Booking ID format.' });
        }

        const booking = await Booking.findByIdAndDelete(bookingId);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found.' });
        }
        
        if (booking.screenshotPath) {
             try {
                // Cloudinary cleanup logic is complex; skipping explicit deletion here
                console.log(`Cloudinary file deletion skipped. Proof URL: ${booking.screenshotPath}`);
             } catch (fileError) {
                console.warn('Cloudinary cleanup failed:', fileError.message);
             }
        }

        res.json({ message: `Booking ${bookingId} and associated data deleted successfully.` });

    } catch (error) {
        console.error('Error deleting booking:', error);
        res.status(500).json({ message: 'Server error during deletion.' });
    }
});


// 9. GET /api/routes/all (Fetch all defined routes and destinations)
app.get('/api/routes/all', async (req, res) => {
    try {
        const routes = await Route.find({ isActive: true }).select('departure destination availableTime');
        
        const departureCities = [...new Set(routes.map(r => r.departure))].sort();
        const destinationCities = [...new Set(routes.map(r => r.destination))].sort();

        res.json({ routes, departureCities, destinationCities });
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ message: 'Server error fetching routes.' });
    }
});

// 10. POST /api/admin/routes (Add a new route)
app.post('/api/admin/routes', verifyAdminToken, async (req, res) => {
    try {
        const { departure, destination, availableTime } = req.body;
        
        const newRoute = new Route({ departure, destination, availableTime });
        await newRoute.save();
        
        res.status(201).json({ message: 'New route added successfully.', route: newRoute });
    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({ message: 'Error: This route already exists.' });
        }
        console.error('Error adding new route:', error);
        res.status(500).json({ message: 'Server error adding route.' });
    }
});

// 11. DELETE /api/admin/routes/:id (Remove a route)
app.delete('/api/admin/routes/:id', verifyAdminToken, async (req, res) => {
    try {
        const routeId = req.params.id;
        
        if (!mongoose.Types.ObjectId.isValid(routeId)) {
            return res.status(400).json({ message: 'Invalid Route ID format.' });
        }

        const result = await Route.findByIdAndUpdate(routeId, { isActive: false }, { new: true });
        
        if (!result) {
            return res.status(404).json({ message: 'Route not found.' });
        }
        
        res.json({ message: 'Route successfully deactivated (deleted).' });
    } catch (error) {
        console.error('Error deleting route:', error);
        res.status(500).json({ message: 'Server error deleting route.' });
    }
});


// 12. PUT /api/admin/routes/:id (Edit route timings)
app.put('/api/admin/routes/:id', verifyAdminToken, async (req, res) => {
    try {
        const routeId = req.params.id;
        const { availableTime } = req.body;

        if (!mongoose.Types.ObjectId.isValid(routeId)) {
            return res.status(400).json({ message: 'Invalid Route ID format.' });
        }
        
        if (!availableTime || !Array.isArray(availableTime) || availableTime.length === 0) {
            return res.status(400).json({ message: 'Available time must be a non-empty array.' });
        }

        const result = await Route.findByIdAndUpdate(
            routeId,
            { availableTime: availableTime },
            { new: true }
        );

        if (!result) {
            return res.status(404).json({ message: 'Route not found.' });
        }
        
        res.json({ message: 'Route timings updated successfully.', route: result });
    } catch (error) {
        console.error('Error updating route timings:', error);
        res.status(500).json({ message: 'Server error updating route timings.' });
    }
});
// 13. GET /api/bookings/:id/ts (Fetch TS code by MongoDB _id)
app.get('/api/bookings/:id/ts', async (req, res) => {
    try {
        const bookingId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(bookingId)) {
            return res.status(400).json({ message: 'Invalid Booking ID format.' });
        }
        
        // Find the booking record and select only the TS field
        const booking = await Booking.findById(bookingId).select('TS');
        
        if (!booking || !booking.TS) {
            return res.status(404).json({ message: 'Booking not found or TS code is missing.' });
        }

        res.json({ tsNumber: booking.TS });
        
    } catch(error) {
        console.error('Error retrieving TS code:', error);
        res.status(500).json({ message: 'Internal server error while retrieving status.' });
    }
});

// ============================================
// SEAT MANAGEMENT ENDPOINTS (Admin Only)
// ============================================

// GET /api/admin/seats/route/:routeId - Get all seats for a specific route and time
app.get('/api/admin/seats/route/:routeId', verifyAdminToken, async (req, res) => {
    try {
        const { routeId } = req.params;
        const { departureTime, departureDate } = req.query;

        if (!departureTime || !departureDate) {
            return res.status(400).json({ 
                message: 'departureTime and departureDate are required' 
            });
        }

        const seats = await Seat.find({
            routeId,
            departureTime,
            createdAt: {
                $gte: new Date(departureDate),
                $lt: new Date(new Date(departureDate).getTime() + 24 * 60 * 60 * 1000)
            }
        }).sort({ deck: 1, row: 1, column: 1 });

        res.json({ seats, totalSeats: seats.length });
    } catch (error) {
        console.error('Error fetching seats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/admin/seats/:seatId/block - Block a seat
app.put('/api/admin/seats/:seatId/block', verifyAdminToken, async (req, res) => {
    try {
        const { seatId } = req.params;
        const { reason, blockedUntil } = req.body;

        if (!reason) {
            return res.status(400).json({ message: 'Reason for blocking is required' });
        }

        const seat = await Seat.findByIdAndUpdate(
            seatId,
            {
                isBlocked: true,
                status: 'blocked',
                blockedReason: reason,
                blockedUntil: blockedUntil || null
            },
            { new: true }
        );

        if (!seat) {
            return res.status(404).json({ message: 'Seat not found' });
        }

        res.json({ message: 'Seat blocked successfully', seat });
    } catch (error) {
        console.error('Error blocking seat:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/admin/seats/:seatId/unblock - Unblock a seat
app.put('/api/admin/seats/:seatId/unblock', verifyAdminToken, async (req, res) => {
    try {
        const { seatId } = req.params;

        const seat = await Seat.findByIdAndUpdate(
            seatId,
            {
                isBlocked: false,
                status: 'available',
                blockedReason: null,
                blockedUntil: null
            },
            { new: true }
        );

        if (!seat) {
            return res.status(404).json({ message: 'Seat not found' });
        }

        res.json({ message: 'Seat unblocked successfully', seat });
    } catch (error) {
        console.error('Error unblocking seat:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/admin/seats/:seatId/price - Update seat price
app.put('/api/admin/seats/:seatId/price', verifyAdminToken, async (req, res) => {
    try {
        const { seatId } = req.params;
        const { currentPrice } = req.body;

        if (!currentPrice || currentPrice <= 0) {
            return res.status(400).json({ message: 'Valid price is required' });
        }

        const seat = await Seat.findByIdAndUpdate(
            seatId,
            { currentPrice },
            { new: true }
        );

        if (!seat) {
            return res.status(404).json({ message: 'Seat not found' });
        }

        res.json({ message: 'Seat price updated', seat });
    } catch (error) {
        console.error('Error updating seat price:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST /api/admin/seats/bulk-block - Block multiple seats at once
app.post('/api/admin/seats/bulk-block', verifyAdminToken, async (req, res) => {
    try {
        const { seatIds, reason, blockedUntil } = req.body;

        if (!Array.isArray(seatIds) || seatIds.length === 0) {
            return res.status(400).json({ message: 'seatIds array is required' });
        }

        const result = await Seat.updateMany(
            { _id: { $in: seatIds } },
            {
                isBlocked: true,
                status: 'blocked',
                blockedReason: reason || 'Bulk blocked',
                blockedUntil: blockedUntil || null
            }
        );

        res.json({ 
            message: `${result.modifiedCount} seats blocked successfully`,
            modifiedCount: result.modifiedCount
        });
    } catch (error) {
        console.error('Error bulk blocking seats:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// PRICING MANAGEMENT ENDPOINTS (Admin Only)
// ============================================

// POST /api/admin/pricing/route/:routeId - Set pricing for a route/time
app.post('/api/admin/pricing/route/:routeId', verifyAdminToken, async (req, res) => {
    try {
        const { routeId } = req.params;
        const { departureTime, basePriceUpper, basePriceLower, surgeMultiplier, effectiveDate, expiryDate } = req.body;

        const pricing = new RoutePrice({
            routeId,
            departureTime,
            basePriceUpper,
            basePriceLower,
            surgeMultiplier: surgeMultiplier || 1.0,
            effectiveDate,
            expiryDate
        });

        await pricing.save();
        res.status(201).json({ message: 'Pricing created', pricing });
    } catch (error) {
        console.error('Error creating pricing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// GET /api/admin/pricing/route/:routeId - Get pricing for a route
app.get('/api/admin/pricing/route/:routeId', verifyAdminToken, async (req, res) => {
    try {
        const { routeId } = req.params;

        const pricing = await RoutePrice.find({ routeId, isActive: true });
        res.json({ pricing });
    } catch (error) {
        console.error('Error fetching pricing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// PUT /api/admin/pricing/:priceId - Update pricing
app.put('/api/admin/pricing/:priceId', verifyAdminToken, async (req, res) => {
    try {
        const { priceId } = req.params;
        const { basePriceUpper, basePriceLower, surgeMultiplier } = req.body;

        const pricing = await RoutePrice.findByIdAndUpdate(
            priceId,
            { basePriceUpper, basePriceLower, surgeMultiplier },
            { new: true }
        );

        if (!pricing) {
            return res.status(404).json({ message: 'Pricing not found' });
        }

        res.json({ message: 'Pricing updated', pricing });
    } catch (error) {
        console.error('Error updating pricing:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ============================================
// SEAT AVAILABILITY ENDPOINTS (Public)
// ============================================

// GET /api/seats/availability/:routeId - Get seat availability with pricing for a specific trip
app.get('/api/seats/availability/:routeId', async (req, res) => {
    try {
        const { routeId } = req.params;
        const { departureTime, departureDate } = req.query;

        if (!departureTime || !departureDate) {
            return res.status(400).json({ 
                message: 'departureTime and departureDate are required' 
            });
        }

        // Get all seats for this trip
        const seats = await Seat.find({
            routeId,
            departureTime,
            createdAt: {
                $gte: new Date(departureDate),
                $lt: new Date(new Date(departureDate).getTime() + 24 * 60 * 60 * 1000)
            }
        });

        // Get pricing info
        const pricing = await RoutePrice.findOne({
            routeId,
            departureTime,
            effectiveDate: { $lte: new Date(departureDate) },
            expiryDate: { $gte: new Date(departureDate) },
            isActive: true
        });

        res.json({ 
            seats,
            pricing,
            totalSeats: seats.length,
            availableSeats: seats.filter(s => s.status === 'available').length,
            occupiedSeats: seats.filter(s => s.status === 'occupied').length,
            blockedSeats: seats.filter(s => s.status === 'blocked').length
        });
    } catch (error) {
        console.error('Error fetching seat availability:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Root route for health check
app.get('/', (req, res) => {
    res.json({ 
        status: 'Server is running',
        message: 'Shree Ram Tour and Travels API',
        endpoints: {
            routes: '/api/routes/all',
            bookings: '/api/bookings/initiate',
            tracking: '/api/bookings/status/:ts'
        }
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin Email: ${ADMIN_EMAIL}`);
});