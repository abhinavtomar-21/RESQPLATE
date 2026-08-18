const { Client } = require('pg');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function run() {
    await client.connect();
    console.log('Deleting admin@resqplate.com from auth.users...');
    await client.query('DELETE FROM auth.users WHERE email = $1', ['admin@resqplate.com']);
    
    console.log('Signing up admin@resqplate.com with admin123...');
    const { data, error } = await supabase.auth.signUp({ email: 'admin@resqplate.com', password: 'admin123' });
    if (error) { console.error('Sign up failed:', error.message); return; }
    
    const userId = data.user.id;
    console.log('New User ID:', userId);
    
    console.log('Updating user to Administrator...');
    await client.query('UPDATE auth.users SET email_confirmed_at = NOW() WHERE id = $1', [userId]);
    await client.query('UPDATE profiles SET role = $1, permission_group = $2, approval_status = $3, profile_completed = true, email_verified = true, mfa_verified = true, onboarding_completed = true WHERE id = $4', ['Administrator', 'Super Admin', 'APPROVED', userId]);
    
    console.log('Verifying login...');
    const { error: loginError } = await supabase.auth.signInWithPassword({ email: 'admin@resqplate.com', password: 'admin123' });
    if (loginError) console.error('Login failed:', loginError.message);
    else console.log('ALL FIXES COMPLETE! LOGIN SUCCESS!');
    
    await client.end();
}
run().catch(console.error);
