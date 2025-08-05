import { FastifyInstance } from 'fastify';
import { scrapingQueue } from '../jobs/queue';
import { randomUUID } from 'crypto';
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

      const jobId = randomUUID();
      const baseUrl = process.env.BASE_SCRAPE_URL;

      if (!baseUrl) {
        reply.code(400);
        return { error: 'BASE_SCRAPE_URL not configured' };
      }

      const scrapeUtil = new ScrapingUtils(baseUrl);

      const { firstPageLinks, maxPageIndex } =
        await scrapeUtil.getScrapingInfo();

      const job = await scrapingQueue.add(
        'scrape-page-1',
        {
          id: jobId,
          baseUrl,
          pageLinks: firstPageLinks,
          forceMode,
          waitTime,
          status: 'pending',
          createdAt: new Date().toISOString(),
        },
        {
          jobId,
        }
      );

      for (let index = 2; index <= (maxPages ?? maxPageIndex); index++) {
        const jobId = randomUUID();
        const pageUrl = `${baseUrl}page/${index}`;
        const pageLinks = await scrapeUtil.fetchAndExtractLinks(pageUrl);
        await scrapingQueue.add(
          `scrape-page-${index}`,
          {
            id: jobId,
            baseUrl,
            pageLinks,
            forceMode,
            waitTime,
            status: 'pending',
            createdAt: new Date().toISOString(),
          },
          {
            jobId,
          }
        );
      }

      fastify.log.info(`🚀 Started scraping job ${job.id} for ${baseUrl}`);

      reply.code(201);
      return {
        jobId: job.id,
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
    async (request, reply) => {
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
}
