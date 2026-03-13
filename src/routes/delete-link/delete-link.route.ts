import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { deleteLink } from '@/use-cases/delete-link/delete-link';
import { isLeft } from '@/shared/either';

export async function deleteLinkRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().delete(
    '/links/:id',
    {
      schema: {
        params: z.object({
          id: z.string(),
        }),
        response: {
          204: z.null().describe('Link deleted successfully'),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const result = await deleteLink(request.params);
      
      if (isLeft(result)) {
        return reply.status(404).send({
          message: result.value.message,
        });
      }
      
      return reply.status(204).send(null);
    }
  );
}
