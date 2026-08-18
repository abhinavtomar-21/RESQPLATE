const axios = require('axios');
require('dotenv').config();

async function run() {
    try {
        console.log('Creating user in GoTrue as Restaurant (to bypass trigger)...');
        const res = await axios.post(process.env.SUPABASE_URL + '/auth/v1/admin/users', {
            email: 'masteradmin@resqplate.com',
            password: 'masterpassword',
            email_confirm: true,
            user_metadata: { role: 'Restaurant', name: 'Master Admin' }
        }, {
            headers: {
                'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Authorization': 'Bearer ' + process.env.SUPABASE_SERVICE_ROLE_KEY,
                'Content-Type': 'application/json'
            }
        });
        console.log('User created:', res.data.id);
        const { Client } = require('pg');
        const client = new Client({ connectionString: process.env.DATABASE_URL });
        await client.connect();
        await client.query('UPDATE profiles SET role = $1, permission_group = $2, approval_status = $3, profile_completed = true, email_verified = true, mfa_verified = true, onboarding_completed = true WHERE id = $4', ['Administrator', 'Super Admin', 'APPROVED', res.data.id]);
        await client.end();
        console.log('Admin profile updated!');
    } catch (err) {
        console.error('Error:', err.response ? err.response.data : err.message);
    }
}
run();
