import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { getLinks } from './get-links';
import { createLink } from '../create-link/create-link';
import { isRight } from '@/shared/either';
import { db } from '@/db';
import { schema } from '@/db/schemas';

async function createSeedLink(params: {
  originalUrl: string;
  shortUrl: string;
  accessCount?: number;
  createdAt?: Date;
}) {
  const result = await createLink({
    originalUrl: params.originalUrl,
    shortUrl: params.shortUrl,
  });

  expect(isRight(result)).toBe(true);

  if (!isRight(result)) {
    throw new Error('Expected seed link creation to succeed');
  }

  if (params.accessCount !== undefined || params.createdAt !== undefined) {
    await db
      .update(schema.links)
      .set({
        ...(params.accessCount !== undefined
          ? { accessCount: params.accessCount }
          : {}),
        ...(params.createdAt ? { createdAt: params.createdAt } : {}),
      })
      .where(eq(schema.links.id, result.value.id));
  }

  return result.value;
}

describe('getLinks use case', () => {
  it('filters links by shortUrl and returns the filtered total', async () => {
    const prefix = `filter-${Date.now()}`;

    await createSeedLink({
      originalUrl: 'https://example.com/1',
      shortUrl: `${prefix}-match-alpha`,
    });
    await createSeedLink({
      originalUrl: 'https://example.com/2',
      shortUrl: `${prefix}-match-beta`,
    });
    await createSeedLink({
      originalUrl: 'https://example.com/3',
      shortUrl: `${prefix}-other-gamma`,
    });

    const result = await getLinks({
      searchQuery: `${prefix}-match`,
      page: 1,
      pageSize: 10,
    });

    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value.total).toBe(2);
      expect(result.value.links).toHaveLength(2);
      expect(result.value.links.map((link) => link.shortUrl).sort()).toEqual([
        `${prefix}-match-alpha`,
        `${prefix}-match-beta`,
      ]);
    }
  });

  it('paginates filtered results without overlap', async () => {
    const prefix = `page-${Date.now()}`;

    const oldest = await createSeedLink({
      originalUrl: 'https://example.com/oldest',
      shortUrl: `${prefix}-oldest`,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
    });
    const middle = await createSeedLink({
      originalUrl: 'https://example.com/middle',
      shortUrl: `${prefix}-middle`,
      createdAt: new Date('2024-01-02T00:00:00.000Z'),
    });
    const newest = await createSeedLink({
      originalUrl: 'https://example.com/newest',
      shortUrl: `${prefix}-newest`,
      createdAt: new Date('2024-01-03T00:00:00.000Z'),
    });

    const firstPage = await getLinks({
      searchQuery: prefix,
      page: 1,
      pageSize: 2,
    });
    const secondPage = await getLinks({
      searchQuery: prefix,
      page: 2,
      pageSize: 2,
    });

    expect(isRight(firstPage)).toBe(true);
    expect(isRight(secondPage)).toBe(true);

    if (isRight(firstPage) && isRight(secondPage)) {
      expect(firstPage.value.total).toBe(3);
      expect(secondPage.value.total).toBe(3);
      expect(firstPage.value.links.map((link) => link.id)).toEqual([
        newest.id,
        middle.id,
      ]);
      expect(secondPage.value.links.map((link) => link.id)).toEqual([oldest.id]);
    }
  });

  it('sorts links by accessCount descending', async () => {
    const prefix = `access-count-${Date.now()}`;

    const low = await createSeedLink({
      originalUrl: 'https://example.com/low',
      shortUrl: `${prefix}-low`,
      accessCount: 1,
    });
    const mid = await createSeedLink({
      originalUrl: 'https://example.com/mid',
      shortUrl: `${prefix}-mid`,
      accessCount: 5,
    });
    const high = await createSeedLink({
      originalUrl: 'https://example.com/high',
      shortUrl: `${prefix}-high`,
      accessCount: 9,
    });

    const result = await getLinks({
      searchQuery: prefix,
      sortBy: 'accessCount',
      sortDirection: 'desc',
    });

    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value.links.map((link) => link.id)).toEqual([
        high.id,
        mid.id,
        low.id,
      ]);
    }
  });

  it('defaults sortDirection to desc when sortBy is provided', async () => {
    const prefix = `default-sort-${Date.now()}`;

    const lowerCount = await createSeedLink({
      originalUrl: 'https://example.com/lower',
      shortUrl: `${prefix}-lower`,
      accessCount: 2,
    });
    const higherCount = await createSeedLink({
      originalUrl: 'https://example.com/higher',
      shortUrl: `${prefix}-higher`,
      accessCount: 8,
    });

    const result = await getLinks({
      searchQuery: prefix,
      sortBy: 'accessCount',
    });

    expect(isRight(result)).toBe(true);
    if (isRight(result)) {
      expect(result.value.links.map((link) => link.id)).toEqual([
        higherCount.id,
        lowerCount.id,
      ]);
    }
  });

  it('rejects page numbers lower than 1', async () => {
    await expect(getLinks({ page: 0 })).rejects.toThrow();
  });

  it('rejects page sizes lower than 1', async () => {
    await expect(getLinks({ pageSize: 0 })).rejects.toThrow();
  });
});
