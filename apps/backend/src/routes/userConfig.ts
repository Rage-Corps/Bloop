import { FastifyInstance } from 'fastify';
import { UserConfigDao, UserPreferences } from '../dao/userConfigDao';
import { auth } from '../auth';

const userConfigDao = new UserConfigDao();

// Authentication middleware
const authenticateUser = async (request: any, reply: any) => {
  try {
    // Get the session from Better Auth
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      reply.code(401);
      throw new Error('Authentication required');
    }

    // Attach user to request
    request.user = session.user;
  } catch (error) {
    reply.code(401);
    throw new Error('Authentication required');
  }
};

export default async function userConfigRoutes(fastify: FastifyInstance) {
  // Get user config
  fastify.get(
    '/user-config',
    {
      preHandler: authenticateUser,
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
      const userId = (request as any).user?.id;

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
      preHandler: authenticateUser,
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
      preHandler: authenticateUser,
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