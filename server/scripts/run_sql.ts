import fs from 'fs';
import path from 'path';
import { pool } from '../src/db.js';
import dotenv from 'dotenv';

dotenv.config({ path: 'server/.env' });

async function runSql() {
  const filePath = process.argv[2];
  if (!filePath) {
    console.error('Usage: tsx run_sql.ts <path-to-sql-file>');
    process.exit(1);
  }

  const absolutePath = path.resolve(filePath);
  const sql = fs.readFileSync(absolutePath, 'utf-8');

  try {
    console.log(`Executing SQL from ${absolutePath}...`);
    await pool.query(sql);
    console.log('✅ SQL execution successful.');
  } catch (err: any) {
    console.error('❌ SQL execution failed:', err.message);
  } finally {
    await pool.end();
  }
}

runSql();
