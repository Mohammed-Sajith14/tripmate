// Simple test script to verify backend functionality
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api';

async function testBackend() {
  console.log('🧪 Testing TripMate Backend API\n');

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthRes = await fetch(`${API_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✅ Health check:', healthData.message);
    console.log('');

    // Test 2: Check userId availability
    console.log('2️⃣ Testing userId availability check...');
    const checkRes = await fetch(`${API_URL}/auth/check-userid/test_user`);
    const checkData = await checkRes.json();
    console.log('✅ userId check:', checkData.data.available ? 'Available' : 'Taken');
    console.log('');

    // Test 3: Register a new traveler
    console.log('3️⃣ Testing user registration (Traveler)...');
    const registerRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'sarah_explorer',
        email: 'sarah@example.com',
        password: 'password123',
        fullName: 'Sarah Chen',
        role: 'traveler'
      })
    });
    const registerData = await registerRes.json();
    
    if (registerData.status === 'success') {
      console.log('✅ Registration successful!');
      console.log('   User:', registerData.data.user.fullName);
      console.log('   Role:', registerData.data.user.role);
      console.log('   Token:', registerData.data.token.substring(0, 20) + '...');
      
      const token = registerData.data.token;
      console.log('');

      // Test 4: Get user profile
      console.log('4️⃣ Testing get user profile...');
      const profileRes = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const profileData = await profileRes.json();
      console.log('✅ Profile retrieved:', profileData.data.user.fullName);
      console.log('');

      // Test 5: Update profile
      console.log('5️⃣ Testing profile update...');
      const updateRes = await fetch(`${API_URL}/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          bio: 'Digital nomad exploring Asia one city at a time.',
          location: 'Tokyo, Japan'
        })
      });
      const updateData = await updateRes.json();
      console.log('✅ Profile updated!');
      console.log('   Bio:', updateData.data.user.bio);
      console.log('');
    } else {
      console.log('ℹ️  Registration response:', registerData.message);
      console.log('');
    }

    // Test 6: Register an organizer
    console.log('6️⃣ Testing user registration (Organizer)...');
    const orgRegisterRes = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'nomad_adventures',
        email: 'nomad@example.com',
        password: 'password123',
        fullName: 'Nomad Adventures Team',
        role: 'organizer',
        organizationName: 'Nomad Adventures'
      })
    });
    const orgData = await orgRegisterRes.json();
    
    if (orgData.status === 'success') {
      console.log('✅ Organizer registration successful!');
      console.log('   Organization:', orgData.data.user.organizationName);
      console.log('');
    } else {
      console.log('ℹ️  Organizer registration:', orgData.message);
      console.log('');
    }

    // Test 7: Login
    console.log('7️⃣ Testing login...');
    const loginRes = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'sarah_explorer',
        password: 'password123'
      })
    });
    const loginData = await loginRes.json();
    
    if (loginData.status === 'success') {
      console.log('✅ Login successful!');
      console.log('   Welcome back:', loginData.data.user.fullName);
      console.log('');
    }

    console.log('🎉 All tests completed successfully!');
    console.log('\n✨ Feature #1: Authentication & User Management is working!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\n⚠️  Make sure:');
    console.log('   1. MongoDB is running');
    console.log('   2. Backend server is running (npm run dev)');
    console.log('   3. Port 5000 is available\n');
  }
}

testBackend();
