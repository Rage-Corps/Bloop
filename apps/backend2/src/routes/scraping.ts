import { FastifyInstance } from 'fastify'
import { scrapingQueue } from '../jobs/queue'
import { randomUUID } from 'crypto'

export default async function scrapingRoutes(fastify: FastifyInstance) {
  fastify.post('/scraping/start', {
    schema: {
      description: 'Start a new scraping job',
      tags: ['scraping'],
      body: {
        type: 'object',
        required: ['baseUrl'],
        properties: {
          baseUrl: { type: 'string', format: 'uri' },
          maxPages: { type: 'number', minimum: 1, maximum: 100, default: 1 },
          forceMode: { type: 'boolean', default: false },
          waitTime: { type: 'number', minimum: 100, maximum: 10000, default: 1000 }
        }
      },
      response: {
        201: {
          type: 'object',
          properties: {
            jobId: { type: 'string' },
            message: { type: 'string' },
            data: {
              type: 'object',
              properties: {
                baseUrl: { type: 'string' },
                maxPages: { type: 'number' },
                forceMode: { type: 'boolean' },
                waitTime: { type: 'number' }
              }
            }
          }
        }
      }
    }
  }, async (request, reply) => {
    const { baseUrl, maxPages = 1, forceMode = false, waitTime = 1000 } = request.body as {
      baseUrl: string
      maxPages?: number
      forceMode?: boolean
      waitTime?: number
    }

    const jobId = randomUUID()
    
    const job = await scrapingQueue.add('scrape-site', {
      id: jobId,
      baseUrl,
      maxPages,
      forceMode,
      waitTime,
      status: 'pending',
      createdAt: new Date().toISOString()
    }, {
      jobId
    })

    fastify.log.info(`🚀 Started scraping job ${job.id} for ${baseUrl}`)

    reply.code(201)
    return {
      jobId: job.id,
      message: 'Scraping job started successfully',
      data: {
        baseUrl,
        maxPages,
        forceMode,
        waitTime
      }
    }
  })

  fastify.get('/scraping/jobs', {
    schema: {
      description: 'Get all scraping jobs',
      tags: ['scraping'],
      response: {
        200: {
          type: 'object',
          properties: {
            waiting: { type: 'number' },
            active: { type: 'number' },
            completed: { type: 'number' },
            failed: { type: 'number' },
            delayed: { type: 'number' }
          }
        }
      }
    }
  }, async (request, reply) => {
    const waiting = await scrapingQueue.getWaiting()
    const active = await scrapingQueue.getActive()
    const completed = await scrapingQueue.getCompleted()
    const failed = await scrapingQueue.getFailed()
    const delayed = await scrapingQueue.getDelayed()

    return {
      waiting: waiting.length,
      active: active.length,
      completed: completed.length,
      failed: failed.length,
      delayed: delayed.length
    }
  })
}