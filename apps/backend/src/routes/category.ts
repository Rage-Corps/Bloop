import { FastifyInstance } from 'fastify'
import { CategoryHelper } from '../helpers/categoryHelper'

const categoryHelper = new CategoryHelper()

export default async function categoryRoutes(fastify: FastifyInstance) {
  fastify.get('/categories', {
    schema: {
      description: 'Get unique list of all categories',
      tags: ['categories'],
      response: {
        200: {
          type: 'array',
          items: { type: 'string' }
        }
      }
    }
  }, async (request, reply) => {
    const categories = await categoryHelper.getUniqueCategories()
    return categories
  })
}