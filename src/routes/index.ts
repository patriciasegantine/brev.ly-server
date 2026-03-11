import { FastifyInstance } from 'fastify';
import { createLinkRoute } from "@/routes/create-link/create-link.route";

export async function routes(app: FastifyInstance) {
  await app.register(createLinkRoute);
}
