# 🚌 Shree Ram Travels - Bus Booking System

A full-stack MERN bus ticket booking system with real-time seat selection, payment proof verification, and admin management dashboard.

![Status](https://img.shields.io/badge/status-production%20ready-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## 🌟 Features

### Customer Features
- 🔍 **Smart Route Search** - Dynamic city selection with available routes
- ⏰ **Schedule Selection** - Choose from multiple departure times
- 💺 **Real-time Seat Selection** - Dual-deck layout with live availability
- 💳 **Payment Proof Upload** - Cloudinary-powered screenshot submission
- 🔢 **TS Tracking System** - Unique 8-character tracking codes
- 📧 **Email Notifications** - Automated admin alerts
- 📱 **Fully Responsive** - Works on mobile, tablet, and desktop

### Admin Features
- 🔐 **Secure Login** - Token-based authentication
- 📊 **Booking Management** - View, verify, and manage all bookings
- ✅ **Payment Verification** - Approve or reject payment proofs
- 🗺️ **Route Management** - Add, edit, and delete routes
- 🖼️ **Cloudinary Integration** - View payment proof screenshots
- 📧 **Email Alerts** - Instant notifications for new bookings

---

## 🛠️ Tech Stack

### Frontend
- React 19.2.0
- React Router DOM 7.9.5
- Axios 1.13.2
- QRCode.react 4.2.0
- Custom CSS (no UI library)

### Backend
- Node.js + Express 5.1.0
- MongoDB + Mongoose 8.19.3
- JWT Authentication
- Nodemailer 7.0.10
- Cloudinary 2.8.0
- Multer 2.0.2

### Deployment
- **Frontend**: Vercel
- **Backend**: Render
- **Database**: MongoDB Atlas
- **Storage**: Cloudinary

---

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ installed
- MongoDB Atlas account
- Gmail account with App Password
- Cloudinary account

### Local Development

1. **Clone the repository**
```bash
git clone https://github.com/YOUR_USERNAME/shree-ram-travels.git
cd shree-ram-travels
```

2. **Setup Backend**
```bash
cd server
npm install
```

Create `.env` file in `server/` directory:
```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
ADMIN_TOKEN=your_admin_token
ADMIN_EMAIL=your_email@gmail.com
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start backend server:
```bash
npm start
# Server runs on http://localhost:5000
```

3. **Setup Frontend**
```bash
cd ../client
npm install
npm start
# App runs on http://localhost:3000
```

---

## 📦 Deployment

See detailed deployment guides:
- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - Complete step-by-step guide
- **[DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)** - Quick reference checklist

### Quick Deploy Summary:

1. **Push to GitHub**
2. **Deploy Backend to Render** (10 min)
3. **Deploy Frontend to Vercel** (5 min)
4. **Update CORS settings**
5. **Test everything**

Total time: ~30 minutes

---

## 📚 Documentation

- **[PROJECT_CREATION_PROMPT.md](PROJECT_CREATION_PROMPT.md)** - Complete project specification
- **[VERIFICATION_REPORT.md](VERIFICATION_REPORT.md)** - Quality assurance report
- **[EMAIL_TROUBLESHOOTING.md](EMAIL_TROUBLESHOOTING.md)** - Email configuration guide
- **[DEBUG_EMAIL_ISSUE.md](DEBUG_EMAIL_ISSUE.md)** - Email debugging steps

---

## 🎯 API Endpoints

### Public Routes
- `POST /api/bookings/initiate` - Start booking
- `PUT /api/bookings/:id/seats` - Update seats
- `POST /api/bookings/:id/submit` - Submit payment proof
- `GET /api/seats/occupied` - Get occupied seats
- `GET /api/bookings/status/:ts` - Track by TS code
- `GET /api/routes/all` - Get all routes

### Admin Routes (require x-admin-token)
- `GET /api/admin/bookings` - List all bookings
- `PUT /api/admin/bookings/:id/verify` - Verify payment
- `DELETE /api/admin/bookings/:id` - Delete booking
- `POST /api/admin/routes` - Add route
- `PUT /api/admin/routes/:id` - Edit route
- `DELETE /api/admin/routes/:id` - Delete route

---

## 🔒 Security Features

- JWT authentication for user sessions
- Admin token protection
- CORS whitelist configuration
- Environment variable protection
- Secure file upload (memory storage)
- Input validation on both ends

---

## 📱 Screenshots

### Customer Flow
1. **Home Page** - Search routes and track bookings
2. **Schedule Selection** - Choose departure time
3. **Seat Selection** - Pick seats from dual-deck layout
4. **Payment Page** - Upload proof and get TS code

### Admin Dashboard
1. **Booking Management** - View and verify payments
2. **Route Management** - Add/edit/delete routes

---

## 🧪 Testing

### Test Email Configuration
```bash
cd server
node test-email.js
```

### Run Frontend Tests
```bash
cd client
npm test
```

---

## 🔄 Making Updates

### Update Frontend
```bash
cd client
# Make changes in src/
git add .
git commit -m "Update: description"
git push origin main
# Vercel auto-deploys
```

### Update Backend
```bash
cd server
# Make changes
git add .
git commit -m "Update: description"
git push origin main
# Render auto-deploys
```

---

## 💰 Cost

### Free Tier (Current Setup)
- **Vercel**: Free (100 GB bandwidth/month)
- **Render**: Free (750 hours/month, spins down after 15 min)
- **MongoDB Atlas**: Free (512 MB storage)
- **Cloudinary**: Free (25 GB storage, 25 GB bandwidth)

**Total**: $0/month

### Recommended Upgrades (for production)
- **Render**: $7/month (no spin down, faster)
- **MongoDB Atlas**: $9/month (dedicated cluster)

**Total**: $16/month for production-grade hosting

---

## 🐛 Troubleshooting

### Common Issues

**CORS Error**
- Update `allowedOrigins` in `server/server.js`
- Redeploy backend

**Email Not Sending**
- Check App Password in `.env`
- Run `node test-email.js`
- Check Render logs

**Database Connection Error**
- Verify MongoDB Atlas Network Access (allow 0.0.0.0/0)
- Check `MONGO_URI` in environment variables

**Build Failed**
- Check build logs in Vercel/Render
- Verify `package.json` dependencies
- Check Root Directory settings

---

## 📞 Support

For issues or questions:
1. Check documentation files
2. Review troubleshooting guides
3. Check Render/Vercel logs
4. Test locally to isolate issues

---

## 📄 License

MIT License - feel free to use this project for your own purposes.

---

## 👥 Credits

**Developed for**: Shree Ram Travels  
**Admin Contact**: harishkumarsaini18@gmail.com  
**Phone**: +91 98709 95956  
**Location**: Nathuwa wala, Dehradun, Uttarakhand-248008

---

## 🎉 Project Status

✅ **Production Ready**  
✅ **Fully Functional**  
✅ **Well Documented**  
✅ **Deployment Ready**

---

*Last Updated: December 1, 2025*
