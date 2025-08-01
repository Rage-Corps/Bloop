import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import {
  env,
  loggerConfig,
  swaggerConfig,
  swaggerUiConfig,
  auth,
} from './config/index.js';
import { dbConnection } from './database/index.js';
import { mediaRoutes } from './routes/media.js';
import { scrapingRoutes } from './routes/scraping.js';
import { errorHandler } from './utils/index.js';
import { loggingMiddleware } from './middleware/index.js';

// Create Fastify instance at module level
const fastify = Fastify({
  logger: loggerConfig,
});

// Start server function
const start = async () => {
  // Register CORS with Better-Auth support
  await fastify.register(cors, {
    origin: [
      'http://localhost:3000', // Nuxt frontend
      'http://127.0.0.1:3000',
      env.NODE_ENV === 'development' ? true : false
    ].filter(Boolean),
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'Accept',
      'Origin',
      'Cookie',
      'Set-Cookie'
    ],
    credentials: true, // Essential for Better-Auth cookies
  });

  // Register Swagger documentation
  await fastify.register(swagger, swaggerConfig);
  await fastify.register(swaggerUi, swaggerUiConfig);

  // Register logging middleware
  await fastify.register(loggingMiddleware);

  // Register error handler
  fastify.setErrorHandler(errorHandler);

  // Health check route
  fastify.get(
    '/health',
    {
      schema: {
        tags: ['health'],
        summary: 'Health check',
        description: 'Check if the API is running and healthy',
        response: {
          200: {
            type: 'object',
            properties: {
              status: { type: 'string' },
              timestamp: { type: 'string' },
              service: { type: 'string' },
              environment: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        service: 'backend',
        environment: env.NODE_ENV,
      };
    }
  );

  // Register API routes
  await fastify.register(mediaRoutes, { prefix: '/api' });
  await fastify.register(scrapingRoutes, { prefix: '/api' });

  // Register authentication routes
  fastify.route({
    method: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    url: '/api/auth/*',
    async handler(request, reply) {
      try {
        // Construct request URL
        const protocol = request.protocol || 'http';
        const host = request.headers.host || `${env.HOST}:${env.PORT}`;
        const url = new URL(`${protocol}://${host}${request.url}`);
        
        // Convert Fastify headers to standard Headers object
        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) {
            headers.append(key, Array.isArray(value) ? value.join(', ') : value.toString());
          }
        });

        // Get request body as string if present
        let body: string | undefined;
        if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
          body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
        }

        // Create Fetch API-compatible request
        const webRequest = new Request(url.toString(), {
          method: request.method,
          headers,
          body,
        });

        // Process authentication request
        const response = await auth.handler(webRequest);

        // Forward response status
        reply.status(response.status);
        
        // Forward response headers
        response.headers.forEach((value, key) => {
          reply.header(key, value);
        });

        // Forward response body
        const responseBody = await response.text();
        
        // Handle different content types
        if (responseBody) {
          const contentType = response.headers.get('content-type');
          if (contentType?.includes('application/json')) {
            try {
              return JSON.parse(responseBody);
            } catch {
              return responseBody;
            }
          } else {
            return responseBody;
          }
        }
        
        return null;

      } catch (error) {
        fastify.log.error('Authentication Error:', error);
        reply.status(500);
        return {
          error: 'Internal authentication error',
          code: 'AUTH_FAILURE'
        };
      }
    }
  });

  // Graceful shutdown
  fastify.addHook('onClose', async () => {
    fastify.log.info('Closing database connection...');
    dbConnection.close();
  });

  try {
    await fastify.listen({ port: env.PORT, host: env.HOST });

    fastify.log.info(
      `🚀 Backend server running on http://${env.HOST}:${env.PORT}`
    );
    fastify.log.info(
      `📚 API Documentation: http://${env.HOST}:${env.PORT}/docs`
    );
    fastify.log.info(`📊 Try: curl http://${env.HOST}:${env.PORT}/api/media`);
    fastify.log.info(`🌍 Environment: ${env.NODE_ENV}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

// Graceful shutdown handlers
const gracefulShutdown = async (signal: string) => {
  console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
  try {
    await fastify.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during shutdown:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

start();
