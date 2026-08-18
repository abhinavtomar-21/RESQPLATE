require('dotenv').config({path: '../.env'});
async function run() {
  const res = await fetch('https://dawhamkadgqnlpjyvqjd.supabase.co/auth/v1/signup', {
    method: 'POST',
    headers: { 'apikey': process.env.VITE_SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'testrate' + Date.now() + '@test.com', password: 'Password123!', data: { role: 'Restaurant' } })
  });
  console.log('Status:', res.status);
  console.log('Body:', await res.text());
}
run();
