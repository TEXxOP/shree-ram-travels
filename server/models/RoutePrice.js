const mongoose = require('mongoose');

const RoutePriceSchema = new mongoose.Schema({
  routeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Route',
    required: true
  },
  departureTime: {
    type: String,
    required: true  // e.g., "07:00 AM"
  },
  basePriceUpper: {
    type: Number,
    required: true  // Base price for upper deck
  },
  basePriceLower: {
    type: Number,
    required: true  // Base price for lower deck
  },
  surgeMultiplier: {
    type: Number,
    default: 1.0  // 1.0 = normal, 1.2 = 20% surge
  },
  effectiveDate: {
    type: Date,
    required: true
  },
  expiryDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
RoutePriceSchema.index({ routeId: 1, departureTime: 1, effectiveDate: 1 });

module.exports = mongoose.model('RoutePrice', RoutePriceSchema);