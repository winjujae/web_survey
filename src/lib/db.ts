// src/lib/db.ts
import { Pool } from 'pg';

const globalForPg = globalThis as unknown as { pgPool?: Pool };

export const pool =
  globalForPg.pgPool ??
  new Pool({
    connectionString: process.env.POSTGRES_URL,
  });

if (process.env.NODE_ENV !== 'production') globalForPg.pgPool = pool;

export default pool;