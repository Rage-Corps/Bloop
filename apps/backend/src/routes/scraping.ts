import { FastifyInstance } from 'fastify';
import { scrapingService } from '../services/scraping.js';
import {
  StartScrapingSchema,
  ScrapingJobParamsSchema,
  type StartScraping,
  type ScrapingJobParams,
} from '../schemas/scraping.js';
import { NotFoundError } from '../utils/index.js';

export async function scrapingRoutes(fastify: FastifyInstance) {
  // Start a new scraping operation
  fastify.post<{ Body: StartScraping }>(
    '/scraping/start',
    {
      schema: {
        tags: ['scraping'],
        summary: 'Start a new web scraping operation',
        description: 'Begin scraping a website for media content',
        body: {
          type: 'object',
          properties: {
            options: {
              type: 'object',
              properties: {
                maxDepth: {
                  type: 'integer',
                  minimum: 1,
                  maximum: 5,
                  default: 1,
                  description: 'Maximum depth to crawl (default: 1)',
                },
                includeImages: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether to include images (default: true)',
                },
                includeVideos: {
                  type: 'boolean',
                  default: true,
                  description: 'Whether to include videos (default: true)',
                },
                waitTime: {
                  type: 'integer',
                  minimum: 0,
                  maximum: 10000,
                  default: 1000,
                  description: 'Wait time between requests in ms (default: 1000)',
                },
                force: {
                  type: 'boolean',
                  default: false,
                  description: 'Bypass early termination checks - process all pages even if links already exist (default: false)',
                },
              },
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              job: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  url: { type: 'string' },
                  source: { type: 'string' },
                  status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
                  startedAt: { type: 'string' },
                  completedAt: { type: 'string' },
                  itemsFound: { type: 'integer' },
                  itemsProcessed: { type: 'integer' },
                  error: { type: 'string' },
                },
                required: ['id', 'url', 'source', 'status', 'startedAt', 'itemsFound', 'itemsProcessed'],
              },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const scrapingRequest = StartScrapingSchema.parse(request.body);
      const result = scrapingService.startScraping(scrapingRequest);

      if ('error' in result) {
        reply.status(500);
        return {
          error: result.error,
          code: 'SCRAPING_CONFIG_ERROR',
        };
      }

      return {
        message: 'Scraping job started successfully',
        job: result,
      };
    }
  );

  // Get scraping job status
  fastify.get<{ Params: ScrapingJobParams }>(
    '/scraping/jobs/:id',
    {
      schema: {
        tags: ['scraping'],
        summary: 'Get scraping job status',
        description: 'Retrieve the status and details of a scraping job',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Scraping job ID' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              url: { type: 'string' },
              source: { type: 'string' },
              status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
              startedAt: { type: 'string' },
              completedAt: { type: 'string' },
              itemsFound: { type: 'integer' },
              itemsProcessed: { type: 'integer' },
              error: { type: 'string' },
            },
            required: ['id', 'url', 'source', 'status', 'startedAt', 'itemsFound', 'itemsProcessed'],
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const params = ScrapingJobParamsSchema.parse(request.params);
      const job = scrapingService.getJob(params.id);

      if (!job) {
        throw new NotFoundError('Scraping job');
      }

      return job;
    }
  );

  // Get all scraping jobs
  fastify.get(
    '/scraping/jobs',
    {
      schema: {
        tags: ['scraping'],
        summary: 'Get all scraping jobs',
        description: 'Retrieve all scraping jobs, sorted by most recent first',
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    url: { type: 'string' },
                    source: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'running', 'completed', 'failed'] },
                    startedAt: { type: 'string' },
                    completedAt: { type: 'string' },
                    itemsFound: { type: 'integer' },
                    itemsProcessed: { type: 'integer' },
                    error: { type: 'string' },
                  },
                  required: ['id', 'url', 'source', 'status', 'startedAt', 'itemsFound', 'itemsProcessed'],
                },
              },
              total: { type: 'integer' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const jobs = scrapingService.getAllJobs();
      return {
        data: jobs,
        total: jobs.length,
      };
    }
  );

  // Get active scraping jobs
  fastify.get(
    '/scraping/jobs/active',
    {
      schema: {
        tags: ['scraping'],
        summary: 'Get active scraping jobs',
        description: 'Retrieve all currently running or pending scraping jobs',
        response: {
          200: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    url: { type: 'string' },
                    source: { type: 'string' },
                    status: { type: 'string', enum: ['pending', 'running'] },
                    startedAt: { type: 'string' },
                    itemsFound: { type: 'integer' },
                    itemsProcessed: { type: 'integer' },
                  },
                  required: ['id', 'url', 'source', 'status', 'startedAt', 'itemsFound', 'itemsProcessed'],
                },
              },
              total: { type: 'integer' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const activeJobs = scrapingService.getActiveJobs();
      return {
        data: activeJobs,
        total: activeJobs.length,
      };
    }
  );

  // Cancel a scraping job
  fastify.delete<{ Params: ScrapingJobParams }>(
    '/scraping/jobs/:id',
    {
      schema: {
        tags: ['scraping'],
        summary: 'Cancel a scraping job',
        description: 'Cancel a pending or running scraping job',
        params: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'Scraping job ID' },
          },
          required: ['id'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
            },
          },
          404: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              code: { type: 'string' },
            },
          },
          400: {
            type: 'object',
            properties: {
              error: { type: 'string' },
              code: { type: 'string' },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const params = ScrapingJobParamsSchema.parse(request.params);
      const job = scrapingService.getJob(params.id);

      if (!job) {
        throw new NotFoundError('Scraping job');
      }

      const cancelled = scrapingService.cancelJob(params.id);
      if (!cancelled) {
        reply.status(400);
        return {
          error: 'Job cannot be cancelled - it may already be completed or failed',
          code: 'CANNOT_CANCEL_JOB',
        };
      }

      return {
        message: 'Scraping job cancelled successfully',
      };
    }
  );
}