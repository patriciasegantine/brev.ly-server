import { describe, it, expect, beforeEach } from 'vitest';
import { getLinkByShortUrl } from './get-link-by-short-url';
import { createLink } from '../create-link/create-link';
import { isLeft, isRight } from '@/shared/either';

describe('getLinkByShortUrl use case', () => {
  const testShortUrl = `test-get-${Date.now()}`;
  const testOriginalUrl = 'https://www.example.com/very-long-url';
  
  beforeEach(async () => {
    await createLink({
      originalUrl: testOriginalUrl,
      shortUrl: testShortUrl,
    });
  });
  
  it('should return original URL when shortUrl exists', async () => {
    const result = await getLinkByShortUrl({ shortUrl: testShortUrl });
    
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value.originalUrl).toBe(testOriginalUrl);
    }
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
  
  it('should return only originalUrl without other fields', async () => {
    const result = await getLinkByShortUrl({ shortUrl: testShortUrl });
    
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value).toHaveProperty('originalUrl');
      expect(result.value).not.toHaveProperty('id');
      expect(result.value).not.toHaveProperty('accessCount');
      expect(result.value).not.toHaveProperty('createdAt');
    }
  });
});
