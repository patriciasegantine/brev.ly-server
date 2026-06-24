import { describe, it, expect, beforeEach } from 'vitest';
import { updateLink } from './update-link';
import { createLink } from '@/use-cases/create-link/create-link';
import { isLeft, isRight } from '@/shared/either';

async function seedLink(suffix: string) {
  const result = await createLink({
    originalUrl: 'https://www.example.com',
    shortUrl: `update-seed-${suffix}`,
  });
  if (!isRight(result)) throw new Error('Failed to seed link');
  return result.value;
}

describe('updateLink use case', () => {
  it('should update originalUrl successfully', async () => {
    const link = await seedLink(`orig-${Date.now()}`);

    const result = await updateLink({
      id: link.id,
      originalUrl: 'https://www.updated.com',
    });

    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value.originalUrl).toBe('https://www.updated.com');
      expect(result.value.shortUrl).toBe(link.shortUrl);
    }
  });

  it('should update shortUrl successfully', async () => {
    const link = await seedLink(`short-${Date.now()}`);
    const newShortUrl = `new-slug-${Date.now()}`;

    const result = await updateLink({ id: link.id, shortUrl: newShortUrl });

    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value.shortUrl).toBe(newShortUrl);
      expect(result.value.originalUrl).toBe(link.originalUrl);
    }
  });

  it('should update both fields at once', async () => {
    const link = await seedLink(`both-${Date.now()}`);
    const newShortUrl = `both-new-${Date.now()}`;

    const result = await updateLink({
      id: link.id,
      originalUrl: 'https://www.both.com',
      shortUrl: newShortUrl,
    });

    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value.originalUrl).toBe('https://www.both.com');
      expect(result.value.shortUrl).toBe(newShortUrl);
    }
  });

  it('should return LINK_NOT_FOUND for unknown id', async () => {
    const result = await updateLink({
      id: 'non-existent-id',
      originalUrl: 'https://www.example.com',
    });

    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) {
      expect(result.value.code).toBe('LINK_NOT_FOUND');
    }
  });

  it('should return SHORT_URL_ALREADY_EXISTS when slug is taken by another link', async () => {
    const ts = Date.now();
    const linkA = await seedLink(`conflict-a-${ts}`);
    const linkB = await seedLink(`conflict-b-${ts}`);

    const result = await updateLink({
      id: linkB.id,
      shortUrl: linkA.shortUrl,
    });

    expect(isLeft(result)).toBe(true);
    if (isLeft(result)) {
      expect(result.value.code).toBe('SHORT_URL_ALREADY_EXISTS');
    }
  });

  it('should allow keeping the same shortUrl on the same link', async () => {
    const link = await seedLink(`same-${Date.now()}`);

    const result = await updateLink({
      id: link.id,
      shortUrl: link.shortUrl,
      originalUrl: 'https://www.changed.com',
    });

    expect(isRight(result)).toBe(true);
  });

  it('should throw validation error when no fields are provided', async () => {
    await expect(updateLink({ id: 'any-id' } as any)).rejects.toThrow();
  });

  it('should throw validation error for invalid originalUrl', async () => {
    await expect(
      updateLink({ id: 'any-id', originalUrl: 'not-a-url' })
    ).rejects.toThrow();
  });

  it('should throw validation error for malformed shortUrl', async () => {
    await expect(
      updateLink({ id: 'any-id', shortUrl: 'invalid@slug' })
    ).rejects.toThrow();
  });
});
