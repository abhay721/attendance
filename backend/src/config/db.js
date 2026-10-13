const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

let pool = null;
let pgliteInstance = null;
let dbMode = null;

async function getDb() {
  if (dbMode) {
    return { mode: dbMode, pool, pglite: pgliteInstance };
  }

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
      const client = await testPool.connect();
      client.release();
      pool = testPool;
      dbMode = 'pg';
      return { mode: 'pg', pool };
    } catch (err) {
      console.warn('External PostgreSQL connection failed:', err.message);
    }
  }

  const { PGlite } = require('@electric-sql/pglite');
  const dataDir = process.env.PGLITE_DATA_DIR;
  if (!dataDir) {
    const defaultDir = path.join(__dirname, '../../.pglite_data');
    if (!fs.existsSync(defaultDir)) {
      fs.mkdirSync(defaultDir, { recursive: true });
    }
    pgliteInstance = new PGlite(defaultDir);
  } else if (dataDir === 'memory://') {
    pgliteInstance = new PGlite();
  } else {
    pgliteInstance = new PGlite(dataDir);
  }
  dbMode = 'pglite';
  return { mode: 'pglite', pglite: pgliteInstance };
}

async function query(text, params = []) {
  const { mode, pool: pgPool, pglite } = await getDb();

  if (mode === 'pg') {
    return await pgPool.query(text, params);
  } else {
    return await pglite.query(text, params);
  }
}

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
