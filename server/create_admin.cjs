const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function run() {
    const { data: { user }, error } = await supabase.auth.admin.createUser({
        email: 'superadmin@resqplate.com',
        password: 'admin123',
        email_confirm: true,
        user_metadata: { role: 'Administrator', name: 'Super Admin' }
    });
    if (error) { console.error('Error creating user:', error); return; }
    console.log('Created auth user:', user.id);
    
    const { Client } = require('pg');
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    await client.connect();
    await client.query('UPDATE profiles SET role = $1, permission_group = $2, approval_status = $3, profile_completed = true, email_verified = true, mfa_verified = true, onboarding_completed = true WHERE id = $4', ['Administrator', 'Super Admin', 'APPROVED', user.id]);
    await client.end();
    console.log('Updated profile!');
}
run().catch(console.error);
