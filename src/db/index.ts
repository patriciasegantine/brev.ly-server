import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { env } from '@/env';
import * as schema from './schemas';

// Cliente de conexão
export const client = postgres(env.DATABASE_URL);

// Instância do Drizzle ORM
export const db = drizzle(client, { schema });
