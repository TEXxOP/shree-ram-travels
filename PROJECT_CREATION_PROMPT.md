# COMPREHENSIVE PROJECT CREATION PROMPT: Shree Ram Travels Bus Booking System

## PROJECT OVERVIEW
Create a full-stack MERN (MongoDB, Express, React, Node.js) bus ticket booking system for "Shree Ram Travels" with real-time seat selection, payment proof submission via Cloudinary, admin verification dashboard, email notifications, and a unique tracking system (TS codes).

---

## TECHNOLOGY STACK

### Frontend (Client)
- **Framework**: React 19.2.0 with Create React App
- **Routing**: React Router DOM 7.9.5
- **HTTP Client**: Axios 1.13.2
- **QR Code Generation**: qrcode.react 4.2.0
- **Styling**: Custom CSS with CSS Variables (no external UI libraries)
- **Build Tool**: react-scripts 5.0.1

### Backend (Server)
- **Runtime**: Node.js with Express 5.1.0
- **Database**: MongoDB Atlas with Mongoose 8.19.3
- **Authentication**: JWT (jsonwebtoken 9.0.2)
- **File Upload**: Multer 2.0.2 (memory storage)
- **Cloud Storage**: Cloudinary 2.8.0 (for payment proof screenshots)
- **Email Service**: Nodemailer 7.0.10 (Gmail SMTP)
- **Additional**: CORS 2.8.5, dotenv 17.2.3

