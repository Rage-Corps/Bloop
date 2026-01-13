import { FastifyInstance } from 'fastify';
import { temporalService } from '../services/TemporalService';

export default async function scrapingRoutes(fastify: FastifyInstance) {
  // Trigger a new scraping workflow
  fastify.post(
    '/scraping/trigger',
    {
      schema: {
        description: 'Start a new scraping workflow via Temporal',
        tags: ['scraping'],
        body: {
          type: 'object',
          properties: {
            maxPages: { type: 'number', minimum: 1 },
            batchSize: { type: 'number', minimum: 1, maximum: 50, default: 5 },
            force: { type: 'boolean', default: false },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              message: { type: 'string' },
              status: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              message: { type: 'string' },
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
      const {
        maxPages,
        batchSize = 5,
        force = false,
      } = request.body as {
        maxPages?: number;
        batchSize?: number;
        force?: boolean;
      };

      const baseUrl = process.env.BASE_SCRAPE_URL;
      if (!baseUrl) {
        reply.code(400);
        return {
          error: 'Configuration Error',
          message: 'BASE_SCRAPE_URL not configured',
        };
      }

      try {
        const workflowId = await temporalService.triggerScraping({
          maxPages,
          batchSize,
          force,
          baseUrl,
        });

        fastify.log.info(`🚀 Started scraping workflow: ${workflowId}`);

        reply.code(201);
        return {
          workflowId,
          message: 'Scraping workflow started successfully',
          status: 'running',
        };
      } catch (error) {
        fastify.log.error('Error starting scraping workflow:', error);
        reply.code(500);
        return {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Get status of workflows
  fastify.get(
    '/scraping/status',
    {
      schema: {
        description: 'List active and recent scraping workflows',
        tags: ['scraping'],
        response: {
          200: {
            type: 'object',
            properties: {
              workflows: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    workflowId: { type: 'string' },
                    status: { type: 'string' },
                    type: { type: 'string' },
                    startTime: { type: 'string' },
                    taskQueue: { type: 'string' },
                  },
                },
              },
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
    async (_request, reply) => {
      try {
        const workflows = await temporalService.listScrapingWorkflows();
        return { workflows };
      } catch (error) {
        fastify.log.error('Error listing workflows:', error);
        reply.code(500);
        return {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Terminate a specific workflow
  fastify.post(
    '/scraping/terminate/:workflowId',
    {
      schema: {
        description: 'Terminate a specific scraping workflow',
        tags: ['scraping'],
        params: {
          type: 'object',
          properties: {
            workflowId: { type: 'string' },
          },
          required: ['workflowId'],
        },
        body: {
          type: 'object',
          properties: {
            reason: { type: 'string', default: 'User requested termination' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              workflowId: { type: 'string' },
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
      const { workflowId } = request.params as { workflowId: string };
      const { reason = 'User requested termination' } = request.body as {
        reason?: string;
      };

      try {
        await temporalService.terminateWorkflow(workflowId, reason);
        fastify.log.info(`🛑 Terminated workflow ${workflowId}`);
        return {
          message: 'Workflow terminated successfully',
          workflowId,
        };
      } catch (error) {
        fastify.log.error(`Error terminating workflow ${workflowId}:`, error);
        reply.code(500);
        return {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );

  // Terminate all running workflows
  fastify.post(
    '/scraping/terminate-all',
    {
      schema: {
        description: 'Terminate all running scraping workflows',
        tags: ['scraping'],
        body: {
          type: 'object',
          properties: {
            reason: { type: 'string', default: 'User requested bulk termination' },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              terminatedCount: { type: 'number' },
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
      const { reason = 'User requested bulk termination' } = request.body as {
        reason?: string;
      };

      try {
        const terminatedCount = await temporalService.terminateAllScrapingWorkflows(reason);
        fastify.log.info(`🛑 Terminated ${terminatedCount} workflows`);
        return {
          message: `Successfully terminated ${terminatedCount} workflows`,
          terminatedCount,
        };
      } catch (error) {
        fastify.log.error('Error terminating all workflows:', error);
        reply.code(500);
        return {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }
  );
}
