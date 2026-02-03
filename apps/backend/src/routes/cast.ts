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
            orderBy: { type: 'string', enum: ['name_asc', 'name_desc', 'mediaCount_asc', 'mediaCount_desc'] },
            hasImage: { type: 'boolean' },
            gender: { type: 'string' },
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
                    gender: { type: 'string', nullable: true },
                    mediaCount: { type: 'number' },
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
      const { name, limit, offset, orderBy, hasImage, gender } = request.query as {
        name?: string;
        limit?: number;
        offset?: number;
        orderBy?: 'name_asc' | 'name_desc' | 'mediaCount_asc' | 'mediaCount_desc';
        hasImage?: boolean;
        gender?: string;
      };
      const filter: Parameters<typeof castDao.getAllCastMembers>[0] = {};
      if (name !== undefined) filter.name = name;
      if (limit !== undefined) filter.limit = Number(limit);
      if (offset !== undefined) filter.offset = Number(offset);
      if (orderBy !== undefined) filter.orderBy = orderBy;
      if (hasImage !== undefined) filter.hasImage = hasImage;
      if (gender !== undefined) filter.gender = gender;
      const result = await castDao.getAllCastMembers(filter);
      return {
        data: result.data.map((c) => ({
          id: c.id,
          name: c.name,
          imageUrl: c.imageUrl,
          gender: c.gender,
          mediaCount: c.mediaCount ?? 0,
        })),
        total: result.total,
        limit: result.limit,
        offset: result.offset,
      };
    }
  );

  fastify.get(
    '/cast/genders',
    {
      schema: {
        description: 'Get unique list of genders from cast members',
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
      return await castDao.getUniqueGenders();
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