### Deployment
- **Frontend**: Netlify (https://shreerambus.netlify.app)
- **Backend**: Render (https://shree-ram-travels-api.onrender.com)
- **Database**: MongoDB Atlas Cloud

---

## CORE FEATURES & FUNCTIONALITY

### 1. USER BOOKING FLOW

#### A. Home Page (Search & Initiate Booking)
- **Dynamic Route Selection**: Fetch available departure and destination cities from database
- **Form Fields**:
  - Departure City (dropdown - dynamically populated)
  - Destination City (dropdown - filtered based on departure selection)
  - Departure Date (date picker with min date = today)
  - Number of Passengers (1-50)
- **Booking Initiation**:
  - POST `/api/bookings/initiate` creates initial booking record
  - Generates unique JWT token for guest user session
  - Generates unique TS (Tracking System) code (8-character hex)
  - Returns bookingId, userToken, and tsNumber
  - Stores session data in localStorage

#### B. Bus Schedule Selection Page
- **Display Available Times**: Fetch route-specific departure times from database
- **Real-time Seat Availability**: Check occupied seats for selected date/time/route
- **Time Selection**: User selects preferred departure time
- **Navigation**: Proceeds to seat selection with updated booking context

#### C. Seat Selection Page
- **Visual Seat Layout**: 
  - 2x2 grid layout (A-D columns, rows 1-10)
  - Total 40 seats per bus
  - Color coding: Available (green), Selected (blue), Occupied (red)
- **Real-time Validation**:
  - Fetch occupied seats via GET `/api/seats/occupied`
  - Prevent selection of already booked seats
  - Enforce passenger count limit
- **Dynamic Pricing**: Calculate total amount (₹500 per seat)
- **Update Booking**: PUT `/api/bookings/:id/seats` saves seat selection and amount

#### D. Payment Page
- **Display Booking Summary**:
  - Route details (departure → destination)
  - Date and time
  - Selected seats
  - Total amount
- **User Information Form**:
  - Full Name
  - Phone Number
  - Email Address
- **Payment Proof Upload**:
  - File input for screenshot (image files only)
  - Display QR code for UPI payment
  - Instructions for payment process
- **Submission**:
  - POST `/api/bookings/:id/submit` with multipart/form-data
  - Upload screenshot to Cloudinary
  - Update booking status to "Processing"
  - Send admin notification email
  - Display TS tracking code to user

#### E. Payment Tracker (Home Page Sidebar)
- **Track by TS Code**: Input field for 8-character tracking code
- **Status Display**:
  - Pending: Initial state
  - Processing: Payment proof submitted, awaiting verification
  - Paid: Admin verified and approved
  - Cancelled: Admin rejected
- **GET `/api/bookings/status/:ts`**: Fetch status by TS code

---

### 2. ADMIN DASHBOARD

#### A. Authentication
- **Token-based Access**: Custom admin token in request header (`x-admin-token`)
- **Environment Variable**: `ADMIN_TOKEN=shreeram_admin_token_123`
- **Middleware**: `verifyAdminToken` protects all admin routes

#### B. Booking Management
- **View All Bookings**: GET `/api/admin/bookings`
  - Sorted by booking date (newest first)
  - Display all booking details including TS code
  - Show payment proof screenshot (Cloudinary URL)
- **Verify Payment**: PUT `/api/admin/bookings/:id/verify`
  - Update status to "Paid" or "Cancelled"
  - Manual verification workflow
- **Delete Booking**: DELETE `/api/admin/bookings/:id`
  - Remove booking record from database
  - Cloudinary cleanup (optional)

#### C. Route Management
- **View All Routes**: GET `/api/routes/all`
  - List active routes with departure/destination pairs
  - Show available time slots
- **Add New Route**: POST `/api/admin/routes`
  - Create new departure-destination route
  - Set available departure times
  - Unique constraint on departure+destination combination
- **Edit Route Timings**: PUT `/api/admin/routes/:id`
  - Update available time slots for existing route
- **Delete Route**: DELETE `/api/admin/routes/:id`
  - Soft delete (set isActive: false)

---

### 3. EMAIL NOTIFICATION SYSTEM

#### Configuration
- **Service**: Gmail SMTP via Nodemailer
- **Credentials**: 
  - EMAIL_USER: luvthapa8@gmail.com
  - EMAIL_PASS: App-specific password (oasyfchpyjautruy)
- **Settings**:
  - Host: smtp.gmail.com
  - Port: 587 (STARTTLS)
  - Secure: false

#### Admin Notification Email
- **Trigger**: When user submits payment proof
- **Recipient**: ADMIN_EMAIL (luvthapa8@gmail.com)
- **Content**:
  - Subject: "ACTION REQUIRED: Payment Verification for Booking [TS]"
  - Booking details (TS code, ID, customer info, trip details, amount)
  - Clickable link to view payment proof on Cloudinary
  - Call-to-action to verify in admin dashboard

---

### 4. CLOUDINARY INTEGRATION

#### Configuration
- **Cloud Name**: dde50yvxc
- **API Key**: 244233567697924
- **API Secret**: gEQDKQjnUxSi3mc7y2_W_ZgW2DY
- **Folder**: shree-ram-travels-proofs

#### Upload Process
1. Multer receives file in memory (buffer)
2. Convert buffer to base64 data URI
3. Upload to Cloudinary with public_id: `{bookingId}_{timestamp}`
4. Store secure_url in booking.screenshotPath
5. Cleanup on error or booking deletion

---

## DATABASE MODELS

### Booking Schema
```javascript
{
  userId: ObjectId (ref: User, optional),
  token: String (JWT for guest session),
  TS: String (unique 8-char tracking code),
  departureCity: String (required),
  destinationCity: String (required),
  departureDate: Date (required),
  departureTime: String (required),
  passengers: Number (required),
  selectedSeats: [String] (array of seat IDs),
  totalAmount: Number (required),
  paymentStatus: Enum ['Pending', 'Paid', 'Cancelled', 'Processing'],
  userName: String (optional),
  userPhone: String (optional),
  userEmail: String (optional),
  screenshotPath: String (Cloudinary URL),
  bookingDate: Date (default: now)
}
```

### Route Schema
```javascript
{
  departure: String (required, e.g., "Dehradun"),
  destination: String (required, e.g., "Jaipur"),
  availableTime: [String] (array of times, default: ['07:00 AM', '11:00 AM', '03:00 PM', '11:00 PM']),
  isActive: Boolean (default: true)
}
// Unique compound index on (departure, destination)
```

---

## API ENDPOINTS REFERENCE

### Public Routes
1. **POST** `/api/bookings/initiate` - Start booking process
2. **PUT** `/api/bookings/:id/seats` - Update seat selection (requires user token)
3. **POST** `/api/bookings/:id/submit` - Submit payment proof (requires user token, multipart)
4. **GET** `/api/seats/occupied` - Get occupied seats for route/date/time
5. **GET** `/api/bookings/status/:ts` - Track booking by TS code
6. **GET** `/api/bookings/:id/ts` - Get TS code by booking ID
7. **GET** `/api/routes/all` - Fetch all active routes

### Admin Routes (require x-admin-token header)
8. **GET** `/api/admin/bookings` - List all bookings
9. **PUT** `/api/admin/bookings/:id/verify` - Verify payment status
10. **DELETE** `/api/admin/bookings/:id` - Delete booking
11. **POST** `/api/admin/routes` - Add new route
12. **PUT** `/api/admin/routes/:id` - Edit route timings
13. **DELETE** `/api/admin/routes/:id` - Deactivate route

---

## ENVIRONMENT VARIABLES (.env)

```env
MONGO_URI="your_mongodb_connection_string_here"
JWT_SECRET="your_jwt_secret_here"
ADMIN_TOKEN="your_admin_token_here"
ADMIN_EMAIL="your_email@gmail.com"
EMAIL_USER="your_email@gmail.com"
EMAIL_PASS="your_gmail_app_password_here"
CLOUDINARY_CLOUD_NAME="your_cloudinary_cloud_name"
CLOUDINARY_API_KEY="your_cloudinary_api_key"
CLOUDINARY_API_SECRET="your_cloudinary_api_secret"
SENDGRID_API_KEY="your_sendgrid_api_key"
PORT=5000
```

---

## SECURITY FEATURES

1. **JWT Authentication**: Guest user tokens for booking session management
2. **Admin Token Protection**: Separate token for admin dashboard access
3. **CORS Configuration**: Whitelist specific origins (localhost:3000, Netlify domain)
4. **Input Validation**: Mongoose schema validation and Express middleware
5. **File Upload Security**: Memory storage with Cloudinary upload, no local file persistence
6. **Environment Variables**: Sensitive credentials stored in .env file

---

## USER EXPERIENCE HIGHLIGHTS

1. **No Registration Required**: Guest checkout with JWT session tokens
2. **Real-time Seat Availability**: Prevent double-booking with live seat status
3. **Unique Tracking System**: TS codes for easy payment status tracking
4. **Visual Feedback**: Color-coded seat selection, status badges, loading states
5. **Mobile Responsive**: CSS Grid and Flexbox for adaptive layouts
6. **QR Code Payment**: Embedded UPI QR code for instant payment
7. **Email Notifications**: Automated admin alerts for payment verification

---

## WORKFLOW SUMMARY

### Customer Journey
1. Search for route (departure, destination, date, passengers)
2. Select departure time from available schedules
3. Choose seats from visual seat map
4. Enter personal details and upload payment proof
5. Receive TS tracking code
6. Track payment status using TS code

### Admin Workflow
1. Receive email notification with payment proof link
2. Log into admin dashboard with admin token
3. View booking details and payment screenshot
4. Verify payment and update status to "Paid" or "Cancelled"
5. Manage routes (add/edit/delete) as needed

---

## DEPLOYMENT CONFIGURATION

### Frontend (Netlify)
- Build command: `npm run build`
- Publish directory: `build`
- Environment variables: None (API URL hardcoded)
- Redirects: SPA routing with `_redirects` file

### Backend (Render)
- Build command: `npm install`
- Start command: `node server.js`
- Environment variables: All .env variables configured in Render dashboard
- Auto-deploy: Connected to Git repository

---

## FUTURE ENHANCEMENTS (Optional)

1. **User Accounts**: Replace guest tokens with full authentication system
2. **Payment Gateway Integration**: Razorpay/Stripe for automated payment processing
3. **SMS Notifications**: Twilio integration for booking confirmations
4. **Ticket Generation**: PDF tickets with QR codes for bus boarding
5. **Cancellation System**: Allow users to cancel bookings with refund logic
6. **Analytics Dashboard**: Booking trends, revenue reports, popular routes
7. **Multi-language Support**: Hindi, English language toggle
8. **Bus Fleet Management**: Track multiple buses per route with capacity management

---

## PROJECT STRUCTURE

```
shree-ram-travels/
├── client/                          # React frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── favicon.ico
│   │   └── manifest.json
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.js          # Search & tracking
│   │   │   ├── BusSchedulePage.js   # Time selection
│   │   │   ├── SeatSelectionPage.js # Seat picker
│   │   │   ├── PaymentPage.js       # Payment proof upload
│   │   │   ├── AdminDashboard.js    # Admin panel
│   │   │   └── Footer.js            # Footer component
│   │   ├── App.js                   # Main routing
│   │   ├── App.css                  # Global styles
│   │   ├── index.js                 # React entry point
│   │   └── index.css                # CSS variables
│   ├── package.json
│   └── README.md
│
├── server/                          # Express backend
│   ├── models/
│   │   ├── Booking.js               # Booking schema
│   │   └── Route.js                 # Route schema
│   ├── uploads/                     # Cloudinary uploaded files (references)
│   ├── server.js                    # Main server file
│   ├── .env                         # Environment variables
│   ├── .gitignore
│   └── package.json
│
└── PROJECT_CREATION_PROMPT.md       # This file
```

---

## TESTING CHECKLIST

### Frontend Testing
- [ ] Route search with dynamic city selection
- [ ] Seat selection with occupied seat prevention
- [ ] Payment proof file upload
- [ ] TS code tracking functionality
- [ ] Admin dashboard login and booking management
- [ ] Responsive design on mobile/tablet/desktop

### Backend Testing
- [ ] Booking initiation and TS code generation
- [ ] Seat availability calculation
- [ ] Cloudinary image upload
- [ ] Email notification delivery
- [ ] Admin authentication and authorization
- [ ] Route CRUD operations
- [ ] Error handling and validation

### Integration Testing
- [ ] End-to-end booking flow
- [ ] Admin verification workflow
- [ ] Payment status tracking
- [ ] CORS and cross-origin requests
- [ ] Database connection and queries

---

## KNOWN ISSUES & LIMITATIONS

1. **Email Delivery**: Gmail SMTP may have rate limits; consider SendGrid for production
2. **File Cleanup**: Cloudinary files not automatically deleted on booking deletion
3. **Concurrent Bookings**: Race condition possible if two users select same seat simultaneously
4. **Admin Security**: Single shared token; implement proper admin user system
5. **Error Recovery**: Limited retry logic for failed Cloudinary uploads or email sends

---

## SUPPORT & MAINTENANCE

- **Admin Email**: luvthapa8@gmail.com
- **Frontend URL**: https://shreerambus.netlify.app
- **Backend URL**: https://shree-ram-travels-api.onrender.com
- **Database**: MongoDB Atlas (ShreeRamTravels cluster)

---

## CONCLUSION

This comprehensive prompt documents the complete Shree Ram Travels bus booking system, including all technical specifications, API endpoints, database schemas, deployment configurations, and workflow details. The system successfully implements a full-featured booking platform with real-time seat management, payment verification, and admin controls using the MERN stack with Cloudinary and Nodemailer integrations.