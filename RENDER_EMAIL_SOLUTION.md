# 📧 Render Email Issue - Solutions

## ⚠️ Problem: Render Free Tier Blocks SMTP

**Error**: `Connection timeout` (ETIMEDOUT)  
**Cause**: Render's free tier blocks outbound SMTP connections (ports 25, 465, 587)

---

## ✅ Solution Options:

### Option 1: Check Render Logs (Current Workaround)

Since SMTP is blocked, the server now **logs all email details** in Render logs:

1. Go to Render Dashboard → Your service → **Logs**
2. When a booking is submitted, you'll see:
   ```
   📧 EMAIL DETAILS (SMTP blocked on Render free tier):
   To: harishkumarsaini18@gmail.com
   Subject: ACTION REQUIRED: Payment Verification...
   Booking TS: 99E7B564
   Customer: John Doe, john@example.com
   Amount: 1500
   Payment Proof: https://cloudinary.com/...
   ```
3. Manually check bookings in **Admin Dashboard**

**Pros**: Free, works immediately  
**Cons**: No automatic email notifications

---

### Option 2: Upgrade Render to Paid Plan ($7/month)

Render's paid plans allow SMTP connections.

1. Go to Render Dashboard
2. Click your service → **Settings**
3. Scroll to **Instance Type**
4. Upgrade to **Starter** ($7/month)
5. Emails will work automatically

**Pros**: Emails work, no code changes, faster server  
**Cons**: $7/month cost

---

### Option 3: Use SendGrid API (Free Alternative) ⭐ RECOMMENDED

SendGrid offers 100 free emails/day via API (no SMTP needed).

#### Setup Steps:

1. **Sign up for SendGrid**:
   - Go to https://sendgrid.com/
   - Create free account
   - Verify your email

2. **Create API Key**:
   - Dashboard → Settings → API Keys
   - Click "Create API Key"
   - Name: "Shree Ram Travels"
   - Permissions: "Full Access"
   - Copy the API key

3. **Install SendGrid in your project**:
   ```bash
   cd server
   npm install @sendgrid/mail
   ```

4. **Update server.js** (I'll provide code below)

5. **Add to Render Environment Variables**:
   ```
   SENDGRID_API_KEY=your_api_key_here
   ```

6. **Push to GitHub** - Render auto-deploys

**Pros**: Free (100 emails/day), reliable, no SMTP needed  
**Cons**: Requires code change (I can help)

---

### Option 4: Use Mailgun API (Alternative)

Similar to SendGrid, Mailgun offers free API-based emails.

- Free tier: 5,000 emails/month
- Setup similar to SendGrid
- Good alternative if SendGrid doesn't work

---

## 🚀 Quick Fix: Use SendGrid (Recommended)

### Step 1: Install SendGrid

```bash
cd server
npm install @sendgrid/mail
git add package.json package-lock.json
git commit -m "Add SendGrid for email"
git push origin main
```

### Step 2: Update server.js

Replace the Nodemailer code with SendGrid:

```javascript
// At the top with other requires
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Replace sendAdminNotification function
const sendAdminNotification = async (bookingData, imageUrl) => {
    const msg = {
        to: ADMIN_EMAIL,
        from: EMAIL_USER, // Must be verified in SendGrid
        subject: `ACTION REQUIRED: Payment Verification for Booking ${bookingData.TS}`,
        html: `
            <p>A new payment proof screenshot has been uploaded. <strong>TS NUMBER: ${bookingData.TS}</strong></p>
            <p><strong>Booking ID:</strong> ${bookingData._id}</p>
            <p><strong>Status:</strong> Processing</p>
            <p><strong>Customer:</strong> ${bookingData.userName} (${bookingData.userPhone}, ${bookingData.userEmail})</p>
            <p><strong>Trip:</strong> ${bookingData.departureCity} to ${bookingData.destinationCity} on ${new Date(bookingData.departureDate).toLocaleDateString()}</p>
            <p><strong>Amount:</strong> ₹${bookingData.totalAmount.toFixed(2)}</p>
            <p style="margin-top: 15px;"><strong>VIEW PROOF:</strong> <a href="${imageUrl}" target="_blank">Click here to view screenshot</a></p>
            <p>Please log into the Admin Dashboard to verify the payment.</p>
        `,
    };

    try {
        await sgMail.send(msg);
        console.log('✅ Admin notification email sent successfully via SendGrid.');
    } catch (error) {
        console.error('❌ Error sending email via SendGrid:', error.message);
        if (error.response) {
            console.error('SendGrid error:', error.response.body);
        }
    }
};
```

### Step 3: Add SendGrid API Key to Render

1. Render Dashboard → Your service → **Environment**
2. Add new variable:
   - Key: `SENDGRID_API_KEY`
   - Value: Your SendGrid API key
3. Save Changes (auto-redeploys)

---

## 📊 Comparison:

| Solution | Cost | Setup Time | Reliability |
|----------|------|------------|-------------|
| **Check Logs** | Free | 0 min | Manual |
| **Upgrade Render** | $7/mo | 2 min | High |
| **SendGrid API** | Free | 15 min | High |
| **Mailgun API** | Free | 15 min | High |

---

## 💡 My Recommendation:

**For now**: Use the logs workaround (check Admin Dashboard)  
**For production**: Implement SendGrid API (free, reliable)  
**If budget allows**: Upgrade Render ($7/month for better performance anyway)

---

## 🔧 Current Status:

- ✅ Emails work on localhost
- ❌ Emails blocked on Render free tier
- ✅ Booking system works (just no email notifications)
- ✅ Admin can check bookings in dashboard
- ✅ Payment proofs uploaded to Cloudinary
- ✅ Logs show all booking details

---

## 📞 Need Help Implementing SendGrid?

Let me know and I'll:
1. Install SendGrid package
2. Update the code
3. Push to GitHub
4. Guide you through getting the API key

---

*Created: December 4, 2025*  
*Issue: Render free tier blocks SMTP*  
*Status: Workaround active, SendGrid recommended*
