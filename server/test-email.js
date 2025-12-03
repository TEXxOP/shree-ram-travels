// Test script to verify Nodemailer configuration
const nodemailer = require('nodemailer');
require('dotenv').config();

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;

console.log('Testing email configuration...');
console.log('EMAIL_USER:', EMAIL_USER);
console.log('EMAIL_PASS:', EMAIL_PASS ? '***' + EMAIL_PASS.slice(-4) : 'NOT SET');
console.log('ADMIN_EMAIL:', ADMIN_EMAIL);

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    tls: {
        rejectUnauthorized: false
    }
});

// Test 1: Verify configuration
console.log('\n--- Test 1: Verifying transporter configuration ---');
transporter.verify(function (error, success) {
    if (error) {
        console.error('❌ Configuration Error:', error.message);
        console.error('Error code:', error.code);
        console.error('\nPossible issues:');
        console.error('1. Wrong app password in .env file');
        console.error('2. 2-Step Verification not enabled on Gmail');
        console.error('3. App password not generated correctly');
        console.error('4. "Less secure app access" needs to be enabled (if not using app password)');
        process.exit(1);
    } else {
        console.log('✅ Server is ready to send emails');
        
        // Test 2: Send actual test email
        console.log('\n--- Test 2: Sending test email ---');
        const mailOptions = {
            from: EMAIL_USER,
            to: ADMIN_EMAIL,
            subject: 'Test Email from Shree Ram Travels',
            html: `
                <h2>Email Configuration Test</h2>
                <p>This is a test email from your Shree Ram Travels booking system.</p>
                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                <p>If you received this email, your Nodemailer configuration is working correctly! ✅</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('❌ Failed to send test email:', error.message);
                console.error('Error code:', error.code);
                process.exit(1);
            } else {
                console.log('✅ Test email sent successfully!');
                console.log('Message ID:', info.messageId);
                console.log('Response:', info.response);
                console.log('\nCheck your inbox at:', ADMIN_EMAIL);
                process.exit(0);
            }
        });
    }
});
