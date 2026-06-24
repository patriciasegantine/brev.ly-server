import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { updateLink } from '@/use-cases/update-link/update-link';
import { isLeft } from '@/shared/either';

export async function updateLinkRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().patch(
    '/links/:id',
    {
      schema: {
        tags: ['Links'],
        summary: 'Update a link',
        description:
          'Updates the original URL and/or the slug of an existing short link. At least one field must be provided. Returns 409 if the new slug is already taken by another link.',
        params: z.object({
          id: z.string(),
        }),
        body: z
          .object({
            originalUrl: z.string().url().optional(),
            shortUrl: z
              .string()
              .min(3)
              .max(50)
              .regex(/^[a-zA-Z0-9_-]+$/)
              .optional(),
          })
          .refine(
            (data) => data.originalUrl !== undefined || data.shortUrl !== undefined,
            { message: 'At least one field (originalUrl or shortUrl) must be provided' }
          ),
        response: {
          200: z.object({
            id: z.string(),
            originalUrl: z.string(),
            shortUrl: z.string(),
            accessCount: z.number(),
            createdAt: z.date(),
          }),
          404: z.object({ message: z.string() }),
          409: z.object({ message: z.string() }),
        },
      },
    },
    async (request, reply) => {
      const result = await updateLink({ id: request.params.id, ...request.body });

      if (isLeft(result)) {
        if (result.value.code === 'LINK_NOT_FOUND') {
          return reply.status(404).send({ message: result.value.message });
        }
        return reply.status(409).send({ message: result.value.message });
      }

      return reply.status(200).send(result.value);
    }
  );
}
