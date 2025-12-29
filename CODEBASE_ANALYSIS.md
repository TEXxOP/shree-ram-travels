# 🚌 Bus Booking System - Codebase Analysis & Architecture

## Executive Summary

This is a **production-ready MERN bus booking system** with:
- ✅ Real-time seat selection (currently single-deck layout)
- ✅ Payment proof verification workflow
- ✅ Admin dashboard with booking management
- ✅ Route management system
- ✅ Email notifications (SendGrid)
- ✅ Cloudinary image storage
- ✅ JWT authentication

**Current Status**: Functional but needs enhancement for **two-deck layout with individual seat pricing and admin controls**.

---

## 1. CURRENT SYSTEM ARCHITECTURE

### 1.1 Technology Stack

**Frontend:**
- React 19.2.0 with React Router DOM 7.9.5
- Axios for API calls
- QRCode.react for UPI payment QR codes
- Custom CSS (no UI framework)
- Responsive design with mobile-first approach

**Backend:**
- Node.js + Express 5.1.0
- MongoDB + Mongoose 8.19.3
- JWT for authentication
- SendGrid for email notifications
- Cloudinary for image storage
- Multer for file uploads

**Deployment:**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas
- Storage: Cloudinary

---

## 2. DATABASE MODELS

### 2.1 Booking Model (`server/models/Booking.js`)

```javascript
{
  userId: ObjectId,                    // Guest user reference
  token: String,                       // JWT token for session
  TS: String,                          // Unique 8-char tracking code
  departureCity: String,               // e.g., "Dehradun"
  destinationCity: String,             // e.g., "Jaipur"
  departureDate: Date,                 // Travel date
  departureTime: String,               // e.g., "07:00 AM"
  passengers: Number,                  // Number of passengers
  selectedSeats: [String],             // e.g., ["U-A1", "L-C2"]
  totalAmount: Number,                 // Total fare
  paymentStatus: String,               // "Pending" | "Processing" | "Paid" | "Cancelled"
  userName: String,                    // Customer name
  userPhone: String,                   // 10-digit phone
  userEmail: String,                   // For ticket delivery
  screenshotPath: String,              // Cloudinary URL of payment proof
  bookingDate: Date                    // Booking creation timestamp
}
```

**Key Issues:**
- ❌ No individual seat pricing (all seats same price)
- ❌ No seat availability controls for admins
- ❌ No deck information stored
- ❌ No seat status tracking (available/blocked/maintenance)

### 2.2 Route Model (`server/models/Route.js`)

```javascript
{
  departure: String,                   // e.g., "Dehradun"
  destination: String,                 // e.g., "Jaipur"
  availableTime: [String],             // e.g., ["07:00 AM", "11:00 AM"]
  isActive: Boolean                    // Soft delete flag
}
```

**Key Issues:**
- ❌ No seat inventory management
- ❌ No pricing configuration per route
- ❌ No bus capacity settings

---

## 3. CURRENT SEAT LAYOUT SYSTEM

### 3.1 Seat Map Structure (`client/src/components/SeatSelectionPage.js`)

**Current Layout (Single Deck - 40 seats total):**

```
UPPER DECK (20 seats):
Row 1: [U-A1] [AISLE] [U-C1] [U-D1] [WHEEL]
Row 2: [U-A2] [AISLE] [U-C2] [U-D2]
Row 3: [U-A3] [AISLE] [U-C3] [U-D3]
Row 4: [U-A4] [AISLE] [U-C4] [U-D4]
Row 5: [U-A5] [AISLE] [U-C5] [U-D5]
Row 6: [U-A6] [AISLE] [U-C6] [U-D6]
Row 7: [U-A7] [U-B7] [U-C7] [U-D7]

LOWER DECK (20 seats):
Row 1: [L-A1] [AISLE] [L-C1] [L-D1] [WHEEL]
Row 2: [L-A2] [AISLE] [L-C2] [L-D2]
Row 3: [L-A3] [AISLE] [L-C3] [L-D3]
Row 4: [L-A4] [AISLE] [L-C4] [L-D4]
Row 5: [L-A5] [AISLE] [L-C5] [L-D5]
Row 6: [L-A6] [AISLE] [L-C6] [L-D6]
Row 7: [L-A7] [L-B7] [L-C7] [L-D7]
```

**Current Pricing:**
```javascript
const UPPER_PRICE = 599.00;  // Upper deck cheaper
const LOWER_PRICE = 699.00;  // Lower deck more expensive
```

**Current Status Tracking:**
- ✅ Available (light blue/green)
- ✅ Selected (green)
- ✅ Occupied (red - from paid bookings)

---

## 4. API ENDPOINTS ANALYSIS

