const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);
async function run() {
  console.log(await supabase.auth.signUp({
    email: 'test_quick_' + Date.now() + '@test.com',
    password: 'Password123!',
    options: { data: { role: 'Restaurant', name: 'Test' } }
  }));
}
run();
