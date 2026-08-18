const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data, error } = await supabase.auth.signInWithPassword({ email: 'restaurant@resqplate.com', password: 'password123' });
    if (error) console.log('LOGIN FAILED:', error.message);
    else console.log('LOGIN SUCCESS! User ID:', data.user.id);
}
run();
