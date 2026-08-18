const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });
const email = process.argv[2];

async function run() {
    if (!email) { console.log('Please provide an email. Example: node make_admin.cjs you@email.com'); process.exit(1); }
    await client.connect();
    const { rows } = await client.query('SELECT id FROM auth.users WHERE email = $1', [email]);
    if (rows.length === 0) { console.log('User not found in auth.users. Please sign up in the browser first.'); process.exit(1); }
    const userId = rows[0].id;
    await client.query('UPDATE profiles SET role = $1, permission_group = $2, approval_status = $3, profile_completed = true, email_verified = true, mfa_verified = true, onboarding_completed = true WHERE id = $4', ['Administrator', 'Super Admin', 'APPROVED', userId]);
    console.log(SUCCESS! $'{email}' has been elevated to System Administrator.);
    await client.end();
}
run().catch(console.error);
