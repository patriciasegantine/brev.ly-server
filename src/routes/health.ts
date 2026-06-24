import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get(
    '/health',
    {
      schema: {
        tags: ['Health'],
        summary: 'Health check',
        description: 'Returns the current status of the server.',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string', example: 'ok' },
              message: { type: 'string', example: 'Server is running' },
            },
          },
        },
      },
    },
    async () => ({
      status: 'ok',
      message: 'Server is running',
    })
  );
}
