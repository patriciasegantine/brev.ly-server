import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { exportLinksCsv } from '@/use-cases/export-links-csv/export-links-csv';
import { isLeft } from '@/shared/either';

export async function exportLinksCsvRoute(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/links/export',
    {
      schema: {
        response: {
          201: z.object({
            fileKey: z.string(),
            fileUrl: z.string().url(),
          }),
          503: z.object({
            message: z.string(),
          }),
          500: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (_, reply) => {
      const result = await exportLinksCsv();

      if (isLeft(result)) {
        if (result.value.code === 'STORAGE_NOT_CONFIGURED') {
          return reply.status(503).send({ message: result.value.message });
        }

        return reply.status(500).send({ message: result.value.message });
      }

      return reply.status(201).send(result.value);
    }
  );
}
