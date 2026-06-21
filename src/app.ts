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
      description: 'API for URL shortening service',
      version: '1.0.0',
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
