import { FastifyInstance } from 'fastify';
import { createLinkRoute } from "@/routes/create-link";

export async function routes(app: FastifyInstance) {
  await app.register(createLinkRoute);
}
