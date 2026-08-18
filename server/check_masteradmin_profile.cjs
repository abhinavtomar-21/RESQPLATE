const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
    await client.connect();
    const { rows } = await client.query('SELECT p.id, p.role FROM profiles p JOIN auth.users u ON p.id = u.id WHERE u.email = $1', ['masteradmin@resqplate.com']);
    console.log('Profile:', rows);
    await client.end();
}
run().catch(console.error);
