import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';
import { createLink } from '@/use-cases/create-link/create-link';
import { isRight } from '@/shared/either';

async function seedLink(suffix: string) {
  const result = await createLink({
    originalUrl: 'https://www.example.com',
    shortUrl: `route-upd-${suffix}`,
  });
  if (!isRight(result)) throw new Error('Failed to seed link');
  return result.value;
}

describe('PATCH /links/:id route', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 200 when updating originalUrl', async () => {
    const link = await seedLink(`orig-${Date.now()}`);

    const response = await app.inject({
      method: 'PATCH',
      url: `/links/${link.id}`,
      payload: { originalUrl: 'https://www.updated.com' },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.originalUrl).toBe('https://www.updated.com');
    expect(body.shortUrl).toBe(link.shortUrl);
  });

  it('returns 200 when updating shortUrl', async () => {
    const link = await seedLink(`short-${Date.now()}`);
    const newShortUrl = `new-route-slug-${Date.now()}`;

    const response = await app.inject({
      method: 'PATCH',
      url: `/links/${link.id}`,
      payload: { shortUrl: newShortUrl },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.shortUrl).toBe(newShortUrl);
  });

  it('returns 200 when updating both fields', async () => {
    const link = await seedLink(`both-${Date.now()}`);
    const newShortUrl = `both-route-${Date.now()}`;

    const response = await app.inject({
      method: 'PATCH',
      url: `/links/${link.id}`,
      payload: { originalUrl: 'https://www.both.com', shortUrl: newShortUrl },
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.originalUrl).toBe('https://www.both.com');
    expect(body.shortUrl).toBe(newShortUrl);
    expect(body).toHaveProperty('id');
    expect(body).toHaveProperty('accessCount');
    expect(body).toHaveProperty('createdAt');
  });

  it('returns 404 for unknown id', async () => {
    const response = await app.inject({
      method: 'PATCH',
      url: '/links/non-existent-id',
      payload: { originalUrl: 'https://www.example.com' },
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toHaveProperty('message');
  });

  it('returns 409 when shortUrl is taken by another link', async () => {
    const ts = Date.now();
    const linkA = await seedLink(`cfa-${ts}`);
    const linkB = await seedLink(`cfb-${ts}`);

    const response = await app.inject({
      method: 'PATCH',
      url: `/links/${linkB.id}`,
      payload: { shortUrl: linkA.shortUrl },
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toHaveProperty('message');
  });

  it('returns 400 when no fields are provided', async () => {
    const link = await seedLink(`empty-${Date.now()}`);

    const response = await app.inject({
      method: 'PATCH',
      url: `/links/${link.id}`,
      payload: {},
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for invalid originalUrl', async () => {
    const link = await seedLink(`inv-url-${Date.now()}`);

    const response = await app.inject({
      method: 'PATCH',
      url: `/links/${link.id}`,
      payload: { originalUrl: 'not-a-url' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for malformed shortUrl', async () => {
    const link = await seedLink(`inv-slug-${Date.now()}`);

    const response = await app.inject({
      method: 'PATCH',
      url: `/links/${link.id}`,
      payload: { shortUrl: 'invalid@slug' },
    });

    expect(response.statusCode).toBe(400);
  });
});