### 4.1 Booking Flow Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/api/bookings/initiate` | Start booking, generate TS code | None |
| PUT | `/api/bookings/:id/seats` | Update selected seats & amount | User Token |
| POST | `/api/bookings/:id/submit` | Submit payment proof | User Token |
| GET | `/api/bookings/status/:ts` | Track booking by TS code | None |
| GET | `/api/bookings/:id/ts` | Get TS code by booking ID | None |

### 4.2 Admin Endpoints

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/admin/bookings` | List all bookings | Admin Token |
| PUT | `/api/admin/bookings/:id/verify` | Approve/reject payment | Admin Token |
| DELETE | `/api/admin/bookings/:id` | Delete booking | Admin Token |
| POST | `/api/admin/routes` | Add new route | Admin Token |
| PUT | `/api/admin/routes/:id` | Edit route timings | Admin Token |
| DELETE | `/api/admin/routes/:id` | Deactivate route | Admin Token |

### 4.3 Seat Availability Endpoint

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/api/seats/occupied` | Get occupied seats for trip | None |

**Query Parameters:**
- `destination`: Destination city
- `date`: Travel date
- `time`: Departure time

**Returns:** Array of occupied seat IDs from PAID bookings only

---

## 5. FRONTEND COMPONENTS BREAKDOWN

### 5.1 HomePage.js
**Purpose:** Initial search and payment tracking

**Features:**
- Dynamic route selection (departure → destination)
- Date picker with minimum date validation
- Passenger count selector (1-50)
- Payment tracker with TS code lookup
- Real-time route loading from API

**Data Flow:**
```
User Input → POST /api/bookings/initiate → Store in localStorage → Navigate to Schedule
```

### 5.2 BusSchedulePage.js
**Purpose:** Display available departure times

**Features:**
- Fetch available times for selected route
- Mock pricing and seat availability
- Time selection with disabled state for sold-out

**Data Flow:**
```
GET /api/routes/all → Filter by departure/destination → Display times → Store selected time
```

### 5.3 SeatSelectionPage.js
**Purpose:** Interactive seat selection with real-time availability

**Features:**
- Dual-deck layout rendering
- Real-time occupied seat fetching
- Seat selection with passenger count validation
- Price calculation per seat
- Summary box with total amount

**Key Functions:**
```javascript
fetchOccupiedSeats()     // GET /api/seats/occupied
toggleSeat()             // Add/remove seat from selection
handleProceedToPayment() // PUT /api/bookings/:id/seats
```

**Current Pricing Logic:**
```javascript
const price = seatId.startsWith('U-') ? UPPER_PRICE : LOWER_PRICE;
```

### 5.4 PaymentPage.js
**Purpose:** Payment proof submission and booking confirmation

**Features:**
- UPI QR code generation
- Bank details display
- Payment proof screenshot upload
- Customer details form
- TS code display after submission
- Email notification trigger

**Data Flow:**
```
Form Submit → POST /api/bookings/:id/submit (with file) → 
Cloudinary Upload → Email to Admin → Show TS Code
```

### 5.5 AdminDashboard.js
**Purpose:** Admin management interface

**Features:**
- Admin token authentication
- Booking table with status filtering
- Payment verification (Approve/Reject)
- Booking deletion
- Route management (Add/Edit/Delete)
- Real-time data refresh

**Admin Actions:**
```javascript
handleVerifyPayment()    // PUT /api/admin/bookings/:id/verify
handleDeleteBooking()    // DELETE /api/admin/bookings/:id
handleAddRoute()         // POST /api/admin/routes
handleEditRoute()        // PUT /api/admin/routes/:id
handleDeleteRoute()      // DELETE /api/admin/routes/:id
```

---

## 6. CURRENT LIMITATIONS & GAPS

### 6.1 Seat Management Issues

| Issue | Impact | Severity |
|-------|--------|----------|
| No individual seat pricing control | Can't set different prices per seat | HIGH |
| No seat blocking/maintenance mode | Can't block damaged seats | MEDIUM |
| No seat category system | Can't differentiate seat types | HIGH |
| Pricing hardcoded in frontend | Can't change prices without code update | HIGH |
| No seat inventory per route | Can't manage capacity per trip | MEDIUM |

### 6.2 Admin Control Issues

| Issue | Impact | Severity |
|-------|--------|----------|
| No seat availability controls | Can't manually block/release seats | HIGH |
| No bulk seat management | Can't manage multiple seats at once | MEDIUM |
| No seat status dashboard | Can't visualize seat availability | MEDIUM |
| No pricing management UI | Can't adjust prices per route/seat | HIGH |

### 6.3 Data Model Issues

