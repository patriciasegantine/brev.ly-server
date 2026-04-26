import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';

describe('POST /links/export route', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 503 when storage is not configured', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links/export',
    });

    expect(response.statusCode).toBe(503);
    expect(response.json()).toHaveProperty('message');
  });
});
