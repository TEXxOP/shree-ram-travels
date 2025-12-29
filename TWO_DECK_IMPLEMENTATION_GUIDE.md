# Two-Deck Bus Layout with Individual Seat Pricing - Implementation Guide

## Overview

This guide provides step-by-step instructions to implement:
1. **Two-deck bus layout** (Upper & Lower decks with 20 seats each)
2. **Individual seat pricing** (Different prices per seat)
3. **Admin seat availability controls** (Block/unblock seats)
4. **Dynamic pricing management** (Per route, per time, per seat category)

---

## Phase 1: Database Schema Enhancement

### Step 1.1: Create Seat Model

Create `server/models/Seat.js`:

```javascript
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
```

### Step 1.2: Create SeatCategory Model

Create `server/models/SeatCategory.js`:

```javascript
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
```

### Step 1.3: Create RoutePrice Model

Create `server/models/RoutePrice.js`:

```javascript
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
```

---

## Phase 2: Backend API Enhancements

### Step 2.1: Add Seat Management Endpoints

Add to `server/server.js`:

```javascript
// Import new models
const Seat = require('./models/Seat');
const SeatCategory = require('./models/SeatCategory');
const RoutePrice = require('./models/RoutePrice');

// ============================================
// SEAT MANAGEMENT ENDPOINTS (Admin Only)
// ============================================

// 1. GET /api/admin/seats/route/:routeId
// Get all seats for a specific route and time
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

// 2. PUT /api/admin/seats/:seatId/block
// Block a seat (maintenance, damage, etc.)
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

// 3. PUT /api/admin/seats/:seatId/unblock
// Unblock a seat
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

// 4. PUT /api/admin/seats/:seatId/price
// Update seat price
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

// 5. POST /api/admin/seats/bulk-block
// Block multiple seats at once
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

// 6. POST /api/admin/pricing/route/:routeId
// Set pricing for a route/time
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

// 7. GET /api/admin/pricing/route/:routeId
// Get pricing for a route
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

// 8. PUT /api/admin/pricing/:priceId
// Update pricing
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

// 9. GET /api/seats/availability/:routeId
// Get seat availability with pricing for a specific trip
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
```

---

## Phase 3: Frontend Component Updates

### Step 3.1: Update SeatSelectionPage.js

Key changes needed:

```javascript
// Replace hardcoded prices with API-fetched prices
const [seatPricing, setSeatPricing] = useState({});
const [routePricing, setRoutePricing] = useState(null);

// New effect to fetch pricing
useEffect(() => {
    const fetchSeatPricing = async () => {
        try {
            const response = await axios.get(
                `${RENDER_API_URL}/api/seats/availability/${routeId}`,
                { params: { departureTime: tripDetails.time, departureDate: tripDetails.date } }
            );
            
            // Build pricing map
            const pricingMap = {};
            response.data.seats.forEach(seat => {
                pricingMap[seat.seatId] = seat.currentPrice;
            });
            
            setSeatPricing(pricingMap);
            setRoutePricing(response.data.pricing);
        } catch (err) {
            console.error('Error fetching pricing:', err);
        }
    };
    
    if (tripDetails) {
        fetchSeatPricing();
    }
}, [tripDetails]);

// Update price calculation
const totalAmount = selectedSeats.reduce((sum, seatId) => {
    const price = seatPricing[seatId] || 0;
    return sum + price;
}, 0);

// Update Seat component to use dynamic pricing
const price = seatPricing[id] || 0;
```

---

## Phase 4: Admin Dashboard Enhancements

### Step 4.1: Add Seat Management Panel

Add to AdminDashboard.js:

```javascript
// New state for seat management
const [selectedSeatsForBlock, setSelectedSeatsForBlock] = useState([]);
const [blockReason, setBlockReason] = useState('');
const [seatManagementTab, setSeatManagementTab] = useState('view');

// Function to block seats
const handleBlockSeats = async () => {
    if (selectedSeatsForBlock.length === 0) {
        setError('Please select seats to block');
        return;
    }

    try {
        await axios.post(
            `${RENDER_API_URL}/api/admin/seats/bulk-block`,
            { 
                seatIds: selectedSeatsForBlock, 
                reason: blockReason 
            },
            { headers: { 'x-admin-token': MOCK_ADMIN_TOKEN } }
        );
        
        setSelectedSeatsForBlock([]);
        setBlockReason('');
        setError('Seats blocked successfully');
    } catch (err) {
        setError('Failed to block seats');
    }
};
```

---

## Phase 5: Initialization Script

Create `server/scripts/initializeSeats.js`:

```javascript
const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Route = require('../models/Route');
require('dotenv').config();

const SEAT_LAYOUT = {
    Upper: [
        ['U-A1', null, 'U-C1', 'U-D1'],
        ['U-A2', null, 'U-C2', 'U-D2'],
        ['U-A3', null, 'U-C3', 'U-D3'],
        ['U-A4', null, 'U-C4', 'U-D4'],
        ['U-A5', null, 'U-C5', 'U-D5'],
        ['U-A6', null, 'U-C6', 'U-D6'],
        ['U-A7', 'U-B7', 'U-C7', 'U-D7']
    ],
    Lower: [
        ['L-A1', null, 'L-C1', 'L-D1'],
        ['L-A2', null, 'L-C2', 'L-D2'],
        ['L-A3', null, 'L-C3', 'L-D3'],
        ['L-A4', null, 'L-C4', 'L-D4'],
        ['L-A5', null, 'L-C5', 'L-D5'],
        ['L-A6', null, 'L-C6', 'L-D6'],
        ['L-A7', 'L-B7', 'L-C7', 'L-D7']
    ]
};

async function initializeSeats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const routes = await Route.find({ isActive: true });

        for (const route of routes) {
            for (const time of route.availableTime) {
                // Create seats for each deck
                for (const [deck, layout] of Object.entries(SEAT_LAYOUT)) {
                    let row = 1;
                    for (const rowSeats of layout) {
                        let col = 0;
                        for (const seatId of rowSeats) {
                            if (seatId) {
                                const basePrice = deck === 'Upper' ? 599 : 699;
                                
                                await Seat.updateOne(
                                    { 
                                        routeId: route._id, 
                                        departureTime: time, 
                                        seatId 
                                    },
                                    {
                                        routeId: route._id,
                                        departureTime: time,
                                        seatId,
                                        deck,
                                        row,
                                        column: String.fromCharCode(65 + col),
                                        basePrice,
                                        currentPrice: basePrice,
                                        status: 'available'
                                    },
                                    { upsert: true }
                                );
                            }
                            col++;
                        }
                        row++;
                    }
                }
            }
        }

        console.log('Seats initialized successfully');
        process.exit(0);
    } catch (error) {
        console.error('Error initializing seats:', error);
        process.exit(1);
    }
}

initializeSeats();
```

Run with: `node server/scripts/initializeSeats.js`

---

## Testing Checklist

- [ ] Seat model creates/updates correctly
- [ ] Admin can block/unblock seats
- [ ] Pricing updates reflect in frontend
- [ ] Occupied seats show correctly
- [ ] Bulk operations work
- [ ] Email notifications still work
- [ ] Payment flow unchanged
- [ ] Mobile responsive

---

## Deployment Steps

1. Create new models in `server/models/`
2. Add new endpoints to `server/server.js`
3. Update frontend components
4. Run initialization script
5. Test all flows
6. Deploy to Render/Vercel
