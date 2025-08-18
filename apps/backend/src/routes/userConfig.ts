import { FastifyInstance } from 'fastify';
import { UserConfigDao, UserPreferences } from '../dao/userConfigDao';

const userConfigDao = new UserConfigDao();

export default async function userConfigRoutes(fastify: FastifyInstance) {
  // Get user config
  fastify.get(
    '/user-config',
    {
      schema: {
        description: 'Get user configuration and preferences',
        tags: ['user-config'],
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              preferences: {
                type: 'object',
                properties: {
                  excludedCategories: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  preferredSource: { type: 'string' }
                }
              },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      // TODO: Get user ID from authentication middleware
      // For now, using a placeholder - you'll need to integrate with your auth system
      const userId = (request as any).user?.id;
      
      if (!userId) {
        reply.code(401);
        return { error: 'Authentication required' };
      }

      const config = await userConfigDao.getUserConfig(userId);
      
      if (!config) {
        // Return default empty preferences if no config exists
        return {
          id: '',
          userId,
          preferences: {},
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
      }

      return {
        ...config,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      };
    }
  );

  // Update user config
  fastify.put(
    '/user-config',
    {
      schema: {
        description: 'Update user configuration and preferences',
        tags: ['user-config'],
        body: {
          type: 'object',
          properties: {
            preferences: {
              type: 'object',
              properties: {
                excludedCategories: {
                  type: 'array',
                  items: { type: 'string' }
                },
                preferredSource: { type: 'string' }
              }
            }
          },
          required: ['preferences']
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              preferences: {
                type: 'object',
                properties: {
                  excludedCategories: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  preferredSource: { type: 'string' }
                }
              },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const userId = (request as any).user?.id;
      
      if (!userId) {
        reply.code(401);
        return { error: 'Authentication required' };
      }

      const { preferences } = request.body as { preferences: UserPreferences };

      const config = await userConfigDao.upsertUserConfig(userId, preferences);

      return {
        ...config,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      };
    }
  );

  // Patch user config (partial update)
  fastify.patch(
    '/user-config',
    {
      schema: {
        description: 'Partially update user configuration and preferences',
        tags: ['user-config'],
        body: {
          type: 'object',
          properties: {
            excludedCategories: {
              type: 'array',
              items: { type: 'string' }
            },
            preferredSource: { type: 'string' }
          }
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              userId: { type: 'string' },
              preferences: {
                type: 'object',
                properties: {
                  excludedCategories: {
                    type: 'array',
                    items: { type: 'string' }
                  },
                  preferredSource: { type: 'string' }
                }
              },
              createdAt: { type: 'string' },
              updatedAt: { type: 'string' }
            }
          }
        }
      }
    },
    async (request, reply) => {
      const userId = (request as any).user?.id;
      
      if (!userId) {
        reply.code(401);
        return { error: 'Authentication required' };
      }

      const preferences = request.body as Partial<UserPreferences>;

      const config = await userConfigDao.upsertUserConfig(userId, preferences);

      return {
        ...config,
        createdAt: config.createdAt.toISOString(),
        updatedAt: config.updatedAt.toISOString()
      };
    }
  );
}