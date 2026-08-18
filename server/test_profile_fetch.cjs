const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    const { data: sessionData } = await supabase.auth.signInWithPassword({ email: 'masteradmin@resqplate.com', password: 'masterpassword' });
    const { data: profile, error } = await supabase.from('profiles').select('*').eq('id', sessionData.user.id).single();
    console.log('Profile fetch error:', error);
    console.log('Profile data:', profile);
}
run();
