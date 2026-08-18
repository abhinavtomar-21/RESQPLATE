const url = 'https://dawhamkadgqnlpjyvqjd.supabase.co/auth/v1/signup';
const anonKey = 'sb_publishable_k0AgQL_IJBF99y4ZSkRt9g_g6nkKX_m';

async function testRateLimit() {
  for(let i=0; i<10; i++) {
    const payload = {
      email: `test.rate.${Date.now()}.${i}@resqplate.com`,
      password: 'password123',
      data: { role: 'Restaurant Owner' }
    };
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      console.log(`[${i}] Status:`, res.status);
      if (!res.ok) console.log(`[${i}] Body:`, text);
    } catch(e) {
      console.log(`[${i}] Error:`, e);
    }
  }
}

testRateLimit();
