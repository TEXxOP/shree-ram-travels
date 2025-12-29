const mongoose = require('mongoose');
const Seat = require('../models/Seat');
const Route = require('../models/Route');
require('dotenv').config();

const SEAT_LAYOUT = {
    Upper: [
        ['U-A1', 'U-B1', 'U-C1'],
        ['U-A2-BLOCKED', 'U-B2', 'U-C2'],
        ['U-A3', 'U-B3', 'U-C3'],
        ['U-A4', 'U-B4-BLOCKED', 'U-C4-BLOCKED'],
        ['U-A5-BLOCKED', 'U-B5', 'U-C5'],
        ['U-A6']
    ],
    Lower: [
        ['L-A1', 'L-B1', 'L-C1'],
        ['L-A2-BLOCKED', 'L-B2', 'L-C2'],
        ['L-A3-BLOCKED', 'L-B3', 'L-C3'],
        ['L-A4', 'L-B4-BLOCKED', 'L-C4-BLOCKED'],
        ['L-A5-BLOCKED', 'L-B5', 'L-C5'],
        ['L-A6']
    ]
};

async function initializeSeats() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const routes = await Route.find({ isActive: true });
        console.log(`Found ${routes.length} active routes`);

        for (const route of routes) {
            console.log(`Processing route: ${route.departure} → ${route.destination}`);
            
            for (const time of route.availableTime) {
                console.log(`  Processing time: ${time}`);
                
                // Create seats for each deck
                for (const [deck, layout] of Object.entries(SEAT_LAYOUT)) {
                    let row = 1;
                    for (const rowSeats of layout) {
                        let col = 0;
                        for (const seatId of rowSeats) {
                            if (seatId) {
                                const cleanSeatId = seatId.replace('-BLOCKED', '');
                                const isBlocked = seatId.includes('BLOCKED');
                                const basePrice = deck === 'Upper' ? 599 : 699;
                                
                                await Seat.updateOne(
                                    { 
                                        routeId: route._id, 
                                        departureTime: time, 
                                        seatId: cleanSeatId 
                                    },
                                    {
                                        routeId: route._id,
                                        departureTime: time,
                                        seatId: cleanSeatId,
                                        deck,
                                        row,
                                        column: String.fromCharCode(65 + col),
                                        basePrice,
                                        currentPrice: basePrice,
                                        status: isBlocked ? 'blocked' : 'available',
                                        isBlocked: isBlocked,
                                        blockedReason: isBlocked ? 'Initial layout blocked' : null
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

        console.log('✅ Seats initialized successfully');
        
        // Show summary
        const totalSeats = await Seat.countDocuments();
        console.log(`Total seats in database: ${totalSeats}`);
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error initializing seats:', error);
        process.exit(1);
    }
}

initializeSeats();