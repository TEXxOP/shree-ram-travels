const mongoose = require('mongoose');

const SeatSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  departureTime: {
    type: String,
    required: true  // e.g., "07:00 AM"
  },
  seatId: {
    type: String,
    required: true  // e.g., "U-A1", "L-C2"
  },
  deck: {
    type: String,
    enum: ['Upper', 'Lower'],
    required: true
  },
  row: {
    type: Number,
    required: true
  },
  column: {
    type: String,
    required: true  // "A", "B", "C", "D"
  },
  basePrice: {
    type: Number,
    required: true  // Base price for this seat
  },
  currentPrice: {
    type: Number,
    required: true  // Current price (may differ due to surge)
  },
  category: {
    type: String,
    enum: ['standard', 'premium', 'accessible'],
    default: 'standard'
  },
  status: {
    type: String,
    enum: ['available', 'occupied', 'blocked', 'maintenance'],
    default: 'available'
  },
  isBlocked: {
    type: Boolean,
    default: false
  },
  blockedReason: {
    type: String,
    default: null  // "Maintenance", "Damaged", "Reserved"
  },
  blockedUntil: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for unique seat per route/time
SeatSchema.index({ routeId: 1, departureTime: 1, seatId: 1 }, { unique: true });

module.exports = mongoose.model('Seat', SeatSchema);