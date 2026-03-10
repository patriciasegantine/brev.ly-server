import { describe, it, expect } from 'vitest';
import { createLink } from './create-link';
import { isLeft, isRight } from '@/shared/either';

describe('createLink use case', () => {
  it('should create a link successfully', async () => {
    const result = await createLink({
      originalUrl: 'https://www.example.com',
      shortUrl: `test-${Date.now()}`,
    });
    
    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value).toHaveProperty('id');
      expect(result.value.originalUrl).toBe('https://www.example.com');
      expect(result.value.accessCount).toBe(0);
    }
  });
  
  it('should return error when shortUrl already exists', async () => {
    const shortUrl = `duplicate-${Date.now()}`;
    
    await createLink({
      originalUrl: 'https://www.example.com/url1',
      shortUrl,
    });
    
    const result = await createLink({
      originalUrl: 'https://www.example.com/url2',
      shortUrl,
    });
    
    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) {
      expect(result.value.code).toBe('SHORT_URL_ALREADY_EXISTS');
    }
  });
  
  it('should throw validation error for invalid URL', async () => {
    await expect(
      createLink({
        originalUrl: 'not-a-url',
        shortUrl: 'test',
      })
    ).rejects.toThrow();
  });
  
  it('should throw validation error for invalid shortUrl format', async () => {
    await expect(
      createLink({
        originalUrl: 'https://www.example.com',
        shortUrl: 'invalid@url',
      })
    ).rejects.toThrow();
  });
  
  it('should throw validation error for shortUrl too short', async () => {
    await expect(
      createLink({
        originalUrl: 'https://www.example.com',
        shortUrl: 'ab',
      })
    ).rejects.toThrow();
  });
});
