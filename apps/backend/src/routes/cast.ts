import { FastifyInstance } from 'fastify';
import { CastDao } from '@bloop/database';
import { temporalService } from '../services/TemporalService';

const castDao = new CastDao();

export default async function castRoutes(fastify: FastifyInstance) {
  fastify.get(
    '/cast',
    {
      schema: {
        description: 'Get unique list of all cast members with pagination',
        tags: ['cast'],
        querystring: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            limit: { type: 'number', default: 20 },
            offset: { type: 'number', default: 0 },
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
              limit: { type: 'number' },
              offset: { type: 'number' },
            },
          },
        },
      },
    },
    async (request, _reply) => {
      const { name, limit, offset } = request.query as {
        name?: string;
        limit?: number;
        offset?: number;
      };
      const filter: Parameters<typeof castDao.getAllCastMembers>[0] = {};
      if (name !== undefined) filter.name = name;
      if (limit !== undefined) filter.limit = Number(limit);
      if (offset !== undefined) filter.offset = Number(offset);
      const result = await castDao.getAllCastMembers(filter);
      return {
        data: result.data.map((c) => ({
          id: c.id,
          name: c.name,
          imageUrl: c.imageUrl,
        })),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
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
