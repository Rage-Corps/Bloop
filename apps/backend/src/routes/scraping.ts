import { FastifyInstance } from 'fastify';
import { scrapingQueue } from '../jobs/queue';
import { ScrapingUtils } from '../utils/ScrapingUtils';
import { Connection, Client } from '@temporalio/client';

export default async function scrapingRoutes(fastify: FastifyInstance) {
  fastify.post(
    '/scraping/start',
    {
      schema: {
        description: 'Start a new scraping job',
        tags: ['scraping'],
        body: {
          type: 'object',
          properties: {
            maxPages: { type: 'number', minimum: 1 },
            forceMode: { type: 'boolean', default: false },
          },
        },
        response: {
          201: {
            type: 'object',
            properties: {
              jobId: { type: 'string' },
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  maxPages: { type: 'number' },
                  forceMode: { type: 'boolean' },
                },
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const {
        maxPages,
        forceMode = false,
      } = request.body as {
        maxPages?: number;
        forceMode?: boolean;
      };

      const baseUrl = process.env.BASE_SCRAPE_URL;

      if (!baseUrl) {
        reply.code(400);
        return { error: 'BASE_SCRAPE_URL not configured' };
      }

      const scrapeUtil = new ScrapingUtils(baseUrl);

      const jobIds = await scrapeUtil.startScrape(
        {
          maxPages,
          forceMode,
        },
        scrapingQueue
      );

      fastify.log.info(
        `🚀 Started scraping jobs ${jobIds.join(',')} for ${baseUrl}`
      );

      reply.code(201);
      return {
        jobIds,
        message: 'Scraping job started successfully',
        data: {
          maxPages,
          forceMode,
        },
      };
    }
  );

  fastify.get(
    '/scraping/jobs',
    {
      schema: {
        description: 'Get all scraping jobs',
        tags: ['scraping'],
        response: {
          200: {
            type: 'object',
            properties: {
              waiting: { type: 'number' },
              active: { type: 'number' },
              completed: { type: 'number' },
              failed: { type: 'number' },
              delayed: { type: 'number' },
            },
          },
        },
      },
    },
    async (_request, _reply) => {
      const waiting = await scrapingQueue.getWaiting();
      const active = await scrapingQueue.getActive();
      const completed = await scrapingQueue.getCompleted();
      const failed = await scrapingQueue.getFailed();
      const delayed = await scrapingQueue.getDelayed();

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
      };
    }
  );

  fastify.post(
    '/scraping/stop',
    {
      schema: {
        description: 'Cancel all waiting scraping jobs',
        tags: ['scraping'],
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              cancelledJobs: { type: 'number' },
            },
          },
        },
      },
    },
    async (_request, reply) => {
      try {
        // Get all waiting jobs
        const waitingJobs = await scrapingQueue.getWaiting();

        // Cancel each waiting job
        const cancelPromises = waitingJobs.map((job) => job.remove());
        await Promise.all(cancelPromises);

        const cancelledCount = waitingJobs.length;

        fastify.log.info(
          `🛑 Cancelled ${cancelledCount} waiting scraping jobs`
        );

        return {
          message: `Successfully cancelled ${cancelledCount} waiting jobs`,
          cancelledJobs: cancelledCount,
        };
      } catch (error) {
        fastify.log.error('Error cancelling scraping jobs:', error);
        reply.code(500);
        return {
          message: 'Failed to cancel scraping jobs',
          cancelledJobs: 0,
        };
      }
    }
  );

  // Temporal workflow route for scraping
  fastify.post(
    '/scraping/start2',
    {
      schema: {
        description: 'Start scraping using Temporal workflow',
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

      try {
        // Get Temporal client
        const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
        const namespace = process.env.TEMPORAL_NAMESPACE || 'default';
        const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';

        const connection = await Connection.connect({
          address: temporalAddress,
        });

        const client = new Client({
          connection,
          namespace,
        });

        const workflowId = `scraping-workflow-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        const baseUrl = process.env.BASE_SCRAPE_URL;
        
        if (!baseUrl) {
          reply.code(400);
          return {
            error: 'BASE_SCRAPE_URL not configured',
            message: 'BASE_SCRAPE_URL environment variable is required',
          };
        }

        const input = {
          maxPages,
          batchSize,
          force,
          baseUrl,
        };

        // Start the workflow asynchronously with generous timeouts
        await client.workflow.start('scrapingWorkflow', {
          args: [input],
          taskQueue,
          workflowId,
          workflowExecutionTimeout: '2h', // 2 hours max for entire scraping process
          workflowRunTimeout: '2h', // 2 hours max per run
        });

        fastify.log.info(`🚀 Started scraping workflow with ID: ${workflowId}`);

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
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to start scraping workflow',
        };
      }
    }
  );
}
