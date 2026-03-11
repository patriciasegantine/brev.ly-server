import fastify from 'fastify';
import cors from '@fastify/cors';
import {
  serializerCompiler,
  validatorCompiler,
  type ZodTypeProvider,
} from 'fastify-type-provider-zod';
import { routes } from "@/routes";
import { healthRoutes } from "@/routes/health";
import { errorHandler } from "@/errors/error-handler";

export const app = fastify().withTypeProvider<ZodTypeProvider>();

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// CORS
app.register(cors, {
  origin: true,
});

app.setErrorHandler(errorHandler);

app.register(healthRoutes)
app.register(routes);
