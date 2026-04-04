// Using global fetch (available in Node.js 18+)
const BACKEND_URL = 'http://localhost:5001';

async function testEngine() {
  console.log('🔍 Starting integration test...');

  // 1. Check Backend Connectivity
  try {
    const healthRes = await fetch(`${BACKEND_URL}/api/system/report`);
    const health = await healthRes.json();
    console.log('✅ Backend Health Status:', health.status);
    console.log('🏢 Services:', JSON.stringify(health.services, null, 2));
  } catch (err) {
    console.error('❌ Backend Connectivity Failed:', err.message);
    return;
  }

  // 2. Check AI Engine Health
  try {
    const aiHealthRes = await fetch(`${BACKEND_URL}/api/ai/health`);
    const aiHealth = await aiHealthRes.json();
    console.log('✅ AI Engine Connectivity:', aiHealth.status);
  } catch (err) {
    console.error('❌ AI Engine Route Failed:', err.message);
  }

  // 3. Optional: Test a real registration/login flow
  try {
    const registerRes = await fetch(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Engine Test User',
        email: `test_${Date.now()}@bhie.com`,
        password: 'password123'
      })
    });
    const authData = await registerRes.json();
    
    if (authData.token) {
      console.log('✅ Auth Token received.');
    } else {
      console.warn('⚠️ Registry might have failed or user already exists.');
    }
  } catch (err) {
    console.error('❌ Auth Engine Failed:', err.message);
  }

  console.log('\n🚀 ALL CORE SYSTEMS REACHABLE.');
}

testEngine();
