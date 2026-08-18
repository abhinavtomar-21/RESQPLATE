const { Client } = require('pg');
require('dotenv').config();
const client = new Client({ connectionString: process.env.DATABASE_URL });
async function run() {
  await client.connect();
  const tables = ['profiles', 'verification_requests', 'donations', 'fraud_alerts', 'audit_logs', 'notifications'];
  for (const table of tables) {
    await client.query('GRANT ALL ON TABLE public.' + table + ' TO anon, authenticated, service_role;');
    console.log('Granted permissions on ' + table);
  }
  await client.end();
}
run().catch(console.error);
