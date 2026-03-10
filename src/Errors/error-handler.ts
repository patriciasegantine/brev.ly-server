import { FastifyError, FastifyReply, FastifyRequest } from 'fastify';
  import { ZodError } from 'zod';
  
  export function errorHandler(
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
  ) {
    // Fastify validation error
    if (error.validation) {
      return reply.status(400).send({
        status: 'error',
        message: 'Invalid data',
        issues: error.validation.map((v) => ({
          field: v.instancePath.replace('/', '') || v.params?.missingProperty,
          message: v.message,
        })),
      });
    }
  
    // Zod validation error
    if (error instanceof ZodError) {
      return reply.status(400).send({
        status: 'error',
        message: 'Invalid data',
        issues: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      });
    }
  
    // Generic error
    return reply.status(500).send({
      status: 'error',
      message: 'Internal server error',
    });
  }
