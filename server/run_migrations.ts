import pkg from 'pg';
const { Client } = pkg;
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL is missing in .env");
  process.exit(1);
}

const client = new Client({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function runMigrations() {
  await client.connect();
  console.log("Connected to database.");

  const combinedPath = path.resolve(__dirname, '../supabase/schema_combined.sql');
  console.log(`Running combined schema migration: ${combinedPath}...`);
  const sqlCombined = fs.readFileSync(combinedPath, 'utf8');
  try {
    await client.query(sqlCombined);
    console.log(`✅ Success: schema_combined.sql`);
  } catch (err: any) {
    console.error(`❌ Error in schema_combined.sql:`, err.message);
  }

  const seedPath = path.resolve(__dirname, '../supabase/migrations/011_seed.sql');
  console.log(`Running seed script: ${seedPath}...`);
  const sqlSeed = fs.readFileSync(seedPath, 'utf8');
  try {
    await client.query(sqlSeed);
    console.log(`✅ Success: 011_seed.sql`);
  } catch (err: any) {
    console.error(`❌ Error in 011_seed.sql:`, err.message);
  }

  await client.end();
  console.log("Migrations complete.");
}

runMigrations();
