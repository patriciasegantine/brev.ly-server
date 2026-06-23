import { z } from 'zod';
import { type Either, makeLeft, makeRight } from '@/shared/either';
import { db } from '@/db';
import { schema } from '@/db/schemas';
import { and, eq, ne } from 'drizzle-orm';

export const updateLinkInput = z
  .object({
    id: z.string().min(1, { message: 'ID is required' }),
    originalUrl: z.string().url({ message: 'Invalid original URL' }).optional(),
    shortUrl: z
      .string()
      .min(3, { message: 'Shortened URL must be at least 3 characters' })
      .max(50, { message: 'Shortened URL must be at most 50 characters' })
      .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Malformed shortened URL' })
      .optional(),
  })
  .refine((data) => data.originalUrl !== undefined || data.shortUrl !== undefined, {
    message: 'At least one field (originalUrl or shortUrl) must be provided',
  });

export type UpdateLinkInput = z.input<typeof updateLinkInput>;

export type UpdateLinkOutput = {
  id: string;
  originalUrl: string;
  shortUrl: string;
  accessCount: number;
  createdAt: Date;
};

export type UpdateLinkError =
  | { code: 'LINK_NOT_FOUND'; message: string }
  | { code: 'SHORT_URL_ALREADY_EXISTS'; message: string };

export async function updateLink(
  input: UpdateLinkInput
): Promise<Either<UpdateLinkError, UpdateLinkOutput>> {
  const { id, originalUrl, shortUrl } = updateLinkInput.parse(input);

  const [existingLink] = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.id, id))
    .limit(1);

  if (!existingLink) {
    return makeLeft({ code: 'LINK_NOT_FOUND', message: 'Link not found' });
  }

  if (shortUrl && shortUrl !== existingLink.shortUrl) {
    const [conflicting] = await db
      .select()
      .from(schema.links)
      .where(and(eq(schema.links.shortUrl, shortUrl), ne(schema.links.id, id)))
      .limit(1);

    if (conflicting) {
      return makeLeft({ code: 'SHORT_URL_ALREADY_EXISTS', message: 'Shortened URL already exists' });
    }
  }

  const [updated] = await db
    .update(schema.links)
    .set({
      ...(originalUrl !== undefined && { originalUrl }),
      ...(shortUrl !== undefined && { shortUrl }),
    })
    .where(eq(schema.links.id, id))
    .returning();

  return makeRight(updated);
}
