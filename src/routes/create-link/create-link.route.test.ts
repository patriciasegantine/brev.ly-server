import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { app } from '@/app';

describe('POST /links route', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 201 when payload is valid', async () => {
    const shortUrl = `route-ok-${Date.now()}`;

    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://example.com',
        shortUrl,
      },
    });

    expect(response.statusCode).toBe(201);

    const body = response.json();
    expect(body).toHaveProperty('id');
    expect(body.originalUrl).toBe('https://example.com');
    expect(body.shortUrl).toBe(shortUrl);
    expect(body.accessCount).toBe(0);
    expect(body).toHaveProperty('createdAt');
  });

  it('returns 409 when shortUrl already exists', async () => {
    const shortUrl = `route-dup-${Date.now()}`;

    await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://example.com/first',
        shortUrl,
      },
    });

    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://example.com/second',
        shortUrl,
      },
    });

    expect(response.statusCode).toBe(409);
    const body = response.json();
    expect(body).toHaveProperty('message');
  });

  it('returns 400 for invalid originalUrl', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'not-a-url',
        shortUrl: `route-invalid-url-${Date.now()}`,
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for malformed shortUrl (regex)', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://example.com',
        shortUrl: 'invalid@url',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for shortUrl shorter than 3 chars', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://example.com',
        shortUrl: 'ab',
      },
    });

    expect(response.statusCode).toBe(400);
  });

  it('returns 400 for shortUrl longer than 50 chars', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://example.com',
        shortUrl: 'a'.repeat(51),
      },
    });

    expect(response.statusCode).toBe(400);
  });
});
