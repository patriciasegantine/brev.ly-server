import { FastifyInstance } from 'fastify';

export async function healthRoutes(app: FastifyInstance) {
  app.get('/health', async () => ({
    status: 'ok',
    message: 'Server is running',
  }));

  // remove this route when we have a frontend to serve
  app.get('/', async () => ({
    message: 'Welcome to Brev.ly API',
  }));
}
