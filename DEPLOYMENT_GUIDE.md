# 🚀 Complete Deployment Guide - Shree Ram Travels

## Overview
This guide will help you deploy:
- **Frontend** (React) → Vercel
- **Backend** (Node.js/Express) → Render
- **Database** → MongoDB Atlas (already configured)

---

## 📋 Pre-Deployment Checklist

### ✅ What's Already Done:
- [x] Environment-based API URL configuration
- [x] CORS configured for Vercel domains
- [x] Vercel configuration file created
- [x] Render configuration file created
- [x] Production environment variables set up
- [x] Auto-detection of development vs production

### ⚠️ What You Need:
- GitHub account (for code repository)
- Vercel account (free tier is fine)
- Render account (free tier is fine)
- Your email App Password ready

---

## 🔧 Part 1: Prepare Your Code for Deployment

### Step 1: Update Your Production API URL (if needed)

If your Render backend URL is different, update this file:
```
client/.env.production
```

Change the URL to match your Render deployment:
```env
REACT_APP_API_URL=https://your-app-name.onrender.com
```

### Step 2: Verify .gitignore Files

Make sure these files exist and contain:

**Root `.gitignore`:**
```
node_modules/
.env
.DS_Store
```

**Client `.gitignore`:**
```
node_modules/
build/
.env.local
.env.development.local
.env.test.local
.env.production.local
```

**Server `.gitignore`:**
```
node_modules/
.env
uploads/
```

---

## 📦 Part 2: Push Code to GitHub

### Step 1: Initialize Git (if not already done)

```bash
# In your project root directory
git init
git add .
git commit -m "Initial commit - Ready for deployment"
```

### Step 2: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `shree-ram-travels`
3. Description: "Bus booking system for Shree Ram Travels"
4. Keep it **Private** (recommended) or Public
5. **DO NOT** initialize with README (you already have code)
6. Click **Create repository**

### Step 3: Push to GitHub

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/shree-ram-travels.git
git branch -M main
git push -u origin main
```

---

## 🖥️ Part 3: Deploy Backend to Render

### Step 1: Sign Up for Render

1. Go to https://render.com/
2. Click **Get Started** or **Sign Up**
3. Sign up with GitHub (recommended)
4. Authorize Render to access your repositories

### Step 2: Create New Web Service

1. Click **New +** → **Web Service**
2. Connect your GitHub repository: `shree-ram-travels`
3. Click **Connect**

### Step 3: Configure Web Service

Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `shree-ram-travels-api` |
| **Region** | Choose closest to you (e.g., Oregon, Frankfurt) |
| **Branch** | `main` |
| **Root Directory** | `server` |
| **Runtime** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node server.js` |
| **Instance Type** | `Free` |

### Step 4: Add Environment Variables

Click **Advanced** → **Add Environment Variable**

Add these variables one by one:

```env
MONGO_URI=mongodb+srv://luvthapa8:1234abcd@shreeramtravels.vis34tq.mongodb.net/?appName=ShreeRamTravels

JWT_SECRET=A_for_apple_B_for_ball

ADMIN_TOKEN=shreeram_admin_token_123

ADMIN_EMAIL=harishkumarsaini18@gmail.com

EMAIL_USER=harishkumarsaini18@gmail.com

EMAIL_PASS=inafoolegosjwtdo

CLOUDINARY_CLOUD_NAME=dde50yvxc

CLOUDINARY_API_KEY=244233567697924

CLOUDINARY_API_SECRET=gEQDKQjnUxSi3mc7y2_W_ZgW2DY

PORT=5000

NODE_ENV=production
```

### Step 5: Deploy

1. Click **Create Web Service**
2. Wait 5-10 minutes for deployment
3. You'll see build logs in real-time
4. Once deployed, you'll get a URL like: `https://shree-ram-travels-api.onrender.com`

### Step 6: Test Backend

Open your browser and test:
```
https://your-app-name.onrender.com/api/routes/all
```

You should see JSON data with routes.

---

## 🌐 Part 4: Deploy Frontend to Vercel

### Step 1: Sign Up for Vercel

1. Go to https://vercel.com/
2. Click **Sign Up**
3. Sign up with GitHub (recommended)
4. Authorize Vercel to access your repositories

### Step 2: Import Project

1. Click **Add New...** → **Project**
2. Find your repository: `shree-ram-travels`
3. Click **Import**

### Step 3: Configure Project

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Create React App` |
| **Root Directory** | `client` |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

### Step 4: Add Environment Variables

Click **Environment Variables** and add:

```env
REACT_APP_API_URL=https://shree-ram-travels-api.onrender.com
```

**Important**: Replace with your actual Render URL from Part 3!

### Step 5: Deploy

1. Click **Deploy**
2. Wait 2-3 minutes for build
3. Once deployed, you'll get a URL like: `https://shree-ram-travels.vercel.app`

### Step 6: Test Frontend

1. Open your Vercel URL
2. Try searching for a route
3. Complete a test booking
4. Check if emails are received

---

## 🔄 Part 5: Update CORS with Your Vercel URL

### Step 1: Get Your Vercel URL

After deployment, copy your Vercel URL (e.g., `https://shree-ram-travels-xyz.vercel.app`)

### Step 2: Update server.js

In `server/server.js`, update the allowedOrigins array:

