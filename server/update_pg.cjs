const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
    await client.connect();
    const res = await client.query('UPDATE profiles SET role = $1, permission_group = $2, approval_status = $3, profile_completed = true, email_verified = true, mfa_verified = true, onboarding_completed = true WHERE email = $4 RETURNING id', ['Administrator', 'Super Admin', 'APPROVED', 'abhitomar2538@gmail.com']);
    console.log('Updated user:', res.rows[0]);
    await client.end();
}
run().catch(console.error);
