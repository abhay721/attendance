const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

let pool = null;
let pgliteInstance = null;
let dbMode = null; // 'pg' or 'pglite'

async function getDb() {
  if (dbMode) {
    return { mode: dbMode, pool, pglite: pgliteInstance };
  }

  // Check if external PostgreSQL connection is configured
  const hasPgConfig = process.env.DATABASE_URL || (process.env.PGHOST && process.env.PGDATABASE);

  if (hasPgConfig) {
    try {
      const { Pool } = require('pg');
      const config = process.env.DATABASE_URL
        ? { connectionString: process.env.DATABASE_URL }
        : {
            host: process.env.PGHOST || 'localhost',
            port: parseInt(process.env.PGPORT || '5432', 10),
            user: process.env.PGUSER || 'postgres',
            password: process.env.PGPASSWORD || '',
            database: process.env.PGDATABASE || 'attendance_db',
          };

      const testPool = new Pool(config);
      // Verify connection
      const client = await testPool.connect();
      client.release();
      pool = testPool;
      dbMode = 'pg';
      console.log(' Connected to external PostgreSQL database via pg pool.');
      return { mode: 'pg', pool };
    } catch (err) {
      console.warn(' External PostgreSQL connection failed:', err.message);
      console.warn(' Falling back to embedded PostgreSQL (PGlite)...');
    }
  }

  // Fallback / Default: Embedded PGlite (Real Postgres WASM with persistent disk storage)
  const { PGlite } = require('@electric-sql/pglite');
  const dataDir = process.env.PGLITE_DATA_DIR || path.join(__dirname, '../../.pglite_data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  pgliteInstance = new PGlite(dataDir);
  dbMode = 'pglite';
  console.log(` Initialized embedded PostgreSQL (PGlite) engine at ${dataDir}`);
  return { mode: 'pglite', pglite: pgliteInstance };
}

/**
 * Execute a parameterized SQL query
 */
async function query(text, params = []) {
  const { mode, pool: pgPool, pglite } = await getDb();

  if (mode === 'pg') {
    const res = await pgPool.query(text, params);
    return res;
  } else {
    const res = await pglite.query(text, params);
    return res;
  }
}

/**
 * Execute a transaction safely with BEGIN / COMMIT / ROLLBACK
 */
async function transaction(callback) {
  const { mode, pool: pgPool, pglite } = await getDb();

  if (mode === 'pg') {
    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } else {
    // PGlite supports transactions via .transaction() or manual queries
    if (typeof pglite.transaction === 'function') {
      return await pglite.transaction(async (tx) => {
        return await callback(tx);
      });
    } else {
      try {
        await pglite.query('BEGIN');
        const result = await callback(pglite);
        await pglite.query('COMMIT');
        return result;
      } catch (error) {
        await pglite.query('ROLLBACK');
        throw error;
      }
    }
  }
}

/**
 * Execute a multi-statement SQL script (for schemas and migrations)
 */
async function exec(text) {
  const { mode, pool: pgPool, pglite } = await getDb();

  if (mode === 'pg') {
    return await pgPool.query(text);
  } else {
    if (typeof pglite.exec === 'function') {
      return await pglite.exec(text);
    }
    return await pglite.query(text);
  }
}

module.exports = {
  getDb,
  query,
  exec,
  transaction,
};
