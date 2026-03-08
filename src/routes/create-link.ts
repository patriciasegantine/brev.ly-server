import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { createLink } from '@/use-cases/create-link/create-link';
import { isLeft } from '@/shared/either';

export async function createLinkRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/links',
    {
      schema: {
        body: z.object({
          originalUrl: z.string().url(),
          shortUrl: z.string().min(3).max(50).regex(/^[a-zA-Z0-9_-]+$/),
        }),
        response: {
          201: z.object({
            id: z.string(),
            originalUrl: z.string(),
            shortUrl: z.string(),
            accessCount: z.number(),
            createdAt: z.date(),
          }),
          409: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await createLink(request.body);
      
      if (isLeft(result)) {
        return reply.status(409).send({
          message: result.value.message,
        });
      }
      
      return reply.status(201).send(result.value);
    }
  );
}
