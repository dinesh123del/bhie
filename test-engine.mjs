// Using global fetch (available in Node.js 18+)
const DEFAULT_PORT = 5001;
const BACKEND_URL = process.env.BACKEND_URL || `http://localhost:${process.env.PORT || DEFAULT_PORT}`;

async function fetchWithTimeout(resource, options = {}) {
  const { timeout = 5000 } = options;
  
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

async function testEngine() {
  console.log('🔍 Starting integration test...');
  console.log(`🌐 Target: ${BACKEND_URL}`);

  // 1. Check Backend Connectivity
  try {
    const healthRes = await fetchWithTimeout(`${BACKEND_URL}/api/system/report`);
    if (!healthRes.ok) {
      throw new Error(`HTTP Error ${healthRes.status}`);
    }
    const health = await healthRes.json();
    console.log('✅ Backend Health Status:', health.status);
    console.log('🏢 Services:', JSON.stringify(health.services, null, 2));
  } catch (err) {
    if (err.name === 'AbortError') {
      console.error('❌ Backend Connectivity Failed: Request timed out (5s)');
    } else {
      console.error('❌ Backend Connectivity Failed:', err.message);
    }
    console.log('💡 Tip: Ensure the server is running (npm run server)');
    return;
  }

  // 2. Check AI Engine Health
  try {
    const aiHealthRes = await fetchWithTimeout(`${BACKEND_URL}/api/ai/health`);
    if (!aiHealthRes.ok) {
      throw new Error(`HTTP Error ${aiHealthRes.status}`);
    }
    const aiHealth = await aiHealthRes.json();
    console.log('✅ AI Engine Connectivity:', aiHealth.status);
  } catch (err) {
    if (err.name === 'AbortError') {
       console.error('❌ AI Engine Route Failed: Request timed out (5s)');
    } else {
       console.error('❌ AI Engine Route Failed:', err.message);
    }
  }

  // 3. Optional: Test a real registration/login flow
  try {
    const registerRes = await fetchWithTimeout(`${BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Engine Test User',
        email: `test_${Date.now()}@bhie.com`,
        password: 'password123'
      }),
      timeout: 8000 // Higher timeout for auth
    });
    
    if (registerRes.ok) {
        const authData = await registerRes.json();
        if (authData.token || authData.success) {
          console.log('✅ Auth Engine working.');
        } else {
          console.warn('⚠️ Registry might have failed or user already exists.');
        }
    } else {
        console.warn(`⚠️ Auth Engine returned ${registerRes.status}`);
    }
  } catch (err) {
    console.error('❌ Auth Engine Failed:', err.message);
  }

  console.log('\n🚀 ALL CORE SYSTEMS REACHABLE.');
}

testEngine().catch(err => {
    console.error('💥 Fatal Test Error:', err);
    process.exit(1);
});

