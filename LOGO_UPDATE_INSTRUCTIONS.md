# 🎨 Logo Update Instructions

## 📋 Steps to Add Your New Logo

### 1. **Save Your Logo Image**
- Save your logo image as `shree-ram-logo.png`
- Place it in the `client/public/` folder
- Recommended size: 300px width, transparent background
- Format: PNG for best quality with transparency

### 2. **Logo Locations Updated**

#### ✅ **Website Header**
- **File**: `client/src/App.js`
- **Location**: Main navigation header
- **Size**: 80px height, auto width
- **Usage**: Clickable logo that links to homepage

#### ✅ **Email Templates**
- **Customer E-Tickets**: Professional emails with logo in header
- **Admin Notifications**: New booking and payment alerts
- **Payment Verification**: Admin notification emails
- **Size**: 60px height for email compatibility

#### ✅ **Company Branding Updated**
- **Name**: Changed from "Shree Ram Travels" to "Shree Ram Tour and Travels"
- **Bank Details**: Updated company name in payment information
- **Contact Information**: Updated throughout the system
- **Email Footers**: Updated branding in all email templates

### 3. **File Structure**
```
client/
├── public/
│   ├── shree-ram-logo.png  ← Your new logo goes here
│   ├── favicon.ico
│   └── index.html
└── src/
    └── App.js  ← Logo reference updated
```

### 4. **Logo Specifications**

#### **Website Display**
- **Format**: PNG with transparent background
- **Dimensions**: Flexible width, 80px height
- **Colors**: Should work on white background
- **File Size**: Keep under 100KB for fast loading

#### **Email Display**
- **Format**: PNG (best email compatibility)
- **Dimensions**: 300px width recommended
- **Colors**: Should work on gradient backgrounds
- **Hosting**: Automatically served from your domain

### 5. **Current Logo Implementation**

#### **Website Header**
```javascript
<img 
    src="/shree-ram-logo.png" 
    alt="Shree Ram Tour and Travels Logo" 
    style={{height: '80px', width: 'auto'}}
/>
```

#### **Email Templates**
```html
<img 
    src="https://shree-ram-travels.vercel.app/shree-ram-logo.png" 
    alt="Shree Ram Tour and Travels" 
    style="height: 60px; width: auto;" 
/>
```

### 6. **Testing Your Logo**

#### **After Adding the Logo File:**
1. **Local Testing**: Run `npm start` in client folder
2. **Check Header**: Logo should appear in navigation
3. **Check Responsiveness**: Test on mobile devices
4. **Email Testing**: Send test booking to verify email logos

#### **Deployment Testing:**
1. **Commit Changes**: `git add . && git commit -m "Update logo"`
2. **Push to GitHub**: `git push origin main`
3. **Vercel Deploy**: Automatic deployment will include new logo
4. **Live Testing**: Check live website and email templates

### 7. **Troubleshooting**

#### **Logo Not Showing:**
- ✅ Check file name: Must be exactly `shree-ram-logo.png`
- ✅ Check location: Must be in `client/public/` folder
- ✅ Check file size: Should be under 5MB
- ✅ Clear browser cache: Hard refresh (Ctrl+F5)

#### **Email Logo Issues:**
- ✅ Logo loads from your live domain
- ✅ Must be deployed to Vercel first
- ✅ Check email client compatibility
- ✅ Test with different email providers

### 8. **Brand Consistency**

#### **Updated Throughout System:**
- ✅ **Website Header**: New logo displayed
- ✅ **Email Templates**: Logo in all email headers
- ✅ **Company Name**: "Shree Ram Tour and Travels"
- ✅ **Bank Details**: Updated company name
- ✅ **Contact Information**: Consistent branding
- ✅ **Admin Interface**: Updated references

#### **Color Scheme Maintained:**
- **Primary Blue**: #004d99 (headers, buttons)
- **Accent Green**: #28a745 (success, confirmations)
- **Background**: White/light gray
- **Text**: Dark gray (#343a40)

### 9. **Next Steps**

1. **Replace Logo File**: Add your `shree-ram-logo.png` to `client/public/`
2. **Test Locally**: Verify logo appears correctly
3. **Deploy**: Push changes to GitHub for automatic deployment
4. **Verify**: Check live website and test email functionality

### 10. **Support**

If you need help with:
- **Logo sizing or formatting**
- **Deployment issues**
- **Email template problems**
- **Brand consistency**

The logo system is now fully integrated and ready for your custom logo file!

---

**Updated**: December 29, 2024  
**Status**: Ready for Logo File  
**Compatibility**: All browsers, email clients  
**Performance**: Optimized for fast loading