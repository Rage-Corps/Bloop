import { isDevelopment } from '../config/index.js';
// Request logging middleware
export async function loggingMiddleware(fastify) {
    // Add request ID to all requests
    fastify.addHook('onRequest', async (request, reply) => {
        // Generate a simple request ID
        const requestId = `req_${Date.now()}_${Math.random()
            .toString(36)
            .substr(2, 9)}`;
        request.headers['x-request-id'] = requestId;
        reply.header('x-request-id', requestId);
    });
    // Log request details
    fastify.addHook('preHandler', async (request, reply) => {
        const startTime = Date.now();
        request.startTime = startTime;
        // Log incoming request
        request.log.info({
            method: request.method,
            url: request.url,
            userAgent: request.headers['user-agent'],
            ip: request.ip,
            requestId: request.headers['x-request-id'],
        }, 'Incoming request');
    });
    // Log response details
    fastify.addHook('onSend', async (request, reply, payload) => {
        const duration = Date.now() - (request.startTime || 0);
        request.log.info({
            method: request.method,
            url: request.url,
            statusCode: reply.statusCode,
            duration: `${duration}ms`,
            requestId: request.headers['x-request-id'],
            responseSize: payload ? Buffer.byteLength(payload.toString()) : 0,
        }, 'Request completed');
        return payload;
    });
    // Log errors
    fastify.addHook('onError', async (request, reply, error) => {
        request.log.error({
            method: request.method,
            url: request.url,
            error: error.message,
            stack: isDevelopment ? error.stack : undefined,
            requestId: request.headers['x-request-id'],
        }, 'Request error');
    });
}
