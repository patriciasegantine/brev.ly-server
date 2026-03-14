import { z } from 'zod';
import { type Either, makeLeft, makeRight } from '@/shared/either';
import { db } from '@/db';
import { schema } from '@/db/schemas';
import { eq, sql } from 'drizzle-orm';

export const getLinkByShortUrlInput = z.object({
  shortUrl: z.string().min(1, { message: 'Short URL is required' }),
});

export type GetLinkByShortUrlInput = z.input<typeof getLinkByShortUrlInput>;

export type GetLinkByShortUrlOutput = {
  originalUrl: string;
};

export type GetLinkByShortUrlError = {
  code: 'LINK_NOT_FOUND';
  message: string;
};

export async function getLinkByShortUrl(
  input: GetLinkByShortUrlInput
): Promise<Either<GetLinkByShortUrlError, GetLinkByShortUrlOutput>> {
  const { shortUrl } = getLinkByShortUrlInput.parse(input);
  
  const [link] = await db
    .update(schema.links)
    .set({
      accessCount: sql`${schema.links.accessCount} + 1`,
    })
    .where(eq(schema.links.shortUrl, shortUrl))
    .returning({
      originalUrl: schema.links.originalUrl,
    });
  
  if (!link) {
    return makeLeft({
      code: 'LINK_NOT_FOUND',
      message: 'Link not found',
    });
  }
  
  return makeRight({
    originalUrl: link.originalUrl,
  });
}
