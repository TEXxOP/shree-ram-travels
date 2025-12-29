const axios = require('axios');
require('dotenv').config();

const API_BASE_URL = 'http://localhost:5000';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'shreeram_admin_token_123';

async function testSeatAPI() {
    try {
        console.log('🧪 Testing Seat Management API...\n');

        // Test 1: Get seat availability (public endpoint)
        console.log('1. Testing seat availability endpoint...');
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/seats/availability/placeholder-route-id`,
                { params: { departureTime: '07:00 AM', departureDate: '2024-12-30' } }
            );
            console.log('✅ Seat availability endpoint working');
            console.log(`   Found ${response.data.totalSeats} seats`);
        } catch (err) {
            console.log('❌ Seat availability endpoint failed:', err.response?.data?.message || err.message);
        }

        // Test 2: Get admin seats for route (admin endpoint)
        console.log('\n2. Testing admin seat management endpoint...');
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/admin/seats/route/placeholder-route-id`,
                { 
                    params: { departureTime: '07:00 AM', departureDate: '2024-12-30' },
                    headers: { 'x-admin-token': ADMIN_TOKEN }
                }
            );
            console.log('✅ Admin seat management endpoint working');
            console.log(`   Found ${response.data.totalSeats} seats for admin`);
        } catch (err) {
            console.log('❌ Admin seat management endpoint failed:', err.response?.data?.message || err.message);
        }

        // Test 3: Test pricing endpoint
        console.log('\n3. Testing pricing management endpoint...');
        try {
            const response = await axios.get(
                `${API_BASE_URL}/api/admin/pricing/route/placeholder-route-id`,
                { headers: { 'x-admin-token': ADMIN_TOKEN } }
            );
            console.log('✅ Pricing management endpoint working');
            console.log(`   Found ${response.data.pricing.length} pricing records`);
        } catch (err) {
            console.log('❌ Pricing management endpoint failed:', err.response?.data?.message || err.message);
        }

        console.log('\n🎉 Seat API testing completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
    }
}

// Run the test
testSeatAPI();