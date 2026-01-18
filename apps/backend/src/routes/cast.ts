import { FastifyInstance } from 'fastify';
import { CastDao } from '@bloop/database';
import { temporalService } from '../services/TemporalService';

const castDao = new CastDao();

export default async function castRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/cast',
    {
      schema: {
        description: 'Get unique list of all cast members',
        tags: ['cast'],
        querystring: {
          type: 'object',
          properties: {
            name: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    name: { type: 'string' },
                    imageUrl: { type: 'string', nullable: true },
                  },
                },
              },
              total: { type: 'number' },
            },
          },
        },
      },
    },
    async (request, _reply) => {
      const { name } = request.query as { name?: string };
      const { data, total } = await castDao.getAllCastMembers({ name });
      return {
        data: data.map((c) => ({
          id: c.id,
          name: c.name,
          imageUrl: c.imageUrl,
        })),
        total,
      };
    }
  );

  fastify.post(
    '/cast/discover-images',
    {
      schema: {
        description: 'Trigger star image discovery workflow',
        tags: ['cast'],
        response: {
          201: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      const workflowId = await temporalService.triggerStarImageDiscovery();
      reply.code(201);
      return {
        workflowId,
        message: 'Star image discovery workflow started',
      };
    }
  );
}
