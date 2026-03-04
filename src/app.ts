import fastify from "fastify";
import {env} from '@/env'

export const app = fastify()

app.get('/health', async (request, reply) => {
  return { status: 'ok', message: 'Server is running' };
});

app.get('/', async (request, reply) => {
  return { message: 'Welcome to Brev.ly API' };
});
