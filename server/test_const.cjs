const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const res = await client.query(`SELECT constraint_name, pg_get_constraintdef(oid) FROM pg_constraint WHERE conrelid = 'public.profiles'::regclass`);
    console.log(res.rows);
  } catch(e) { console.error(e); }
  await client.end();
}
run();
