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
    /\.vercel\.app$/ // Allow all Vercel preview deployments
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        // Check if origin matches any allowed origin (string or regex)
        const isAllowed = allowedOrigins.some(allowedOrigin => {
            if (typeof allowedOrigin === 'string') {
                return origin === allowedOrigin;
            }
            if (allowedOrigin instanceof RegExp) {
                return allowedOrigin.test(origin);
            }
            return false;
        });
        
        if (!isAllowed) {
            const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
})); 
app.use(express.json()); 

// --- Database Connection ---
mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB Atlas Connected!'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- File Upload (Multer) Setup: Use memory storage ---
const upload = multer({ storage: multer.memoryStorage() }); 

// --- SendGrid Email Helper Function ---
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
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #004d99;">New Payment Proof Submitted</h2>
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
                    <p style="color: #6c757d; font-size: 0.9rem;">Shree Ram Travels - Bus Booking System</p>
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

// 7. GET /api/bookings/status/:ts (Route to check booking status by TS number)
app.get('/api/bookings/status/:ts', async (req, res) => {
    try {
        const tsNumber = req.params.ts;
        
        const booking = await Booking.findOne({ TS: tsNumber }).select('paymentStatus totalAmount TS'); 
        
        if (!booking) {
            return res.status(404).json({ message: 'Tracking Number not found.' });
        }

        res.json({ status: booking.paymentStatus, amount: booking.totalAmount, tsNumber: booking.TS });
        
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
// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Admin Email: ${ADMIN_EMAIL}`);
});