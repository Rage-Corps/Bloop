import Fastify from 'fastify'
import healthRoutes from './routes/health'

const start = async () => {
  const fastify = Fastify({
    logger: {
      transport: {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname'
        }
      }
    }
  })

  await fastify.register(require('@fastify/swagger'), {
    openapi: {
      openapi: '3.0.0',
      info: {
        title: 'Backend2 API',
        description: 'API documentation for Backend2',
        version: '1.0.0'
      },
      servers: [
        {
          url: 'http://localhost:3001',
          description: 'Development server'
        }
      ]
    }
  })

  await fastify.register(require('@fastify/swagger-ui'), {
    routePrefix: '/docs',
    uiConfig: {
      docExpansion: 'full',
      deepLinking: false
    }
  })

  await fastify.register(healthRoutes)

  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' })
    fastify.log.info('🚀 Server listening on http://localhost:3001')
    fastify.log.info('📚 API Documentation available at http://localhost:3001/docs')
  } catch (err) {
    fastify.log.error('❌ Error starting server:', err)
    process.exit(1)
  }
}

start()