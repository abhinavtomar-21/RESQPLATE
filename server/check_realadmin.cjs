const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
    await client.connect();
    const { rows } = await client.query('SELECT id, email, encrypted_password, email_confirmed_at FROM auth.users WHERE email = $1', ['realadmin@resqplate.com']);
    console.log('User:', rows);
    await client.end();
}
run().catch(console.error);
