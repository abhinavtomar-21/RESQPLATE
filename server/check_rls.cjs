const { Client } = require('pg');
require('dotenv').config();

const client = new Client({ connectionString: process.env.DATABASE_URL });

async function run() {
    await client.connect();
    const { rows } = await client.query(SELECT pol.policyname, pol.cmd, pol.qual FROM pg_policy pol JOIN pg_class cl ON pol.polrelid = cl.oid WHERE cl.relname = 'profiles');
    console.log('Policies:', rows);
    await client.end();
}
run().catch(console.error);
