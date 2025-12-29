const mongoose = require('mongoose');

const SeatCategorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true  // "Standard", "Premium", "Accessible"
  },
  priceMultiplier: {
    type: Number,
    required: true,
    default: 1.0  // 1.0 = base price, 1.5 = 50% more, 0.8 = 20% less
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: '💺'  // Emoji or icon identifier
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

module.exports = mongoose.model('SeatCategory', SeatCategorySchema);