```javascript
const allowedOrigins = [
    'http://localhost:3000',
    'https://shreerambus.netlify.app',
    'https://your-actual-vercel-url.vercel.app', // Add your URL here
    /\.vercel\.app$/ // This allows all Vercel preview URLs
];
```

### Step 3: Push Changes

```bash
git add .
git commit -m "Update CORS for Vercel deployment"
git push origin main
```

Render will automatically redeploy with the new CORS settings.

---

## ✅ Part 6: Verify Everything Works

### Test Checklist:

1. **Backend Health Check**:
   - Visit: `https://your-render-url.onrender.com/api/routes/all`
   - Should return JSON data

2. **Frontend Loads**:
   - Visit your Vercel URL
   - Homepage should load correctly

3. **API Connection**:
   - Search for a route on homepage
   - Should show available buses

4. **Complete Booking Flow**:
   - Search → Select Schedule → Choose Seats → Payment
   - Submit payment proof
   - Check if email arrives at `harishkumarsaini18@gmail.com`

5. **Admin Dashboard**:
   - Visit: `https://your-vercel-url.vercel.app/admin`
   - Login with token: `shreeram_admin_token_123`
   - Should see bookings and routes

6. **TS Tracking**:
   - On homepage, enter a TS code
   - Should show booking status

---

## 🔧 Part 7: Custom Domain (Optional)

### For Vercel (Frontend):

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Add your custom domain (e.g., `shreeramtravels.com`)
4. Follow DNS configuration instructions
5. Update `REACT_APP_API_URL` if needed

### For Render (Backend):

1. Go to your service in Render
2. Click **Settings** → **Custom Domain**
3. Add your API subdomain (e.g., `api.shreeramtravels.com`)
4. Follow DNS configuration instructions
5. Update frontend `.env.production` with new API URL

---

## 🐛 Troubleshooting

### Issue 1: "CORS Error" in Browser Console

**Solution**:
1. Check Render logs for CORS errors
2. Verify your Vercel URL is in `allowedOrigins` array
3. Redeploy backend after updating CORS

### Issue 2: "Cannot connect to server"

**Solution**:
1. Check if Render service is running (green status)
2. Verify `REACT_APP_API_URL` in Vercel environment variables
3. Test backend URL directly in browser

### Issue 3: "Email not sending"

**Solution**:
1. Check Render logs for email errors
2. Verify `EMAIL_USER` and `EMAIL_PASS` in Render environment variables
3. Test with the `test-email.js` script on Render

### Issue 4: "Build Failed" on Vercel

**Solution**:
1. Check build logs for errors
2. Verify `Root Directory` is set to `client`
3. Make sure all dependencies are in `package.json`

### Issue 5: "Database Connection Error"

**Solution**:
1. Check if MongoDB Atlas allows connections from anywhere (0.0.0.0/0)
2. Verify `MONGO_URI` in Render environment variables
3. Check MongoDB Atlas cluster status

---

## 📊 Monitoring & Maintenance

### Render Dashboard:
- View logs: Click on your service → **Logs** tab
- Monitor performance: **Metrics** tab
- Restart service: **Manual Deploy** → **Clear build cache & deploy**

### Vercel Dashboard:
- View deployments: Project → **Deployments** tab
- Check analytics: **Analytics** tab
- View logs: Click on deployment → **Function Logs**

### MongoDB Atlas:
- Monitor database: **Metrics** tab
- View collections: **Browse Collections**
- Check connection: **Network Access**

---

## 🔄 Making Updates After Deployment

### To Update Frontend:

```bash
# Make your changes in client/src/
git add .
git commit -m "Update: description of changes"
git push origin main
```

Vercel will automatically redeploy.

### To Update Backend:

```bash
# Make your changes in server/
git add .
git commit -m "Update: description of changes"
git push origin main
```

Render will automatically redeploy.

---

## 💰 Cost Breakdown

### Free Tier Limits:

**Vercel (Frontend)**:
- ✅ Unlimited deployments
- ✅ 100 GB bandwidth/month
- ✅ Automatic HTTPS
- ✅ Custom domains

**Render (Backend)**:
- ✅ 750 hours/month (enough for 1 service)
- ⚠️ Spins down after 15 min of inactivity
- ⚠️ Cold start: 30-60 seconds on first request
- ✅ Automatic HTTPS

**MongoDB Atlas**:
- ✅ 512 MB storage
- ✅ Shared cluster
- ✅ Enough for thousands of bookings

### Upgrade Recommendations:

If you get significant traffic:
- **Render**: Upgrade to $7/month (no spin down)
- **MongoDB**: Upgrade to $9/month (dedicated cluster)
- **Vercel**: Free tier is usually sufficient

---

## 🎉 Deployment Complete!

Your Shree Ram Travels booking system is now live!

### Your URLs:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-api.onrender.com`
- **Admin**: `https://your-app.vercel.app/admin`

### Next Steps:
1. Share the URL with stakeholders
2. Test all features thoroughly
3. Monitor logs for any errors
4. Set up custom domain (optional)
5. Configure email alerts for bookings

---

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review Render/Vercel logs
3. Test locally first to isolate the issue
4. Check MongoDB Atlas connection

---

*Deployment guide created: December 1, 2025*
*Last updated: December 1, 2025*
