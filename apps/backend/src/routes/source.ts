import { FastifyInstance } from 'fastify';
import { SourceDao } from '@bloop/database';

const sourceDao = new SourceDao();

export default async function sourceRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/sources',
    {
      schema: {
        description: 'Get unique list of all source names',
        tags: ['sources'],
        response: {
          200: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
    async (_request, _reply) => {
      const sources = await sourceDao.getUniqueSources();
      return sources;
    }
  );
}
