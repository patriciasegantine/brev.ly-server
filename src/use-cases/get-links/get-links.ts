import { z } from 'zod';
import { type Either, makeRight } from '@/shared/either';
import { db } from '@/db';
import { schema } from '@/db/schemas';
import { asc, count, desc, ilike } from 'drizzle-orm';

export const getLinksInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(['createdAt', 'accessCount']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(20),
});

export type GetLinksInput = z.input<typeof getLinksInput>;

export type GetLinksOutput = {
  links: {
    id: string;
    originalUrl: string;
    shortUrl: string;
    accessCount: number;
    createdAt: Date;
  }[];
  total: number;
  page: number;
  pageSize: number;
};

export async function getLinks(
  input: GetLinksInput
): Promise<Either<never, GetLinksOutput>> {
  const { searchQuery, sortBy, sortDirection, page, pageSize } =
    getLinksInput.parse(input);
  
  const [links, [{ total }]] = await Promise.all([
    db
      .select({
        id: schema.links.id,
        originalUrl: schema.links.originalUrl,
        shortUrl: schema.links.shortUrl,
        accessCount: schema.links.accessCount,
        createdAt: schema.links.createdAt,
      })
      .from(schema.links)
      .where(
        searchQuery ? ilike(schema.links.shortUrl, `%${searchQuery}%`) : undefined
      )
      .orderBy((fields) => {
        if (sortBy && sortDirection === 'asc') return asc(fields[sortBy]);
        if (sortBy && sortDirection === 'desc') return desc(fields[sortBy]);
        return desc(fields.createdAt);
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),
    
    db
      .select({ total: count(schema.links.id) })
      .from(schema.links)
      .where(
        searchQuery ? ilike(schema.links.shortUrl, `%${searchQuery}%`) : undefined
      ),
  ]);
  
  return makeRight({ links, total, page, pageSize });
}
