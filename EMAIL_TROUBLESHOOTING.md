# 📧 Email Configuration Troubleshooting Guide

## Issue: Nodemailer Not Sending Emails

### ✅ FIXES APPLIED

1. **Updated EMAIL_PASS** in `.env` to correct app password
2. **Added transporter verification** on server startup
3. **Enhanced error logging** to show detailed error messages
4. **Created test script** to verify email configuration

---

## 🔧 How to Test Email Configuration

### Step 1: Run the Test Script
```bash
cd server
node test-email.js
```

This will:
- Verify your email credentials
- Test SMTP connection
- Send a test email to your admin email
- Show detailed error messages if something fails

---

## 🚨 Common Issues & Solutions

### Issue 1: "Invalid login: 535-5.7.8 Username and Password not accepted"

**Cause**: Wrong app password or 2-Step Verification not enabled

**Solution**:
1. Go to Google Account: https://myaccount.google.com/
2. Navigate to **Security** → **2-Step Verification** (enable if not enabled)
3. Scroll down to **App passwords**
4. Generate a new app password:
   - Select app: **Mail**
   - Select device: **Other (Custom name)** → "Shree Ram Travels"
5. Copy the 16-character password (e.g., `abcd efgh ijkl mnop`)
6. Update `.env` file:
   ```
   EMAIL_PASS="abcdefghijklmnop"  # Remove spaces
   ```

---

### Issue 2: "Connection timeout" or "ETIMEDOUT"

**Cause**: Firewall or network blocking SMTP port 587

**Solution**:
1. Check if port 587 is open
2. Try alternative configuration in `server.js`:
   ```javascript
   const transporter = nodemailer.createTransport({
       host: 'smtp.gmail.com',
       port: 465,  // Use SSL instead of STARTTLS
       secure: true,  // true for 465, false for other ports
       auth: {
           user: EMAIL_USER,
           pass: EMAIL_PASS,
       }
   });
   ```

---

### Issue 3: "Less secure app access" error

**Cause**: Google blocking access from less secure apps

**Solution**:
- **Recommended**: Use App Passwords (see Issue 1)
- **Alternative**: Enable "Less secure app access" (not recommended)
  - Go to: https://myaccount.google.com/lesssecureapps
  - Turn on "Allow less secure apps"

---

### Issue 4: Email sends but not received

**Cause**: Email in spam folder or wrong recipient

**Solution**:
1. Check spam/junk folder
2. Verify `ADMIN_EMAIL` in `.env` is correct
3. Check Gmail "Sent" folder to confirm email was sent
4. Add sender to contacts to prevent spam filtering

---

## 🔍 Current Configuration

### Environment Variables (.env):
```
EMAIL_USER="luvthapa8@gmail.com"
EMAIL_PASS="iodohlhbtfxpsizk"  # Updated to correct app password
ADMIN_EMAIL="luvthapa8@gmail.com"
```

### Nodemailer Settings (server.js):
```javascript
service: 'gmail'
host: 'smtp.gmail.com'
port: 587
secure: false  // STARTTLS
```

---

## 📝 Verification Checklist

Run through this checklist:

- [ ] 2-Step Verification enabled on Gmail account
- [ ] App password generated (16 characters)
- [ ] App password copied to `.env` (no spaces)
- [ ] `.env` file in `server/` directory
- [ ] Server restarted after `.env` changes
- [ ] Test script runs successfully: `node test-email.js`
- [ ] Test email received in inbox
- [ ] Check spam folder if not in inbox

---

## 🧪 Manual Test Commands

### Test 1: Check environment variables
```bash
cd server
node -e "require('dotenv').config(); console.log('EMAIL_USER:', process.env.EMAIL_USER); console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '***' + process.env.EMAIL_PASS.slice(-4) : 'NOT SET');"
```

### Test 2: Run email test script
```bash
cd server
node test-email.js
```

### Test 3: Start server and check logs
```bash
cd server
node server.js
```

Look for:
- ✅ "Email server is ready to send messages" (success)
- ❌ "Nodemailer configuration error" (failure - check credentials)

---

## 🔄 Alternative Email Services

If Gmail continues to have issues, consider these alternatives:

### Option 1: SendGrid (Recommended for production)
```javascript
// Install: npm install @sendgrid/mail
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
    to: ADMIN_EMAIL,
    from: EMAIL_USER,
    subject: 'Payment Verification',
    html: '...'
};

await sgMail.send(msg);
```

### Option 2: Mailgun
```javascript
// Install: npm install mailgun-js
const mailgun = require('mailgun-js')({
    apiKey: process.env.MAILGUN_API_KEY,
    domain: process.env.MAILGUN_DOMAIN
});
```

### Option 3: AWS SES (Simple Email Service)
```javascript
// Install: npm install @aws-sdk/client-ses
const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");
```

---

## 📞 Support

If issues persist after trying all solutions:

1. **Check server logs** for detailed error messages
2. **Verify Gmail account** is not locked or suspended
3. **Test with different email** to rule out account-specific issues
4. **Contact Google Support** if account access issues

---

## ✅ Expected Behavior After Fix

When a user submits payment proof:

1. **Server logs** should show:
   ```
   ✅ Admin notification email sent successfully.
   Message ID: <some-id@gmail.com>
   ```

2. **Admin email** should receive:
   - Subject: "ACTION REQUIRED: Payment Verification for Booking [TS]"
   - Body: Booking details with clickable Cloudinary link
   - Within 1-2 minutes of submission

3. **User sees**: "Submission successful! Your payment is under verification."

---

## 🎯 Quick Fix Summary

**What was changed:**
1. ✅ Fixed `EMAIL_PASS` in `.env` (was: `oasyfchpyjautruy`, now: `iodohlhbtfxpsizk`)
2. ✅ Added transporter verification on server startup
3. ✅ Enhanced error logging with detailed messages
4. ✅ Created `test-email.js` script for testing

**Next steps:**
1. Run `node server/test-email.js` to verify configuration
2. Check for test email in inbox
3. If test passes, emails will work in production
4. If test fails, follow troubleshooting steps above

---

*Last updated: December 1, 2025*
