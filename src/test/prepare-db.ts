import postgres from 'postgres';
import { env } from '@/env';

function getDatabaseName(databaseUrl: string) {
  const dbName = new URL(databaseUrl).pathname.replace(/^\//, '');

  if (!dbName.endsWith('_test')) {
    throw new Error(`Refusing to create non-test database: "${dbName}".`);
  }

  if (!/^[a-zA-Z0-9_]+$/.test(dbName)) {
    throw new Error(`Invalid database name: "${dbName}".`);
  }

  return dbName;
}

async function ensureTestDatabase() {
  const dbName = getDatabaseName(env.DATABASE_URL);
  const adminUrl = new URL(env.DATABASE_URL);
  adminUrl.pathname = '/postgres';

  const sql = postgres(adminUrl.toString());

  try {
    const result = await sql<{ exists: boolean }[]>`
      SELECT EXISTS (
        SELECT 1 FROM pg_database WHERE datname = ${dbName}
      ) AS exists
    `;

    if (!result[0]?.exists) {
      await sql.unsafe(`CREATE DATABASE "${dbName}"`);
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

await ensureTestDatabase();
