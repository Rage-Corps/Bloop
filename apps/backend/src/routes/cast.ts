import { FastifyInstance } from 'fastify';
import { CastDao } from '@bloop/database';

const castDao = new CastDao();

export default async function castRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/cast',
    {
      schema: {
        description: 'Get unique list of all cast members',
        tags: ['cast'],
        response: {
          200: {
            type: 'array',
            items: { type: 'string' },
          },
        },
      },
    },
    async (_request, _reply) => {
      const castMembers = await castDao.getAllCastMembers();
      return castMembers.map((c) => c.name);
    }
  );
}
