import { FastifyInstance } from 'fastify';
import { scrapingQueue } from '../jobs/queue';
import { ScrapingUtils } from '../utils/ScrapingUtils';

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
            maxPages: { type: 'number', minimum: 1, maximum: 100 },
            forceMode: { type: 'boolean', default: false },
            waitTime: {
              type: 'number',
              minimum: 100,
              maximum: 10000,
              default: 1000,
            },
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
                  waitTime: { type: 'number' },
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
        waitTime = 1000,
      } = request.body as {
        maxPages?: number;
        forceMode?: boolean;
        waitTime?: number;
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
          waitTime,
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
          waitTime,
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
}
