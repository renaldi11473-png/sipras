import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL;

/**
 * Koneksi dibuat "lazy" dan tidak melempar error saat modul di-import.
 * Ini penting untuk platform serverless (Vercel) yang menjalankan proses build
 * sebelum environment variable database tersedia. Query pertama akan gagal
 * dengan pesan yang jelas jika DATABASE_URL belum diisi.
 */
const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

function createPool() {
  return new Pool({
    connectionString: databaseUrl,
    max: 5,
    ssl:
      databaseUrl && /sslmode=(require|verify-ca|verify-full)/.test(databaseUrl)
        ? { rejectUnauthorized: false }
        : undefined,
  });
}

export const pool: Pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  (databaseUrl ? createPool() : new Pool({ max: 1 }));

globalForDb.__arenaNextJsPostgresqlPool = globalForDb.__arenaNextJsPostgresqlPool ?? pool;

export function hasDatabaseUrl() {
  return Boolean(databaseUrl);
}

export const db = drizzle(pool);
