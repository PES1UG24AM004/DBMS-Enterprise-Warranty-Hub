import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getPool, query } from '../lib/db';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

export async function runMigration() {
  console.log('--- Starting Enterprise Warranty Hub Database Migration ---');
  const sqlPath = path.resolve(process.cwd(), 'migrations/001_initial_schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  try {
    await query(sql);
    console.log('✔ Migration 001_initial_schema.sql applied successfully.');

    // Verify views and vector extension
    const vecRes = await query("SELECT extversion FROM pg_extension WHERE extname = 'vector';");
    console.log(`✔ pgvector extension verified (version: ${vecRes.rows[0]?.extversion || 'unknown'}).`);

    const viewRes = await query(
      "SELECT table_name FROM information_schema.views WHERE table_schema = 'public';"
    );
    console.log(
      '✔ Database views verified:',
      viewRes.rows.map((r) => r.table_name).join(', ')
    );
  } catch (err) {
    console.error('✘ Migration failed:', err);
    process.exit(1);
  }
}

const isDirectRun =
  process.argv[1] &&
  fileURLToPath(import.meta.url).toLowerCase() === path.resolve(process.argv[1]).toLowerCase();

if (isDirectRun) {
  runMigration().then(() => {
    getPool().end();
  }).catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
