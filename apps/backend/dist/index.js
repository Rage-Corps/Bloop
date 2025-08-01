import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { env, loggerConfig, swaggerConfig, swaggerUiConfig, } from './config/index.js';
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
    // Register CORS
    await fastify.register(cors, {
        origin: true,
    });
    // Register Swagger documentation
    await fastify.register(swagger, swaggerConfig);
    await fastify.register(swaggerUi, swaggerUiConfig);
    // Register logging middleware
    await fastify.register(loggingMiddleware);
    // Register error handler
    fastify.setErrorHandler(errorHandler);
    // Health check route
    fastify.get('/health', {
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
    }, async (request, reply) => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            service: 'backend',
            environment: env.NODE_ENV,
        };
    });
    // Register API routes
    await fastify.register(mediaRoutes, { prefix: '/api' });
    await fastify.register(scrapingRoutes, { prefix: '/api' });
    // Graceful shutdown
    fastify.addHook('onClose', async () => {
        fastify.log.info('Closing database connection...');
        dbConnection.close();
    });
    try {
        await fastify.listen({ port: env.PORT, host: env.HOST });
        fastify.log.info(`🚀 Backend server running on http://${env.HOST}:${env.PORT}`);
        fastify.log.info(`📚 API Documentation: http://${env.HOST}:${env.PORT}/docs`);
        fastify.log.info(`📊 Try: curl http://${env.HOST}:${env.PORT}/api/media`);
        fastify.log.info(`🌍 Environment: ${env.NODE_ENV}`);
    }
    catch (err) {
        fastify.log.error(err);
        process.exit(1);
    }
};
// Graceful shutdown handlers
const gracefulShutdown = async (signal) => {
    console.log(`\n🔄 Received ${signal}, shutting down gracefully...`);
    try {
        await fastify.close();
        process.exit(0);
    }
    catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
};
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
start();
