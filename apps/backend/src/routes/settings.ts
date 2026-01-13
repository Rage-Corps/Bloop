import { FastifyInstance } from 'fastify';
import { temporalService } from '../services/TemporalService';
import { SettingsDao } from '@bloop/database';

export default async function settingsRoutes(fastify: FastifyInstance) {
  const settingsDao = new SettingsDao();

  fastify.get(
    '/settings/cron',
    {
      schema: {
        description: 'Get current cron service configuration from Temporal Schedules',
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
    async (_request, _reply) => {
      const enabled = await settingsDao.getBooleanSetting('cron.enabled', true);
      const frequencySetting = await settingsDao.getSetting('cron.frequency');
      const frequency = frequencySetting?.value || '0 * * * *';
      
      return { enabled, frequency };
    }
  );

  fastify.put(
    '/settings/cron',
    {
      schema: {
        description: 'Update cron service configuration and sync with Temporal Schedules',
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
          500: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
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

      try {
        await settingsDao.setBooleanSetting('cron.enabled', enabled);
        
        let finalFrequency = frequency;
        if (frequency) {
          await settingsDao.setSetting({ key: 'cron.frequency', value: frequency });
        } else {
          const frequencySetting = await settingsDao.getSetting('cron.frequency');
          finalFrequency = frequencySetting?.value || '0 * * * *';
        }

        // Sync with Temporal
        const scheduleId = 'scraping-schedule';
        if (enabled) {
          const baseUrl = process.env.BASE_SCRAPE_URL;
          if (!baseUrl) {
             throw new Error('BASE_SCRAPE_URL not configured');
          }

          await temporalService.createOrUpdateScrapingSchedule(scheduleId, finalFrequency!, {
            baseUrl,
            maxPages: 10, // Default for scheduled tasks
            batchSize: 5,
            force: false
          });
          fastify.log.info(`✅ Synced Temporal Schedule: ${scheduleId} (${finalFrequency})`);
        } else {
          await temporalService.deleteSchedule(scheduleId);
          fastify.log.info(`🛑 Deleted Temporal Schedule: ${scheduleId}`);
        }

        return {
          message: `Cron service ${enabled ? 'enabled' : 'disabled'} successfully`,
          config: { enabled, frequency: finalFrequency },
        };
      } catch (error) {
        fastify.log.error('Error updating cron settings:', error);
        reply.code(500);
        return {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}
