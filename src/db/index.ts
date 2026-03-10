import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/env';
import { schema } from './schemas';

function ensureSafeTestDatabase(databaseUrl: string) {
  if (env.NODE_ENV !== 'test') return;

  const dbName = new URL(databaseUrl).pathname.replace(/^\//, '');
  if (!dbName.endsWith('_test')) {
    throw new Error(`Unsafe test DATABASE_URL: expected database name ending with "_test", received "${dbName}".`);
  }
}

ensureSafeTestDatabase(env.DATABASE_URL);

export const client = postgres(env.DATABASE_URL);

export const db = drizzle(client, { schema });