| Issue | Impact | Severity |
|-------|--------|----------|
| Booking model lacks seat metadata | Can't track seat details | MEDIUM |
| Route model lacks pricing info | Can't store dynamic pricing | HIGH |
| No Seat collection | Can't manage individual seat states | HIGH |
| No SeatCategory model | Can't differentiate seat types | MEDIUM |

---

## 7. IMPLEMENTATION ROADMAP FOR TWO-DECK WITH INDIVIDUAL PRICING

### Phase 1: Database Schema Enhancement

**New Models Needed:**

1. **Seat Model** - Track individual seat state
```javascript
{
  routeId: ObjectId,
  seatId: String,           // "U-A1", "L-C2"
  deck: String,             // "Upper" | "Lower"
  row: Number,
  column: String,
  basePrice: Number,
  currentPrice: Number,
  status: String,           // "available" | "occupied" | "blocked" | "maintenance"
  category: String,         // "standard" | "premium" | "accessible"
  isBlocked: Boolean,
  blockedReason: String,
  blockedUntil: Date
}
```

2. **SeatCategory Model** - Define seat types
```javascript
{
  name: String,             // "Standard", "Premium", "Accessible"
  priceMultiplier: Number,  // 1.0, 1.5, 0.8
  description: String,
  icon: String
}
```

3. **RoutePrice Model** - Dynamic pricing per route
```javascript
{
  routeId: ObjectId,
  departureTime: String,
  basePriceUpper: Number,
  basePriceLower: Number,
  surgeMultiplier: Number,  // For peak hours
  effectiveDate: Date,
  expiryDate: Date
}
```

### Phase 2: Backend API Enhancements

**New Endpoints:**

```
POST   /api/admin/seats/block/:seatId
PUT    /api/admin/seats/:seatId/status
GET    /api/admin/seats/route/:routeId
POST   /api/admin/pricing/route/:routeId
PUT    /api/admin/pricing/:priceId
GET    /api/seats/availability/:routeId
```

### Phase 3: Frontend Component Updates

**SeatSelectionPage.js Enhancements:**
- Dynamic pricing from API
- Seat category indicators
- Admin seat blocking visualization
- Real-time price updates

**AdminDashboard.js Enhancements:**
- Seat management panel
- Bulk seat operations
- Pricing configuration UI
- Seat status dashboard

### Phase 4: Admin Features

**New Admin Capabilities:**
- Block/unblock individual seats
- Set maintenance windows
- Configure dynamic pricing
- View seat utilization analytics
- Bulk seat operations

---

## 8. CURRENT BOOKING FLOW

```
┌─────────────────────────────────────────────────────────────┐
│ 1. HOME PAGE - Search & Track                               │
│    - Select From/To cities                                  │
│    - Pick date and passenger count                          │
│    - POST /api/bookings/initiate → Get bookingId & TS code │
│    - Store in localStorage                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. SCHEDULE PAGE - Choose Time                              │
│    - GET /api/routes/all → Filter by route                 │
│    - Display available times                                │
│    - Store selected time in localStorage                    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. SEAT SELECTION - Pick Seats                              │
│    - GET /api/seats/occupied → Get paid bookings            │
│    - Display dual-deck layout                               │
│    - User selects seats (max = passenger count)             │
│    - PUT /api/bookings/:id/seats → Save selection           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. PAYMENT PAGE - Submit Proof                              │
│    - Display UPI QR code                                    │
│    - User uploads payment screenshot                        │
│    - POST /api/bookings/:id/submit → Upload to Cloudinary  │
│    - Email sent to admin                                    │
│    - Show TS code to customer                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. ADMIN VERIFICATION                                       │
│    - Admin reviews payment proof                            │
│    - PUT /api/admin/bookings/:id/verify → Approve/Reject   │
│    - Email sent to customer                                 │
│    - Booking status updated to "Paid"                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 9. KEY CONFIGURATION VALUES

### Frontend Configuration

**SeatSelectionPage.js:**
```javascript
const UPPER_PRICE = 599.00;      // Upper deck price
const LOWER_PRICE = 699.00;      // Lower deck price
const SEAT_MAP_LAYOUT = {...}    // Dual-deck layout
```

**API Base URL (Auto-detection):**
```javascript
const API_BASE_URL = process.env.REACT_APP_API_URL || 
    (process.env.NODE_ENV === 'production' 
        ? 'https://shree-ram-travels-api.onrender.com' 
        : 'http://localhost:5000');
```

### Backend Configuration

**server/server.js:**
```javascript
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const CLOUDINARY_* = process.env.CLOUDINARY_*;
```

---

## 10. ENVIRONMENT VARIABLES REQUIRED

### Backend (.env)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
ADMIN_TOKEN=shreeram_admin_token_123
ADMIN_EMAIL=admin@example.com
EMAIL_USER=noreply@example.com
SENDGRID_API_KEY=SG.xxxxx
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
PORT=5000
```

