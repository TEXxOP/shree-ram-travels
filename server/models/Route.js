// server/models/Route.js

const mongoose = require('mongoose');

const RouteSchema = new mongoose.Schema({
    // Example: "Dehradun"
    departure: {
        type: String,
        required: true,
        trim: true,
    },
    // Example: "Jaipur"
    destination: {
        type: String,
        required: true,
        trim: true,
    },
    // Example: "9:00 AM" (You may want to manage these separately in a real app)
    availableTime: {
        type: [String], // Array of available departure times
        required: true,
        default: ['07:00 AM', '11:00 AM', '03:00 PM', '11:00 PM'] 
    },
    isActive: {
        type: Boolean,
        default: true
    },
});

RouteSchema.index({ departure: 1, destination: 1 }, { unique: true });

module.exports = mongoose.model('Route', RouteSchema);