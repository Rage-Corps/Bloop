import { FastifyInstance } from 'fastify'
import { SourceHelper } from '../helpers/sourceHelper'

const sourceHelper = new SourceHelper()

export default async function sourceRoutes(fastify: FastifyInstance) {
  fastify.get('/sources', {
    schema: {
      description: 'Get unique list of all source names',
      tags: ['sources'],
      response: {
        200: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const sources = await sourceHelper.getUniqueSources()
    return sources
  })
}