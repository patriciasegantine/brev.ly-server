import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app } from '@/app';

describe('GET /links/:shortUrl (E2E)', () => {
  beforeAll(async () => {
    await app.ready();
  });
  
  afterAll(async () => {
    await app.close();
  });
  
  it('should return original URL (access count is incremented in background)', async () => {
    const testShortUrl = `rocketseat-test-${Date.now()}`;
    
    await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://www.rocketseat.com.br',
        shortUrl: testShortUrl,
      },
    });
    
    const response = await app.inject({
      method: 'GET',
      url: `/links/${testShortUrl}`,
    });
    
    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body).toEqual({
      originalUrl: 'https://www.rocketseat.com.br',
    });
    expect(body).not.toHaveProperty('accessCount'); // Não retorna mais
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
  
  it('should increment access count in database on each access', async () => {
    const shortUrl = `increment-check-${Date.now()}`;
    
    const createResponse = await app.inject({
      method: 'POST',
      url: '/links',
      payload: {
        originalUrl: 'https://example.com',
        shortUrl,
      },
    });
    
    const linkId = createResponse.json().id;
    
    for (let i = 0; i < 3; i++) {
      await app.inject({
        method: 'GET',
        url: `/links/${shortUrl}`,
      });
    }
    
    const listResponse = await app.inject({
      method: 'GET',
      url: '/links',
    });
    
    const links = listResponse.json().links;
    const ourLink = links.find((l: any) => l.id === linkId);
    
    expect(ourLink.accessCount).toBe(3);
  });
});
