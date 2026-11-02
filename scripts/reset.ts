import path from 'path';
import dotenv from 'dotenv';
import { query, getPool } from '../lib/db';
import { runMigration } from './migrate';
import { seedDatabase } from './seed';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

async function reset() {
  console.log('========================================================');
  console.log('   Enterprise Warranty Hub (EWH) - Local DB Reset      ');
  console.log('========================================================\n');

  // Safety checks
  const dbUrl = process.env.DATABASE_URL || '';
  const pgHost = process.env.PGHOST || 'localhost';

  const isLocal =
    pgHost === 'localhost' ||
    pgHost === '127.0.0.1' ||
    dbUrl.includes('localhost') ||
    dbUrl.includes('127.0.0.1');

  if (!isLocal || process.env.NODE_ENV === 'production') {
    console.error('⛔ SAFETY ABORT: db:reset is restricted to local development environments only!');
    console.error(`Target host: "${pgHost}". Reset refused.`);
    process.exit(1);
  }

  console.log('⚠ WARNING: This will DROP and RE-CREATE all local demo data and tables in PostgreSQL.');
  console.log('Resetting schema...');

  await query(`
    DROP VIEW IF EXISTS critical_asset_dashboard CASCADE;
    DROP VIEW IF EXISTS asset_warranty_status CASCADE;
    DROP TABLE IF EXISTS asset_maintenance_ledger CASCADE;
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP TABLE IF EXISTS maintenance_records CASCADE;
    DROP TABLE IF EXISTS tickets CASCADE;
    DROP TABLE IF EXISTS warranties CASCADE;
    DROP TABLE IF EXISTS assets CASCADE;
    DROP TABLE IF EXISTS users CASCADE;
  `);
  console.log('✔ All previous demo tables and views dropped.');

  console.log('\nRe-applying fresh migrations...');
  await runMigration();

  console.log('\nRe-seeding demo data and vector embeddings...');
  await seedDatabase();

  console.log('\n✔ Demo database successfully reset and re-seeded!');
}

reset()
  .then(() => {
    getPool().end();
  })
  .catch((err) => {
    console.error('✘ Reset failed:', err);
    process.exit(1);
  });
