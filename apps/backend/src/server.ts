import Fastify from 'fastify';
import healthRoutes from './routes/health';
import mediaRoutes from './routes/media';
import scrapingRoutes from './routes/scraping';
import categoryRoutes from './routes/category';
import castRoutes from './routes/cast';
import sourceRoutes from './routes/source';
import settingsRoutes from './routes/settings';
import userConfigRoutes from './routes/userConfig';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { FastifyAdapter } from '@bull-board/fastify';
import { scrapingQueue, initializeWorker } from './jobs/queue';
import { auth } from './auth';
import { CronService } from './services/CronService';

const start = async () => {
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      },
    },
  });

  await fastify.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Backend API',
        description: 'API documentation for Backend',
        version: '1.0.0',
      },
      servers: [
        {
          url: process.env.AUTH_URL,
          description: 'Development server',
        },
      ],
    },
  });

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false,
    },
  });

  // Register CORS
  await fastify.register(require('@fastify/cors'), {
    origin: ['http://localhost:3000', 'https://bloop.smet-server.ddns.net'], // Your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  // Register Better Auth handler
  fastify.route({
    method: ['GET', 'POST'],
    url: '/api/auth/*',
    async handler(request, reply) {
      try {
        // Construct request URL
        const url = new URL(request.url, `http://${request.headers.host}`);

        // Convert Fastify headers to standard Headers object
        const headers = new Headers();
        Object.entries(request.headers).forEach(([key, value]) => {
          if (value) headers.append(key, value.toString());
        });

        // Create Fetch API-compatible request
        const requestInit: RequestInit = {
          method: request.method,
          headers,
        };

        if (
          request.method !== 'GET' &&
          request.method !== 'HEAD' &&
          request.body
        ) {
          requestInit.body =
            typeof request.body === 'string'
              ? request.body
              : JSON.stringify(request.body);
        }

        const req = new Request(url.toString(), requestInit);

        // Process authentication request
        const response = await auth.handler(req);

        // Forward response to client
        reply.status(response.status);
        response.headers.forEach((value: string, key: string) =>
          reply.header(key, value)
        );
        reply.send(response.body ? await response.text() : null);
      } catch (error) {
        fastify.log.error('Authentication Error:', error);
        reply.status(500).send({
          error: 'Internal authentication error',
          code: 'AUTH_FAILURE',
        });
      }
    },
  });

  const serverAdapter = new FastifyAdapter();

  createBullBoard({
    queues: [new BullMQAdapter(scrapingQueue)],
    serverAdapter,
  });

  serverAdapter.setBasePath('/admin/queues');
  await fastify.register(serverAdapter.registerPlugin(), {
    prefix: '/admin/queues',
  });

  await fastify.register(healthRoutes, { prefix: '/api' });
  await fastify.register(mediaRoutes, { prefix: '/api' });
  await fastify.register(scrapingRoutes, { prefix: '/api' });
  await fastify.register(categoryRoutes, { prefix: '/api' });
  await fastify.register(castRoutes, { prefix: '/api' });
  await fastify.register(sourceRoutes, { prefix: '/api' });
  await fastify.register(settingsRoutes, { prefix: '/api' });
  await fastify.register(userConfigRoutes, { prefix: '/api' });

  await initializeWorker();

  const cronService = new CronService();
  await cronService.initialize();
  await cronService.start();

  // Make cronService available globally for other modules
  fastify.decorate('cronService', cronService);

  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    fastify.log.info('🚀 Server listening on http://localhost:3001');
    fastify.log.info(
      '📚 API Documentation available at http://localhost:3001/docs'
    );
    fastify.log.info(
      '📋 Bull Board available at http://localhost:3001/admin/queues'
    );
  } catch (err) {
    fastify.log.error('❌ Error starting server:', err);
    process.exit(1);
  }
};

start();
