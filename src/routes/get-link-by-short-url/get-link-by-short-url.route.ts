import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getLinkByShortUrl } from '@/use-cases/get-link-by-short-url/get-link-by-short-url';
import { isLeft } from '@/shared/either';

export async function getLinkByShortUrlRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().get(
    '/links/:shortUrl',
    {
      schema: {
        tags: ['Links'],
        summary: 'Resolve a short URL',
        description: 'Returns the original URL for a given slug and increments its access counter. Used by the client to redirect visitors.',
        params: z.object({
          shortUrl: z.string(),
        }),
        response: {
          200: z.object({
            originalUrl: z.string(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await getLinkByShortUrl(request.params);
      
      if (isLeft(result)) {
        return reply.status(404).send({
          message: result.value.message,
        });
      }
      
      return reply.status(200).send(result.value);
    }
  );
}
