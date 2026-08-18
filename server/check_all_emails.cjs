const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
    await client.connect();
    const authRes = await client.query('SELECT email FROM auth.users');
    console.log('All emails in auth.users:', authRes.rows.map(r => r.email));
    await client.end();
}
run().catch(console.error);
