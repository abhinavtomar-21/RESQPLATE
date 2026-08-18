import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

async function checkAuthLogs() {
  const client = new Client({
    connectionString,
  });

  try {
    await client.connect();
    console.log('Connected to PostgreSQL Database.');

    // Query audit log entries for any recent errors or email-related logs
    const res = await client.query(`
      SELECT id, payload, created_at
      FROM auth.audit_log_entries
      ORDER BY created_at DESC
      LIMIT 20
    `);

    console.log('\n--- AUTH AUDIT LOGS ---');
    if (res.rows.length === 0) {
      console.log('No recent logs found.');
    } else {
      for (const row of res.rows) {
        console.log(`[${row.created_at}] Payload:`, JSON.stringify(row.payload, null, 2));
      }
    }
  } catch (err) {
    console.error('Error querying auth logs:', err);
  } finally {
    await client.end();
  }
}

checkAuthLogs();
