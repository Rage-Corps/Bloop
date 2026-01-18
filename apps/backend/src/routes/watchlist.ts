import { FastifyInstance } from 'fastify';
import { WatchlistDao } from '@bloop/database';
import { auth } from '../auth';

const watchlistDao = new WatchlistDao();

// Authentication middleware
const authenticateUser = async (request: any, reply: any) => {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      reply.code(401);
      throw new Error('Authentication required');
    }

    request.user = session.user;
  } catch (error) {
    reply.code(401);
    throw new Error('Authentication required');
  }
};

export default async function watchlistRoutes(fastify: FastifyInstance) {
  // Get user's watchlist
  fastify.get(
    '/watchlist',
    {
      preHandler: authenticateUser,
      schema: {
        description: "Get the authenticated user's watchlist",
        tags: ['watchlist'],
        response: {
          200: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                description: { type: 'string' },
                thumbnailUrl: { type: 'string' },
                pageUrl: { type: 'string' },
                createdAt: { type: 'string' },
                dateAdded: { type: 'string', nullable: true },
                cast: {
                  type: 'array',
                  items: { type: 'string' },
                  nullable: true,
                },
                duration: { type: 'string', nullable: true },
                sources: {
                  type: 'array',
                  items: {
                    type: 'object',
                    properties: {
                      id: { type: 'string' },
                      sourceName: { type: 'string' },
                      url: { type: 'string' },
                    },
                  },
                },
                categories: {
                  type: 'array',
                  items: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
    async (request) => {
      const userId = (request as any).user?.id;
      return await watchlistDao.getWatchlistByUserId(userId);
    }
  );

  // Add item to watchlist
  fastify.post(
    '/watchlist',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Add a media item to the watchlist',
        tags: ['watchlist'],
        body: {
          type: 'object',
          required: ['mediaId'],
          properties: {
            mediaId: { type: 'string' },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              mediaId: { type: 'string' },
              createdAt: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const userId = (request as any).user?.id;
      const { mediaId } = request.body as { mediaId: string };

      const item = await watchlistDao.addToWatchlist(userId, mediaId);
      reply.code(201);
      return {
        ...item,
        createdAt: item.createdAt.toISOString(),
      };
    }
  );

  // Remove item from watchlist
  fastify.delete(
    '/watchlist/:mediaId',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Remove a media item from the watchlist',
        tags: ['watchlist'],
        params: {
          type: 'object',
          properties: {
            mediaId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              success: { type: 'boolean' },
              message: { type: 'string' },
            },
          },
        },
      },
    },
    async (request) => {
      const userId = (request as any).user?.id;
      const { mediaId } = request.params as { mediaId: string };

      const success = await watchlistDao.removeFromWatchlist(userId, mediaId);
      return {
        success,
        message: success
          ? 'Removed from watchlist'
          : 'Item not found in watchlist',
      };
    }
  );

  // Check if item is in watchlist
  fastify.get(
    '/watchlist/:mediaId/status',
    {
      preHandler: authenticateUser,
      schema: {
        description: 'Check if a media item is in the user watchlist',
        tags: ['watchlist'],
        params: {
          type: 'object',
          properties: {
            mediaId: { type: 'string' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              mediaId: { type: 'string' },
              isInWatchlist: { type: 'boolean' },
            },
          },
        },
      },
    },
    async (request) => {
      const userId = (request as any).user?.id;
      const { mediaId } = request.params as { mediaId: string };

      const isInWatchlist = await watchlistDao.isInWatchlist(userId, mediaId);
      return {
        mediaId,
        isInWatchlist,
      };
    }
  );
}
