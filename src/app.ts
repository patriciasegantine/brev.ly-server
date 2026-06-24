import fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import scalar from '@scalar/fastify-api-reference';
import {
  jsonSchemaTransform,
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { routes } from "@/routes";
import { errorHandler } from "@/errors/error-handler";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(swagger, {
  openapi: {
    info: {
      title: 'Redirect Lab API',
      description:
        'REST API for the Redirect Lab URL shortening platform. Create, resolve, track, and export short links.',
      version: '1.0.0',
      contact: {
        name: 'Patricia Segantine',
        url: 'https://patriciasegantine.vercel.app/',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    tags: [
      {
        name: 'Links',
        description: 'Create, list, resolve, and delete short links',
      },
      {
        name: 'Export',
        description: 'Generate and download link data as CSV via Cloudflare R2',
      },
      {
        name: 'Health',
        description: 'Server availability check',
      },
    ],
    externalDocs: {
      description: 'Client application',
      url: 'https://github.com/patriciasegantine/redirect-lab-client',
    },
  },
  transform: jsonSchemaTransform,
});

// CORS
app.register(cors, {
  origin: true,
});

app.setErrorHandler(errorHandler);

app.register(routes);

app.get('/docs/json', async () => {
  return app.swagger();
});

app.register(scalar, {
  routePrefix: '/docs',
  configuration: {
    url: '/docs/json',
  },
});
