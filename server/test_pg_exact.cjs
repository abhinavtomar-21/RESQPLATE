const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  try {
    const meta = JSON.stringify({ role: 'Restaurant', name: 'abhinav', orgName: 'rotal', phone: '7817966868' });
    const query = `INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, raw_user_meta_data, created_at, updated_at) VALUES (gen_random_uuid(), '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'testpg_${Date.now()}@test.com', 'foo', '${meta}'::jsonb, NOW(), NOW())`;
    await client.query(query);
    console.log('Insert successful!');
  } catch (err) {
    console.error('Insert failed:', err.message);
  }
  await client.end();
}
run();
