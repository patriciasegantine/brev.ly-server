import { describe, it, expect, beforeAll, beforeEach, afterAll } from 'vitest';
import { app } from '@/app';

describe('GET /links/:shortUrl (E2E)', () => {
  const testShortUrl = `rocketseat-test-${Date.now()}`;
  
  beforeAll(async () => {
    await app.ready();
  });

  beforeEach(async () => {
    const createResponse = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://www.rocketseat.com.br',
        shortUrl: testShortUrl,
      },
    });

    expect(createResponse.statusCode).toBe(201);
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  it('should return original URL when shortUrl exists', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/links/${testShortUrl}`,
    });
    
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toEqual({
      originalUrl: 'https://www.rocketseat.com.br',
    });
  });
  
  it('should return 404 when shortUrl does not exist', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/links/non-existent-url',
    });
    
    expect(response.statusCode).toBe(404);
    const body = response.json();
    expect(body).toHaveProperty('message');
    expect(body.message).toBe('Link not found');
  });
  
  it('should handle special characters in shortUrl', async () => {
    const specialShortUrl = `special-test_${Date.now()}`;
    
    // Create link with hyphens and underscores
    await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://example.com',
        shortUrl: specialShortUrl,
      },
    });
    
    const response = await app.inject({
      method: 'GET',
      url: `/links/${specialShortUrl}`,
    });
    
    expect(response.statusCode).toBe(200);
  });
});
