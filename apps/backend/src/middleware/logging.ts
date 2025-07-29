import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { isDevelopment } from '../config/index.js';

// Request logging middleware
export async function loggingMiddleware(fastify: FastifyInstance) {
  // Add request ID to all requests
  fastify.addHook(
    'onRequest',
    async (request: FastifyRequest, reply: FastifyReply) => {
      // Generate a simple request ID
      const requestId = `req_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      request.headers['x-request-id'] = requestId;
      reply.header('x-request-id', requestId);
    }
  );

  // Log request details
  fastify.addHook(
    'preHandler',
    async (request: FastifyRequest, reply: FastifyReply) => {
      const startTime = Date.now();
      request.startTime = startTime;

      // Log incoming request
      request.log.info(
        {
          method: request.method,
          url: request.url,
          userAgent: request.headers['user-agent'],
          ip: request.ip,
          requestId: request.headers['x-request-id'],
        },
        'Incoming request'
      );
    }
  );

  // Log response details
  fastify.addHook(
    'onSend',
    async (request: FastifyRequest, reply: FastifyReply, payload) => {
      const duration = Date.now() - (request.startTime || 0);

      request.log.info(
        {
          method: request.method,
          url: request.url,
          statusCode: reply.statusCode,
          duration: `${duration}ms`,
          requestId: request.headers['x-request-id'],
          responseSize: payload ? Buffer.byteLength(payload.toString()) : 0,
        },
        'Request completed'
      );

      return payload;
    }
  );

  // Log errors
  fastify.addHook(
    'onError',
    async (request: FastifyRequest, reply: FastifyReply, error) => {
      request.log.error(
        {
          method: request.method,
          url: request.url,
          error: error.message,
          stack: isDevelopment ? error.stack : undefined,
          requestId: request.headers['x-request-id'],
        },
        'Request error'
      );
    }
  );
}

// Extend FastifyRequest type to include startTime
declare module 'fastify' {
  interface FastifyRequest {
    startTime?: number;
  }
}
