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
        tags: ['Export'],
        summary: 'Export links as CSV',
        description: 'Generates a CSV file containing all short links with their slugs, original URLs, access counts, and creation dates. Uploads the file to Cloudflare R2 and returns the public download URL.',
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
