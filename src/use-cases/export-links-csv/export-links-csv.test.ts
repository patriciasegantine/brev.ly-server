import { describe, expect, it, vi } from 'vitest';
import { eq } from 'drizzle-orm';
import { exportLinksCsv } from './export-links-csv';
import { isLeft, isRight } from '@/shared/either';
import { createLink } from '@/use-cases/create-link/create-link';
import { db } from '@/db';
import { schema } from '@/db/schemas';

async function streamToString(stream: NodeJS.ReadableStream) {
  const chunks: string[] = [];

  for await (const chunk of stream) {
    chunks.push(String(chunk));
  }

  return chunks.join('');
}

describe('exportLinksCsv use case', () => {
  it('returns storage configuration error when storage is not configured', async () => {
    const uploadSpy = vi.fn();

    const result = await exportLinksCsv({
      isStorageConfigured: () => false,
      uploadCsv: uploadSpy,
    });

    expect(isLeft(result)).toBe(true);
    expect(uploadSpy).not.toHaveBeenCalled();

    if (isLeft(result)) {
      expect(result.value.code).toBe('STORAGE_NOT_CONFIGURED');
    }
  });

  it('exports links as CSV and returns a public file URL', async () => {
    const firstLink = await createLink({
      originalUrl: 'https://example.com/first',
      shortUrl: `export-first-${Date.now()}`,
    });
    const secondLink = await createLink({
      originalUrl: 'https://example.com/second',
      shortUrl: `export-second-${Date.now()}`,
    });

    if (!isRight(firstLink) || !isRight(secondLink)) {
      throw new Error('Expected link creation to succeed');
    }

    await db
      .update(schema.links)
      .set({ accessCount: 3 })
      .where(eq(schema.links.id, secondLink.value.id));

    let capturedCsv = '';

    const result = await exportLinksCsv({
      isStorageConfigured: () => true,
      uploadCsv: async ({ fileKey, body }) => {
        capturedCsv = await streamToString(body);

        return {
          fileUrl: `https://cdn.example.com/${fileKey}`,
        };
      },
    });

    expect(isRight(result)).toBe(true);

    if (isRight(result)) {
      expect(result.value.fileKey).toMatch(/^exports\/links-.*\.csv$/);
      expect(result.value.fileUrl).toContain(result.value.fileKey);
    }

    expect(capturedCsv).toContain(
      'original_url,short_url,access_count,created_at'
    );
    expect(capturedCsv).toContain(firstLink.value.shortUrl);
    expect(capturedCsv).toContain(secondLink.value.shortUrl);
    expect(capturedCsv).toContain(',3,');
  });
});
