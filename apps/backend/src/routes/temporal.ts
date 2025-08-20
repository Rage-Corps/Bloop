import { FastifyInstance } from 'fastify';
import { Connection, Client } from '@temporalio/client';

// Import workflow types (we'll need to import these from the temporal-worker package)
interface TestWorkflowInput {
  message: string;
  userId?: string;
}

export default async function temporalRoutes(fastify: FastifyInstance) {
  // Create Temporal client instance
  const getTemporalClient = async () => {
    const temporalAddress =
      process.env.TEMPORAL_ADDRESS || '192.168.50.162:7233';
    const namespace = process.env.TEMPORAL_NAMESPACE || 'bloop';

    const connection = await Connection.connect({
      address: temporalAddress,
    });

    return new Client({
      connection,
      namespace,
    });
  };

  // Route to trigger test workflow
  fastify.post(
    '/temporal/test-workflow',
    {
      schema: {
        description: 'Start a test workflow',
        tags: ['temporal'],
        body: {
          type: 'object',
          properties: {
            message: { type: 'string' },
            userId: { type: 'string' },
          },
          required: ['message'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              message: { type: 'string' },
              result: { type: 'object' },
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
      const { message, userId } = request.body as TestWorkflowInput;
      const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';

      try {
        const client = await getTemporalClient();

        const input: TestWorkflowInput = {
          message,
          ...(userId && { userId }),
        };

        const workflowId = `test-workflow-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Start the workflow
        const workflowHandle = await client.workflow.start('testWorkflow', {
          args: [input],
          taskQueue,
          workflowId,
        });

        fastify.log.info(`🚀 Started test workflow with ID: ${workflowId}`);

        // Get the result
        const result = await workflowHandle.result();

        reply.code(201);
        return {
          workflowId,
          message: 'Test workflow started and completed successfully',
          result,
        };
      } catch (error) {
        fastify.log.error('Error starting test workflow:', error);
        reply.code(500);
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to start test workflow',
        };
      }
    }
  );

  // Route to trigger media fetch workflow
  fastify.post(
    '/temporal/media-fetch',
    {
      schema: {
        description: 'Start a media fetch workflow',
        tags: ['temporal'],
        body: {
          type: 'object',
          properties: {
            mediaId: { type: 'string' },
          },
          required: ['mediaId'],
        },
        response: {
          201: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              message: { type: 'string' },
              result: { type: 'object' },
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
      const { mediaId } = request.body as { mediaId: string };
      const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';

      try {
        const client = await getTemporalClient();

        const workflowId = `media-fetch-workflow-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        // Start the workflow
        const workflowHandle = await client.workflow.start(
          'mediaFetchWorkflow',
          {
            args: [mediaId],
            taskQueue,
            workflowId,
          }
        );

        fastify.log.info(
          `🎬 Started media fetch workflow with ID: ${workflowId} for media: ${mediaId}`
        );

        // Get the result
        const result = await workflowHandle.result();

        reply.code(201);
        return {
          workflowId,
          message: 'Media fetch workflow started and completed successfully',
          result,
        };
      } catch (error) {
        fastify.log.error('Error starting media fetch workflow:', error);
        reply.code(500);
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to start media fetch workflow',
        };
      }
    }
  );

  // Route to start workflow asynchronously (non-blocking)
  fastify.post(
    '/temporal/start-async',
    {
      schema: {
        description: 'Start a workflow asynchronously (returns immediately)',
        tags: ['temporal'],
        body: {
          type: 'object',
          properties: {
            workflowType: {
              type: 'string',
              enum: ['test', 'media-fetch'],
            },
            input: { type: 'object' },
          },
          required: ['workflowType', 'input'],
        },
        response: {
          202: {
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
      const { workflowType, input } = request.body as {
        workflowType: 'test' | 'media-fetch';
        input: any;
      };
      const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';

      try {
        const client = await getTemporalClient();

        const workflowId = `${workflowType}-workflow-${Date.now()}-${Math.random().toString(36).substring(7)}`;

        let workflowName: string;
        let args: any[];

        switch (workflowType) {
          case 'test':
            workflowName = 'testWorkflow';
            args = [input];
            break;
          case 'media-fetch':
            if (!input.mediaId) {
              reply.code(400);
              return {
                error: 'Missing mediaId in input',
                message: 'Media fetch workflow requires mediaId',
              };
            }
            workflowName = 'mediaFetchWorkflow';
            args = [input.mediaId];
            break;
          default:
            reply.code(400);
            return {
              error: 'Invalid workflow type',
              message: 'Supported workflow types: test, media-fetch',
            };
        }

        // Start the workflow asynchronously
        await client.workflow.start(workflowName, {
          args,
          taskQueue,
          workflowId,
        });

        fastify.log.info(
          `🚀 Started ${workflowType} workflow asynchronously with ID: ${workflowId}`
        );

        reply.code(202);
        return {
          workflowId,
          message: `${workflowType} workflow started successfully`,
          status: 'running',
        };
      } catch (error) {
        fastify.log.error(`Error starting ${workflowType} workflow:`, error);
        reply.code(500);
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
          message: `Failed to start ${workflowType} workflow`,
        };
      }
    }
  );

  // Route to get workflow status
  fastify.get(
    '/temporal/workflow/:workflowId',
    {
      schema: {
        description: 'Get workflow status and result',
        tags: ['temporal'],
        params: {
          type: 'object',
          properties: {
            workflowId: { type: 'string' },
          },
          required: ['workflowId'],
        },
        response: {
          200: {
            type: 'object',
            properties: {
              workflowId: { type: 'string' },
              status: { type: 'string' },
              result: { type: 'object' },
            },
          },
          404: {
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
      const { workflowId } = request.params as { workflowId: string };

      try {
        const client = await getTemporalClient();

        const workflowHandle = client.workflow.getHandle(workflowId);

        try {
          // Try to get the result (this will throw if workflow is still running)
          const result = await workflowHandle.result();

          return {
            workflowId,
            status: 'completed',
            result,
          };
        } catch (error: any) {
          // If workflow is still running, check its status
          if (
            error.name === 'WorkflowExecutionTerminatedError' ||
            error.name === 'WorkflowExecutionCancelledError'
          ) {
            return {
              workflowId,
              status: 'terminated',
              result: null,
            };
          }

          // If we can describe the workflow, it exists but might be running
          try {
            await workflowHandle.describe();
            return {
              workflowId,
              status: 'running',
              result: null,
            };
          } catch (describeError: any) {
            if (describeError.message?.includes('NotFound')) {
              reply.code(404);
              return {
                error: 'Workflow not found',
                message: `Workflow with ID ${workflowId} was not found`,
              };
            }
            throw describeError;
          }
        }
      } catch (error) {
        fastify.log.error(
          `Error getting workflow ${workflowId} status:`,
          error
        );
        reply.code(500);
        return {
          error: error instanceof Error ? error.message : 'Unknown error',
          message: 'Failed to get workflow status',
        };
      }
    }
  );
}
