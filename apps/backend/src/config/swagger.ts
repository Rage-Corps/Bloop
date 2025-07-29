import { env } from './env.js';

export const swaggerConfig = {
  swagger: {
    info: {
      title: 'Backend API',
      description: 'A robust backend API with media management capabilities',
      version: '1.0.0',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    host: `${env.HOST}:${env.PORT}`,
    schemes: ['http'],
    consumes: ['application/json'],
    produces: ['application/json'],
    tags: [
      {
        name: 'health',
        description: 'Health check endpoints',
      },
      {
        name: 'media',
        description: 'Media management endpoints',
      },
    ],
  },
};

export const swaggerUiConfig = {
  routePrefix: '/docs',
  exposeRoute: true,
  staticCSP: true,
  transformSpecificationClone: true,
  uiConfig: {
    docExpansion: 'list' as const,
    deepLinking: false,
  },
};
