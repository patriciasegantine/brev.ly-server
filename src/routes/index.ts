import { FastifyInstance } from 'fastify';
import { createLinkRoute } from "@/routes/create-link/create-link.route";
import { getLinksRoute } from '@/routes/get-links';

export async function routes(app: FastifyInstance) {
  await app.register(createLinkRoute);
  await app.register(getLinksRoute);
}
