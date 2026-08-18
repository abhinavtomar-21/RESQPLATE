const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const res = await client.query(`SELECT tgname FROM pg_trigger WHERE tgrelid = 'auth.users'::regclass`);
    console.log(res.rows);
  } catch(e) { console.error(e); }
  await client.end();
}
run();
