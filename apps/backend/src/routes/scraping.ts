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
      const { maxPages, forceMode = false } = request.body as {
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
        const temporalAddress =
          process.env.TEMPORAL_ADDRESS || 'localhost:7233';
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

  // Get running workflows
  fastify.get(
    '/scraping/workflows',
    {
      schema: {
        description: 'List all running scraping workflows',
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
        },
      },
    },
    async (_request, reply) => {
      try {
        const temporalAddress =
          process.env.TEMPORAL_ADDRESS || 'localhost:7233';
        const namespace = process.env.TEMPORAL_NAMESPACE || 'default';

        const connection = await Connection.connect({
          address: temporalAddress,
        });

        const client = new Client({
          connection,
          namespace,
        });

        // List all workflows related to scraping (parent and children for visibility)
        const scrapingWorkflows = client.workflow.list({
          query: 'WorkflowType = "scrapingWorkflow"',
        });

        for await (const workflow of scrapingWorkflows) {
          console.log('RAW', workflow.workflowId);
          // Get a handle to access more detailed information
          const handle = client.workflow.getHandle(workflow.workflowId);
          const description = await handle.describe();

          console.log('Workflow details:', {
            workflowId: description.workflowId,
            workflowType: description.type,
            status: description.status,
            startTime: description.startTime,
            // More detailed info available here
          });
        }

        return { workflows: 'boo' };
      } catch (error) {
        fastify.log.error('Error listing workflows:', error);
        reply.code(500);
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
          workflows: [],
        };
      }
    }
  );

  // Terminate specific workflow and all its children
  fastify.post(
    '/scraping/workflows/:workflowId/terminate',
    {
      schema: {
        description:
          'Terminate a specific scraping workflow and all its children',
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
              terminated: { type: 'boolean' },
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
        const temporalAddress =
          process.env.TEMPORAL_ADDRESS || 'localhost:7233';
        const namespace = process.env.TEMPORAL_NAMESPACE || 'default';

        const connection = await Connection.connect({
          address: temporalAddress,
        });

        const client = new Client({
          connection,
          namespace,
        });

        // Get workflow handle
        const handle = client.workflow.getHandle(workflowId);

        // Terminate the workflow (this will also terminate children due to ParentClosePolicy)
        await handle.terminate(reason);

        fastify.log.info(
          `🛑 Terminated workflow ${workflowId} with reason: ${reason}`
        );

        return {
          message: `Successfully terminated workflow (children terminated automatically)`,
          workflowId,
          terminated: true,
        };
      } catch (error) {
        fastify.log.error(`Error terminating workflow ${workflowId}:`, error);
        reply.code(500);
        return {
          message: `Failed to terminate workflow: ${error instanceof Error ? error.message : 'Unknown error'}`,
          workflowId,
          terminated: false,
        };
      }
    }
  );

  // Terminate all running scraping workflows
  fastify.post(
    '/scraping/workflows/terminate-all',
    {
      schema: {
        description:
          'Terminate all running scraping workflows and their children',
        tags: ['scraping'],
        body: {
          type: 'object',
          properties: {
            reason: {
              type: 'string',
              default: 'User requested bulk termination',
            },
          },
        },
        response: {
          200: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              terminatedCount: { type: 'number' },
              errors: {
                type: 'array',
                items: { type: 'string' },
              },
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
        const temporalAddress =
          process.env.TEMPORAL_ADDRESS || 'localhost:7233';
        const namespace = process.env.TEMPORAL_NAMESPACE || 'default';

        const connection = await Connection.connect({
          address: temporalAddress,
        });

        const client = new Client({
          connection,
          namespace,
        });

        // Find only parent scraping workflows - children will be terminated automatically
        const runningWorkflows = [];
        const scrapingWorkflows = client.workflow.list({
          query:
            'WorkflowType = "scrapingWorkflow" AND ExecutionStatus = "Running"',
        });

        // Collect parent workflow IDs only
        for await (const workflow of scrapingWorkflows) {
          console.log('workflow.workflowId', workflow.workflowId);
          runningWorkflows.push(workflow.workflowId);
        }
        console.log('workflow', runningWorkflows);
        if (runningWorkflows.length === 0) {
          return {
            message: 'No running scraping workflows found',
            terminatedCount: 0,
            errors: [],
          };
        }

        // Terminate all workflows
        const terminationPromises = runningWorkflows.map(async (workflowId) => {
          try {
            const handle = client.workflow.getHandle(workflowId);
            await handle.terminate(reason);
            return { workflowId, success: true };
          } catch (error) {
            return {
              workflowId,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error',
            };
          }
        });

        const results = await Promise.allSettled(terminationPromises);

        let terminatedCount = 0;
        const errors: string[] = [];

        results.forEach((result) => {
          if (result.status === 'fulfilled' && result.value.success) {
            terminatedCount++;
          } else if (result.status === 'fulfilled' && !result.value.success) {
            errors.push(`${result.value.workflowId}: ${result.value.error}`);
          } else if (result.status === 'rejected') {
            errors.push(`Termination failed: ${result.reason}`);
          }
        });

        fastify.log.info(
          `🛑 Terminated ${terminatedCount} scraping workflows. Errors: ${errors.length}`
        );

        return {
          message: `Successfully terminated ${terminatedCount} parent workflows (children terminated automatically)`,
          terminatedCount,
          errors,
        };
      } catch (error) {
        fastify.log.error('Error terminating all workflows:', error);
        console.error('ERROR:', error);
        reply.code(500);
        return {
          message: `Failed to terminate workflows: ${error instanceof Error ? error.message : 'Unknown error'}`,
          terminatedCount: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        };
      }
    }
  );
}
