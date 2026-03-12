import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { createLink } from '@/use-cases/create-link/create-link';

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

  it('filters links from the querystring searchQuery', async () => {
    const prefix = `route-search-${Date.now()}`;

    await createLink({
      originalUrl: 'https://example.com/match',
      shortUrl: `${prefix}-match`,
    });
    await createLink({
      originalUrl: 'https://example.com/other',
      shortUrl: `${prefix}-other`,
    });

    const response = await app.inject({
      method: 'GET',
      url: `/links?searchQuery=${prefix}-match`,
    });

    expect(response.statusCode).toBe(200);

    const body = response.json();
    expect(body.total).toBe(1);
    expect(body.links).toHaveLength(1);
    expect(body.links[0].shortUrl).toBe(`${prefix}-match`);
  });

  it('returns 400 when page is lower than 1', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/links?page=0',
    });

    expect(response.statusCode).toBe(400);
  });
});
