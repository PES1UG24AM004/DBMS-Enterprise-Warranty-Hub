import path from 'path';
import dotenv from 'dotenv';
import { checkDatabaseHealth, getPool } from '../lib/db';
import { runMigration } from './migrate';
import { seedDatabase } from './seed';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

async function setup() {
  console.log('========================================================');
  console.log('   Enterprise Warranty Hub (EWH) - Initial Setup Script   ');
  console.log('========================================================\n');

  console.log('1. Checking Database Connectivity...');
  let health = await checkDatabaseHealth();
  let retries = 5;

  while (!health.connected && retries > 0) {
    console.log(`Waiting for database to accept connections... (${retries} attempts left)`);
    await new Promise((r) => setTimeout(r, 2000));
    health = await checkDatabaseHealth();
    retries--;
  }

  if (!health.connected) {
    console.error('✘ Unable to connect to PostgreSQL.');
    console.error('  Error:', health.error);
    console.error('  Resolution: Ensure Docker is running, then run `npm run db:up`.');
    process.exit(1);
  }
  console.log('✔ PostgreSQL connection established.');

  console.log('\n2. Executing Schema Migrations...');
  await runMigration();

  console.log('\n3. Seeding Realistic Demo Data & Vector Embeddings...');
  await seedDatabase();

  console.log('\n========================================================');
  console.log('✔ Setup Completed Successfully!');
  console.log('You can now run `npm run dev` to launch the web dashboard.');
  console.log('========================================================');
}

setup()
  .then(() => {
    getPool().end();
  })
  .catch((err) => {
    console.error('✘ Setup failed:', err);
    process.exit(1);
  });
