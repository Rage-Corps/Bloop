import Fastify from 'fastify'
import healthRoutes from './routes/health'

const start = async () => {
  const fastify = Fastify({
    logger: true
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
    console.log('Server listening on http://localhost:3001')
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}

start()