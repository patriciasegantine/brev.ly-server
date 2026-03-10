import { afterAll, beforeEach } from 'vitest';
import { client } from '@/db';

beforeEach(async () => {
  await client.unsafe('TRUNCATE TABLE links RESTART IDENTITY CASCADE');
});

afterAll(async () => {
  await client.end({ timeout: 5 });
});