### Frontend (.env)
```
REACT_APP_API_URL=https://shree-ram-travels-api.onrender.com
```

---

## 11. STYLING & RESPONSIVE DESIGN

### CSS Variables (App.css)
```css
--primary-blue: #004d99
--accent-green: #28a745
--background-light: #f8f9fa
--card-background: #ffffff
--text-dark: #343a40
--border-color: #e0e0e0
```

### Responsive Breakpoints
- **Desktop**: Full layout (grid 2 columns)
- **Tablet (768px)**: Stack layout (1 column)
- **Mobile (600px)**: Card-based table view

### Key Components
- `.form-card`: Main container (30px padding, shadow)
- `.seat-button`: Individual seat (60px × 60px)
- `.bookings-table`: Admin table (horizontal scroll on mobile)
- `.page-container`: Max-width 960px, centered

---

## 12. SECURITY CONSIDERATIONS

### Current Security Measures
✅ JWT token-based user authentication
✅ Admin token verification on protected routes
✅ CORS whitelist configuration
✅ Environment variable protection
✅ Cloudinary secure URL storage

### Recommended Enhancements
- [ ] Rate limiting on API endpoints
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (already using Mongoose)
- [ ] XSS protection headers
- [ ] HTTPS enforcement
- [ ] Admin token rotation mechanism

---

## 13. PERFORMANCE METRICS

### Current Optimizations
- ✅ Lazy loading of routes
- ✅ Cloudinary image optimization
- ✅ MongoDB indexing on unique fields
- ✅ Responsive CSS with media queries
- ✅ Efficient seat availability queries

### Potential Improvements
- [ ] Implement caching for routes
- [ ] Add pagination to admin bookings table
- [ ] Optimize seat availability query with aggregation
- [ ] Implement image lazy loading
- [ ] Add service worker for offline support

---

## 14. TESTING RECOMMENDATIONS

### Unit Tests Needed
- [ ] Seat selection logic
- [ ] Price calculation
- [ ] Booking initiation
- [ ] Payment verification

### Integration Tests Needed
- [ ] Complete booking flow
- [ ] Admin verification workflow
- [ ] Email notification system
- [ ] Cloudinary upload

### E2E Tests Needed
- [ ] Customer booking journey
- [ ] Admin dashboard operations
- [ ] Payment tracking

---

## 15. DEPLOYMENT CHECKLIST

### Pre-Deployment
- [ ] Update CORS origins in server.js
- [ ] Set all environment variables
- [ ] Test email configuration
- [ ] Verify Cloudinary credentials
- [ ] Check MongoDB connection

### Deployment Steps
1. Push to GitHub
2. Deploy backend to Render
3. Deploy frontend to Vercel
4. Update API URLs
5. Test all endpoints
6. Monitor logs

---

## 16. FILE STRUCTURE SUMMARY

```
shree-ram-travels/
├── server/
│   ├── models/
│   │   ├── Booking.js          (40 lines)
│   │   └── Route.js            (30 lines)
│   ├── server.js               (500+ lines)
│   ├── package.json
│   ├── .env
│   └── test-email.js
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.js              (200 lines)
│   │   │   ├── BusSchedulePage.js       (150 lines)
│   │   │   ├── SeatSelectionPage.js     (300 lines)
│   │   │   ├── PaymentPage.js           (250 lines)
│   │   │   ├── AdminDashboard.js        (400 lines)
│   │   │   └── Footer.js
│   │   ├── App.js              (50 lines)
│   │   ├── App.css             (500+ lines)
│   │   └── index.js
│   ├── package.json
│   └── public/
│
└── Documentation/
    ├── README.md
    ├── DEPLOYMENT_GUIDE.md
    ├── EMAIL_TROUBLESHOOTING.md
    └── [other docs]
```

---

## 17. NEXT STEPS FOR IMPLEMENTATION

### Immediate (Week 1)
1. Create Seat and SeatCategory models
2. Add seat management endpoints
3. Create admin seat control UI

### Short-term (Week 2-3)
1. Implement dynamic pricing system
2. Add seat blocking functionality
3. Create pricing management UI

### Medium-term (Week 4+)
1. Add analytics dashboard
2. Implement bulk operations
3. Add seat utilization reports

---

## 18. CONTACT & SUPPORT

**Project Owner:** Shree Ram Travels  
**Admin Email:** harishkumarsaini18@gmail.com  
**Phone:** +91 98709 95956  
**Location:** Nathuwa wala, Dehradun, Uttarakhand-248008

---

**Document Version:** 1.0  
**Last Updated:** December 2024  
**Status:** Production Ready (with enhancement roadmap)
