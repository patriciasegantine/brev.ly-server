import { describe, it, expect, beforeAll } from 'vitest';
import { getLinkByShortUrl } from './get-link-by-short-url';
import { createLink } from '../create-link/create-link';
import { isLeft, isRight } from '@/shared/either';
import { db } from '@/db';
import { schema } from '@/db/schemas';
import { eq } from 'drizzle-orm';

describe('getLinkByShortUrl use case', () => {
  const testOriginalUrl = 'https://www.example.com/very-long-url';
  
  it('should return original URL and increment access count when shortUrl exists', async () => {
    const testShortUrl = `test-get-${Date.now()}`;
    
    await createLink({
      originalUrl: testOriginalUrl,
      shortUrl: testShortUrl,
    });
    
    // First access
    const result = await getLinkByShortUrl({ shortUrl: testShortUrl });
    
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value.originalUrl).toBe(testOriginalUrl);
      expect(result.value).not.toHaveProperty('accessCount'); // Não retorna mais
    }
    
    const [linkInDb] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, testShortUrl))
      .limit(1);
    
    expect(linkInDb.accessCount).toBe(1);
    
    await getLinkByShortUrl({ shortUrl: testShortUrl });
    
    const [linkAfterSecondAccess] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, testShortUrl))
      .limit(1);
    
    expect(linkAfterSecondAccess.accessCount).toBe(2);
  });
  
  it('should return error when shortUrl does not exist', async () => {
    const result = await getLinkByShortUrl({ shortUrl: 'non-existent-url' });
    
    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) {
      expect(result.value.code).toBe('LINK_NOT_FOUND');
      expect(result.value.message).toBe('Link not found');
    }
  });
  
  it('should throw validation error for empty shortUrl', async () => {
    await expect(getLinkByShortUrl({ shortUrl: '' })).rejects.toThrow();
  });
  
  it('should be case-sensitive for shortUrl', async () => {
    const lowerShortUrl = `case-test-${Date.now()}`;
    await createLink({
      originalUrl: 'https://example.com/lower',
      shortUrl: lowerShortUrl,
    });
    
    const upperResult = await getLinkByShortUrl({
      shortUrl: lowerShortUrl.toUpperCase(),
    });
    
    expect(isLeft(upperResult)).toBe(true);
    
    const correctResult = await getLinkByShortUrl({
      shortUrl: lowerShortUrl,
    });
    
    expect(isRight(correctResult)).toBe(true);
  });
  
  it('should increment access count each time the link is accessed', async () => {
    const shortUrl = `increment-test-${Date.now()}`;
    await createLink({
      originalUrl: 'https://example.com/test',
      shortUrl,
    });
    
    for (let i = 0; i < 3; i++) {
      await getLinkByShortUrl({ shortUrl });
    }
    
    const [link] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, shortUrl))
      .limit(1);
    
    expect(link.accessCount).toBe(3);
  });
});
