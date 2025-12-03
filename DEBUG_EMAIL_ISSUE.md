# 🐛 Debug Email Issue - Step by Step

## Issue: Test email works, but booking emails don't arrive

---

## ✅ Changes Made:

1. **Added email configuration logging** on server startup
2. **Added detailed logging** in booking submission route
3. **Email function already has error logging**

---

## 🔧 How to Debug:

### Step 1: Restart Your Server

**Stop your current server** (Ctrl+C) and restart it:

```bash
cd server
node server.js
```

### Step 2: Check Startup Logs

You should see:
```
📧 Email Configuration:
EMAIL_USER: harishkumarsaini18@gmail.com
EMAIL_PASS: ***wtdo
ADMIN_EMAIL: harishkumarsaini18@gmail.com
✅ Email server is ready to send messages
MongoDB Atlas Connected!
Server is running on http://localhost:5000
```

**If you see**:
- ❌ `EMAIL_USER: undefined` → .env file not loaded
- ❌ `EMAIL_PASS: NOT SET` → Password not in .env
- ❌ `Nodemailer configuration error` → Wrong credentials

### Step 3: Make a Test Booking

1. Go to your frontend: http://localhost:3000
2. Complete a full booking (search → schedule → seats → payment)
3. Submit payment proof

### Step 4: Watch Server Console

When you submit, you should see:
```
📧 Attempting to send admin notification email...
Admin Email: harishkumarsaini18@gmail.com
Booking TS: 668F240D
✅ Admin notification email sent successfully.
Message ID: <some-id@gmail.com>
📧 Email notification function completed
```

**If you see**:
- ❌ `Error sending admin notification` → Email failed
- ❌ `Invalid login` → Wrong credentials
- ❌ `Connection timeout` → Network/firewall issue

---

## 🔍 Common Issues:

### Issue 1: .env Not Loaded
**Symptom**: `EMAIL_USER: undefined`

**Fix**:
```bash
# Make sure .env is in server/ directory
cd server
ls .env  # Should exist

# Restart server from server/ directory
node server.js
```

### Issue 2: Wrong Working Directory
**Symptom**: Server starts but .env not loaded

**Fix**: Always start server from `server/` directory:
```bash
cd server
node server.js
```

NOT from root:
```bash
# ❌ WRONG
node server/server.js
```

### Issue 3: Email Sent But Not Received
**Symptom**: Logs show "✅ Email sent" but inbox empty

**Check**:
1. Spam folder
2. Gmail "All Mail"
3. Search: `from:harishkumarsaini18@gmail.com`
4. Check "Sent" folder in Gmail

---

## 🧪 Quick Test Commands

### Test 1: Verify .env is correct
```bash
cd server
cat .env | grep EMAIL
```

Should show:
```
ADMIN_EMAIL="harishkumarsaini18@gmail.com"
EMAIL_USER="harishkumarsaini18@gmail.com"
EMAIL_PASS="inafoolegosjwtdo"
```

### Test 2: Test email directly
```bash
cd server
node test-email.js
```

Should receive email in inbox.

### Test 3: Check if server loads .env
```bash
cd server
node -e "require('dotenv').config(); console.log('EMAIL_USER:', process.env.EMAIL_USER);"
```

Should print: `EMAIL_USER: harishkumarsaini18@gmail.com`

---

## 📋 Debugging Checklist

Run through this:

- [ ] Server started from `server/` directory
- [ ] Startup logs show email configuration
- [ ] `test-email.js` works and email received
- [ ] `.env` file exists in `server/` directory
- [ ] Email credentials are correct in `.env`
- [ ] Server console shows "📧 Attempting to send..." when booking submitted
- [ ] Server console shows "✅ Email sent successfully"
- [ ] Checked spam/all mail folders
- [ ] No error messages in server console

---

## 🎯 Expected Flow:

1. **User submits payment** → Frontend sends POST to `/api/bookings/:id/submit`
2. **Server receives request** → Uploads to Cloudinary
3. **Server saves booking** → Updates database
4. **Server calls email function** → Logs "📧 Attempting to send..."
5. **Nodemailer sends email** → Logs "✅ Email sent successfully"
6. **Admin receives email** → Check inbox/spam

---

## 📞 Next Steps:

1. **Restart server** with new logging
2. **Make a test booking** on localhost
3. **Copy the server console output** and share it
4. **Check if email arrives** in inbox/spam

The detailed logs will show exactly where the issue is!

---

*Debug guide created: December 1, 2025*
