import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const connectionString = process.env.DATABASE_URL;

async function checkRecentUsers() {
  const client = new Client({ connectionString });

  try {
    await client.connect();
    
    const res = await client.query(`
      SELECT id, email, created_at, confirmation_sent_at, email_confirmed_at 
      FROM auth.users 
      ORDER BY created_at DESC 
      LIMIT 1
    `);

    console.log('\n--- MOST RECENT USER ---');
    if (res.rows.length === 0) {
      console.log('No users found.');
    } else {
      const user = res.rows[0];
      console.log(`Email: ${user.email}`);
      console.log(`Created At: ${user.created_at}`);
      console.log(`Confirmation Sent At: ${user.confirmation_sent_at}`);
      console.log(`Email Confirmed At: ${user.email_confirmed_at}`);
    }
  } catch (err) {
    console.error('Error querying auth.users:', err);
  } finally {
    await client.end();
  }
}

checkRecentUsers();
