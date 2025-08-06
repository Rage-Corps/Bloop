import { FastifyInstance } from 'fastify';
import { CronService } from '../services/CronService';

declare module 'fastify' {
  interface FastifyInstance {
    cronService: CronService;
  }
}

export default async function settingsRoutes(fastify: FastifyInstance) {

  fastify.get(
    '/settings/cron',
    {
      schema: {
        description: 'Get current cron service configuration',
        tags: ['settings'],
        response: {
          200: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              frequency: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const config = await fastify.cronService.getConfiguration();
      return config;
    }
  );

  fastify.put(
    '/settings/cron',
    {
      schema: {
        description: 'Update cron service configuration',
        tags: ['settings'],
        body: {
          type: 'object',
          required: ['enabled'],
          properties: {
            enabled: { type: 'boolean' },
            frequency: { type: 'string' },
          },
          if: { properties: { enabled: { const: true } } },
          then: { required: ['enabled', 'frequency'] },
          else: { required: ['enabled'] },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              config: {
                type: 'object',
                properties: {
                  enabled: { type: 'boolean' },
                  frequency: { type: 'string' },
                },
              },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const { enabled, frequency } = request.body as {
        enabled: boolean;
        frequency?: string;
      };

      // If enabled is true, frequency is required
      if (enabled && !frequency) {
        reply.code(400);
        return { error: 'Frequency is required when enabling cron service' };
      }

      // If disabled, use current frequency or default
      let finalFrequency = frequency;
      if (!enabled && !frequency) {
        const currentConfig = await fastify.cronService.getConfiguration();
        finalFrequency = currentConfig.frequency;
      }

      await fastify.cronService.updateConfiguration(enabled, finalFrequency!);
      
      const updatedConfig = await fastify.cronService.getConfiguration();
      
      return {
        message: `Cron service ${enabled ? 'enabled' : 'disabled'} successfully`,
        config: updatedConfig,
      };
    }
  );
}