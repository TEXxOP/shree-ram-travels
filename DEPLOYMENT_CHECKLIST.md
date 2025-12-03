# ✅ Deployment Checklist - Quick Reference

## Before You Start
- [ ] GitHub account created
- [ ] Vercel account created (sign up with GitHub)
- [ ] Render account created (sign up with GitHub)
- [ ] Email App Password ready: `inafoolegosjwtdo`

---

## 1️⃣ GitHub Setup (5 minutes)

```bash
# In project root
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/shree-ram-travels.git
git branch -M main
git push -u origin main
```

- [ ] Code pushed to GitHub
- [ ] Repository is accessible

---

## 2️⃣ Deploy Backend to Render (10 minutes)

### Create Web Service:
- [ ] Go to https://render.com/
- [ ] New + → Web Service
- [ ] Connect GitHub repo: `shree-ram-travels`

### Configure:
- [ ] Name: `shree-ram-travels-api`
- [ ] Root Directory: `server`
- [ ] Build Command: `npm install`
- [ ] Start Command: `node server.js`
- [ ] Instance Type: Free

### Environment Variables (copy-paste these):
```
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

- [ ] All environment variables added
- [ ] Click "Create Web Service"
- [ ] Wait for deployment (5-10 min)
- [ ] Copy your Render URL: `https://__________.onrender.com`

### Test Backend:
- [ ] Visit: `https://your-url.onrender.com/api/routes/all`
- [ ] Should see JSON data

---

## 3️⃣ Deploy Frontend to Vercel (5 minutes)

### Import Project:
- [ ] Go to https://vercel.com/
- [ ] Add New → Project
- [ ] Import: `shree-ram-travels`

### Configure:
- [ ] Framework: Create React App
- [ ] Root Directory: `client`
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `build`

### Environment Variable:
```
REACT_APP_API_URL=https://your-render-url.onrender.com
```
**⚠️ Replace with your actual Render URL!**

- [ ] Environment variable added
- [ ] Click "Deploy"
- [ ] Wait for build (2-3 min)
- [ ] Copy your Vercel URL: `https://__________.vercel.app`

---

## 4️⃣ Update CORS (2 minutes)

### Update server/server.js:
Replace `your-actual-vercel-url` with your Vercel URL in the `allowedOrigins` array.

```bash
git add .
git commit -m "Update CORS for Vercel"
git push origin main
```

- [ ] CORS updated with Vercel URL
- [ ] Changes pushed to GitHub
- [ ] Render auto-redeployed (check dashboard)

---

## 5️⃣ Final Testing (10 minutes)

### Backend Tests:
- [ ] API responds: `https://your-render-url.onrender.com/api/routes/all`
- [ ] No CORS errors in browser console

### Frontend Tests:
- [ ] Homepage loads: `https://your-vercel-url.vercel.app`
- [ ] Search works (shows buses)
- [ ] Can select schedule
- [ ] Can select seats
- [ ] Can submit payment proof
- [ ] Email received at `harishkumarsaini18@gmail.com`

### Admin Tests:
- [ ] Admin login works: `https://your-vercel-url.vercel.app/admin`
- [ ] Token: `shreeram_admin_token_123`
- [ ] Can see bookings
- [ ] Can verify payments
- [ ] Can add/edit/delete routes

### Tracking Test:
- [ ] TS tracking works on homepage
- [ ] Shows correct booking status

---

## 🎉 Deployment Complete!

### Your Live URLs:
```
Frontend: https://________________.vercel.app
Backend:  https://________________.onrender.com
Admin:    https://________________.vercel.app/admin
```

### Share These Details:
- **Customer URL**: Your Vercel URL
- **Admin URL**: Your Vercel URL + `/admin`
- **Admin Token**: `shreeram_admin_token_123`
- **Admin Email**: `harishkumarsaini18@gmail.com`

---

## 🔄 To Make Updates:

```bash
# Make changes, then:
git add .
git commit -m "Description of changes"
git push origin main

# Both Vercel and Render will auto-deploy!
```

---

## ⚠️ Important Notes:

1. **Render Free Tier**: Spins down after 15 min of inactivity
   - First request after sleep takes 30-60 seconds
   - Upgrade to $7/month to prevent spin down

2. **Email Limits**: Gmail may limit emails if too many sent
   - Monitor for "rate limit" errors
   - Consider SendGrid for production

3. **MongoDB Free Tier**: 512 MB storage
   - Monitor usage in Atlas dashboard
   - Upgrade if approaching limit

4. **Backup Your Data**: 
   - Export bookings regularly from admin dashboard
   - MongoDB Atlas has automatic backups (paid tiers)

---

## 📞 Quick Troubleshooting:

| Issue | Solution |
|-------|----------|
| CORS Error | Update allowedOrigins in server.js |
| Can't connect | Check Render service is running (green) |
| Email not sending | Check Render logs, verify EMAIL_PASS |
| Build failed | Check build logs, verify Root Directory |
| Database error | Check MongoDB Atlas Network Access (allow 0.0.0.0/0) |

---

**Total Time**: ~30 minutes
**Cost**: $0 (Free tier)
**Status**: Production Ready ✅

*Checklist created: December 1, 2025*
