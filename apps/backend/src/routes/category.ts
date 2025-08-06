import { FastifyInstance } from 'fastify';
import { CategoryDao } from '../dao/categoryDao';

const categoryDao = new CategoryDao();

export default async function categoryRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/categories',
    {
      schema: {
        description: 'Get unique list of all categories',
        tags: ['categories'],
        response: {
          200: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
    async (request, reply) => {
      const categories = await categoryDao.getUniqueCategories();
      return categories;
    }
  );
}
