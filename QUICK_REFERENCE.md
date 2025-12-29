# Quick Reference Guide - Bus Booking System

## Current System Status

✅ **Production Ready** - Fully functional bus booking system
- 40 seats (20 upper + 20 lower deck)
- Payment proof verification
- Admin dashboard
- Email notifications
- Real-time seat availability

---

## Key Files & Locations

### Backend
| File | Purpose | Lines |
|------|---------|-------|
| `server/server.js` | Main API server | 500+ |
| `server/models/Booking.js` | Booking schema | 40 |
| `server/models/Route.js` | Route schema | 30 |
| `server/package.json` | Dependencies | - |

### Frontend
| File | Purpose | Lines |
|------|---------|-------|
| `client/src/App.js` | Main app router | 50 |
| `client/src/App.css` | All styling | 500+ |
| `client/src/components/HomePage.js` | Search & track | 200 |
| `client/src/components/BusSchedulePage.js` | Time selection | 150 |
| `client/src/components/SeatSelectionPage.js` | Seat picker | 300 |
| `client/src/components/PaymentPage.js` | Payment & proof | 250 |
| `client/src/components/AdminDashboard.js` | Admin panel | 400 |

---

## API Endpoints Summary

### Public Endpoints
```
POST   /api/bookings/initiate              → Start booking
PUT    /api/bookings/:id/seats             → Select seats
POST   /api/bookings/:id/submit            → Submit payment proof
GET    /api/bookings/status/:ts            → Track by TS code
GET    /api/routes/all                     → Get all routes
GET    /api/seats/occupied                 → Get occupied seats
```

### Admin Endpoints (require x-admin-token)
```
GET    /api/admin/bookings                 → List all bookings
PUT    /api/admin/bookings/:id/verify      → Approve/reject payment
DELETE /api/admin/bookings/:id             → Delete booking
POST   /api/admin/routes                   → Add route
PUT    /api/admin/routes/:id               → Edit route
DELETE /api/admin/routes/:id               → Delete route
```

---

## Seat Layout

### Upper Deck (20 seats, ₹599 each)
```
[U-A1] [AISLE] [U-C1] [U-D1] [WHEEL]
[U-A2] [AISLE] [U-C2] [U-D2]
[U-A3] [AISLE] [U-C3] [U-D3]
[U-A4] [AISLE] [U-C4] [U-D4]
[U-A5] [AISLE] [U-C5] [U-D5]
[U-A6] [AISLE] [U-C6] [U-D6]
[U-A7] [U-B7] [U-C7] [U-D7]
```

### Lower Deck (20 seats, ₹699 each)
```
[L-A1] [AISLE] [L-C1] [L-D1] [WHEEL]
[L-A2] [AISLE] [L-C2] [L-D2]
[L-A3] [AISLE] [L-C3] [L-D3]
[L-A4] [AISLE] [L-C4] [L-D4]
[L-A5] [AISLE] [L-C5] [L-D5]
[L-A6] [AISLE] [L-C6] [L-D6]
[L-A7] [L-B7] [L-C7] [L-D7]
```

---

## Booking Flow

```
1. HOME PAGE
   ↓ User searches route/date/passengers
   ↓ POST /api/bookings/initiate
   ↓ Get bookingId & TS code
   ↓ Store in localStorage

2. SCHEDULE PAGE
   ↓ GET /api/routes/all
   ↓ Display available times
   ↓ User selects time

3. SEAT SELECTION
   ↓ GET /api/seats/occupied
   ↓ Display dual-deck layout
   ↓ User selects seats
   ↓ PUT /api/bookings/:id/seats

4. PAYMENT PAGE
   ↓ Display UPI QR code
   ↓ User uploads screenshot
   ↓ POST /api/bookings/:id/submit
   ↓ Upload to Cloudinary
   ↓ Email to admin
   ↓ Show TS code

5. ADMIN VERIFICATION
   ↓ Admin reviews proof
   ↓ PUT /api/admin/bookings/:id/verify
   ↓ Email to customer
   ↓ Status → "Paid"
```

---

## Environment Variables

### Backend (.env)
```
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
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

## Common Tasks

### Add a New Route
```bash
# Via Admin Dashboard
1. Login with admin token
2. Fill "Manage Routes" form
3. Click "Add New Route"
```

### Block a Seat (Future Feature)
```bash
# Via API (after implementation)
PUT /api/admin/seats/:seatId/block
{ "reason": "Maintenance", "blockedUntil": "2024-12-25" }
```

### Update Pricing (Future Feature)
```bash
# Via API (after implementation)
POST /api/admin/pricing/route/:routeId
{ "basePriceUpper": 599, "basePriceLower": 699, "surgeMultiplier": 1.2 }
```

### Check Booking Status
```bash
# Customer can track with TS code
GET /api/bookings/status/37F0299F
```

---

## Troubleshooting

### Issue: CORS Error
**Solution:** Update `allowedOrigins` in `server/server.js`

### Issue: Email Not Sending
**Solution:** 
1. Check SENDGRID_API_KEY in .env
2. Run `node server/test-email.js`
3. Check Render logs

### Issue: Seats Not Loading
**Solution:**
1. Check MongoDB connection
2. Verify route exists in database
3. Check browser console for errors

### Issue: Payment Proof Not Uploading
**Solution:**
1. Check Cloudinary credentials
2. Verify file size < 5MB
3. Check browser console

---

## Performance Tips

- ✅ Seats query uses index on (routeId, departureTime, seatId)
- ✅ Occupied seats only fetched for PAID bookings
- ✅ Cloudinary handles image optimization
- ✅ MongoDB Atlas auto-scaling enabled
- ✅ Render auto-deploys on git push

---

## Security Checklist

- ✅ JWT tokens for user sessions
- ✅ Admin token verification
- ✅ CORS whitelist configured
- ✅ Environment variables protected
- ✅ Cloudinary secure URLs
- ⚠️ TODO: Rate limiting
- ⚠️ TODO: Input validation
- ⚠️ TODO: HTTPS enforcement

---

## Deployment URLs

- **Frontend:** https://shree-ram-travels.vercel.app
- **Backend:** https://shree-ram-travels-api.onrender.com
- **Admin:** https://shree-ram-travels.vercel.app/admin

---

## Contact

**Admin Email:** harishkumarsaini18@gmail.com
**Phone:** +91 98709 95956
**Location:** Nathuwa wala, Dehradun, Uttarakhand-248008

---

## Next Steps for Enhancement

1. **Implement Seat Model** - Individual seat tracking
2. **Add Pricing Management** - Dynamic pricing per route
3. **Admin Seat Controls** - Block/unblock seats
4. **Analytics Dashboard** - Utilization reports
5. **Bulk Operations** - Manage multiple seats
6. **Mobile App** - React Native version

---

## Documentation Files

- `CODEBASE_ANALYSIS.md` - Complete architecture overview
- `TWO_DECK_IMPLEMENTATION_GUIDE.md` - Step-by-step implementation
- `README.md` - Project overview
- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `EMAIL_TROUBLESHOOTING.md` - Email setup guide

---

**Last Updated:** December 2024
**Version:** 1.0
**Status:** Production Ready
