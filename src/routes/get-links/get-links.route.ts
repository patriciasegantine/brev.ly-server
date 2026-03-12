import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getLinks } from "@/use-cases/get-links/get-links";

export async function getLinksRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/links',
    {
      schema: {
        querystring: z.object({
          searchQuery: z.string().optional(),
          sortBy: z.enum(['createdAt', 'accessCount']).optional(),
          sortDirection: z.enum(['asc', 'desc']).optional().default('desc'),
          page: z.coerce.number().int().optional().default(1).pipe(z.number().min(1)),
          pageSize: z.coerce.number().int().optional().default(20).pipe(z.number().min(1)),
        }),
        response: {
          200: z.object({
            links: z.array(
              z.object({
                id: z.string(),
                originalUrl: z.string(),
                shortUrl: z.string(),
                accessCount: z.number(),
                createdAt: z.date(),
              })
            ),
            total: z.number(),
            page: z.number(),
            pageSize: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await getLinks(request.query);
      return reply.status(200).send(result.value);
    }
  );
}
