import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import path from 'path';

// Ensure environment variables are loaded even if lib/db is imported outside Next.js
if (!process.env.DATABASE_URL && !process.env.PGHOST) {
  try {
    const dotenv = require('dotenv');
    dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
    dotenv.config();
  } catch {
    // dotenv optional at runtime if environment is already populated
  }
}

// Global singleton pattern to prevent multiple pool instances across Next.js route chunks or hot reloads
const globalForDb = globalThis as unknown as {
  ewhPool: Pool | undefined;
};

export function getPool(): Pool {
  if (!globalForDb.ewhPool) {
    const connectionString =
      process.env.DATABASE_URL ||
      `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || 'postgrespassword'}@${process.env.PGHOST || '127.0.0.1'}:${process.env.PGPORT || '5432'}/${process.env.PGDATABASE || 'enterprise_warranty'}`;

    globalForDb.ewhPool = new Pool({
      connectionString,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    });

    globalForDb.ewhPool.on('error', (err) => {
      console.error('[EWH Database Pool Error]:', err.message);
    });
  }
  return globalForDb.ewhPool;
}

/**
 * Standard parameterized query helper using the shared connection pool.
 */
export async function query<T extends QueryResultRow = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const p = getPool();
  try {
    return await p.query<T>(text, params);
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      const targetHost = process.env.PGHOST || '127.0.0.1';
      const targetPort = process.env.PGPORT || '5432';
      console.error(
        `[EWH Database Connection Error]: Unable to connect to PostgreSQL at ${targetHost}:${targetPort} (${err.code}).`
      );
      throw new Error(
        'Database connection failed. Ensure PostgreSQL container is running via `docker compose up -d db`.'
      );
    }
    throw err;
  }
}

/**
 * Transaction helper ensuring BEGIN, COMMIT, and ROLLBACK using a single dedicated client.
 */
export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>
): Promise<T> {
  const p = getPool();
  let client: PoolClient;
  try {
    client = await p.connect();
  } catch (err: any) {
    if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
      const targetHost = process.env.PGHOST || '127.0.0.1';
      const targetPort = process.env.PGPORT || '5432';
      console.error(
        `[EWH Database Connection Error]: Unable to acquire client from ${targetHost}:${targetPort} (${err.code}).`
      );
      throw new Error(
        'Database connection failed. Ensure PostgreSQL container is running via `docker compose up -d db`.'
      );
    }
    throw err;
  }

  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackErr) {
      console.error('[EWH Transaction Rollback Error]:', rollbackErr);
    }
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Healthcheck helper to verify PostgreSQL and pgvector availability.
 */
export async function checkDatabaseHealth(): Promise<{
  connected: boolean;
  pgvectorInstalled: boolean;
  version?: string;
  error?: string;
}> {
  try {
    const res = await query('SELECT version();');
    const vecRes = await query(
      "SELECT extversion FROM pg_extension WHERE extname = 'vector';"
    );
    return {
      connected: true,
      pgvectorInstalled: vecRes.rows.length > 0,
      version: res.rows[0]?.version,
    };
  } catch (err: any) {
    return {
      connected: false,
      pgvectorInstalled: false,
      error: err.message,
    };
  }
}
