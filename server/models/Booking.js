// server/models/Booking.js - ADDED TS FIELD

const mongoose = require('mongoose');

// Define the Booking schema
const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: false 
    },
    token: {
        type: String, 
        required: false
    },
    // --- NEW TS FIELD ---
    TS: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    // --------------------
    departureCity: {
        type: String,
        required: true,
        trim: true
    },
    destinationCity: {
        type: String,
        required: true,
        trim: true
    },
    departureDate: {
        type: Date,
        required: true
    },
    departureTime: {
        type: String, 
        required: true
    },
    passengers: {
        type: Number,
        required: true
    },
    selectedSeats: {
        type: [String], 
        required: true
    },
    totalAmount: {
        type: Number,
        required: true
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Cancelled', 'Processing'], 
        default: 'Pending',
        required: true
    },
    userName: { type: String, required: false },
    userPhone: { type: String, required: false },
    userEmail: { type: String, required: false },
    screenshotPath: { type: String, required: false },
    
    bookingDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Booking', bookingSchema);