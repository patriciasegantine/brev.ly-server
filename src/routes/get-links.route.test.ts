import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';

describe('GET /links route', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 with the default paginated payload', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/links',
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();

    expect(body).toEqual(
      expect.objectContaining({
        links: expect.any(Array),
        total: expect.any(Number),
        page: 1,
        pageSize: 20,
      })
    );
  });
});
