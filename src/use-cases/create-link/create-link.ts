import { z } from 'zod';
  import { type Either, makeLeft, makeRight } from '@/shared/either';
  import { db } from '@/db';
  import { schema } from '@/db/schemas';
  import { eq } from 'drizzle-orm';
  
  export const createLinkInput = z.object({
    originalUrl: z.string().url({ message: 'Invalid original URL' }),
    shortUrl: z
      .string()
      .min(3, { message: 'Shortened URL must be at least 3 characters' })
      .max(50, { message: 'Shortened URL must be at most 50 characters' })
      .regex(/^[a-zA-Z0-9_-]+$/, {
        message: 'Malformed shortened URL',
      }),
  });
  
  export type CreateLinkInput = z.input<typeof createLinkInput>;
  
  export type CreateLinkOutput = {
    id: string;
    originalUrl: string;
    shortUrl: string;
    accessCount: number;
    createdAt: Date;
  };
  
  export type CreateLinkError = {
    code: 'SHORT_URL_ALREADY_EXISTS';
    message: string;
  };
  
  export async function createLink(
    input: CreateLinkInput
  ): Promise<Either<CreateLinkError, CreateLinkOutput>> {
    const { originalUrl, shortUrl } = createLinkInput.parse(input);
  
    const [existingLink] = await db
      .select()
      .from(schema.links)
      .where(eq(schema.links.shortUrl, shortUrl))
      .limit(1);
  
    if (existingLink) {
      return makeLeft({
        code: 'SHORT_URL_ALREADY_EXISTS',
        message: 'Shortened URL already exists',
      });
    }
  
    const [link] = await db
      .insert(schema.links)
      .values({ originalUrl, shortUrl })
      .returning();
  
    return makeRight(link);
  }
