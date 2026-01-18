import { Connection, Client, ScheduleOverlapPolicy } from '@temporalio/client';

export class TemporalService {
  private client: Client | null = null;
  private connection: Connection | null = null;

  private async getClient(): Promise<Client> {
    if (this.client) return this.client;

    const temporalAddress = process.env.TEMPORAL_ADDRESS || 'localhost:7233';
    const namespace = process.env.TEMPORAL_NAMESPACE || 'default';

    this.connection = await Connection.connect({
      address: temporalAddress,
    });

    this.client = new Client({
      connection: this.connection,
      namespace,
    });

    return this.client;
  }

  async triggerScraping(input: {
    maxPages?: number | undefined;
    batchSize?: number | undefined;
    force?: boolean | undefined;
    baseUrl: string;
  }) {
    const client = await this.getClient();
    const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';
    const workflowId = `scraping-workflow-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    await client.workflow.start('scrapingWorkflow', {
      args: [input],
      taskQueue,
      workflowId,
      workflowExecutionTimeout: '2h',
      workflowRunTimeout: '2h',
    });

    return workflowId;
  }

  async triggerStarImageDiscovery() {
    const client = await this.getClient();
    const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';
    const workflowId = `star-discovery-${Date.now()}`;

    await client.workflow.start('starImageDiscoveryWorkflow', {
      taskQueue,
      workflowId,
      workflowExecutionTimeout: '1h',
    });

    return workflowId;
  }

  async listScrapingWorkflows() {
    const client = await this.getClient();
    const workflows = [];
    const scrapingWorkflows = client.workflow.list({
      query: 'WorkflowType = "scrapingWorkflow"',
    });

    for await (const workflow of scrapingWorkflows) {
      workflows.push({
        workflowId: workflow.workflowId,
        status: workflow.status.name,
        type: workflow.type,
        startTime: workflow.startTime,
        taskQueue: workflow.taskQueue,
      });
    }

    return workflows;
  }

  async terminateWorkflow(workflowId: string, reason: string = 'User requested termination') {
    const client = await this.getClient();
    const handle = client.workflow.getHandle(workflowId);
    await handle.terminate(reason);
  }

  async terminateAllScrapingWorkflows(reason: string = 'User requested bulk termination') {
    const client = await this.getClient();
    const scrapingWorkflows = client.workflow.list({
      query: 'WorkflowType = "scrapingWorkflow" AND ExecutionStatus = "Running"',
    });

    const terminationPromises = [];
    for await (const workflow of scrapingWorkflows) {
      const handle = client.workflow.getHandle(workflow.workflowId);
      terminationPromises.push(handle.terminate(reason).catch(err => {
        console.error(`Failed to terminate workflow ${workflow.workflowId}:`, err);
        return null;
      }));
    }

    await Promise.all(terminationPromises);
    return terminationPromises.length;
  }

  // Schedule Management
  async createOrUpdateScrapingSchedule(scheduleId: string, cronExpression: string, input: any) {
    const client = await this.getClient();
    const taskQueue = process.env.TASK_QUEUE || 'bloop-tasks';

    try {
      const handle = client.schedule.getHandle(scheduleId);
      await handle.describe();
      
      // If it exists, we update it
      await handle.update((prev) => ({
        ...prev,
        spec: {
          cronExpressions: [cronExpression],
        },
        action: {
          ...prev.action,
          args: [input],
        }
      }));
    } catch (e) {
      // If it doesn't exist, create it
      await client.schedule.create({
        scheduleId,
        spec: {
          cronExpressions: [cronExpression],
        },
        action: {
          type: 'startWorkflow',
          workflowType: 'scrapingWorkflow',
          args: [input],
          taskQueue,
        },
        policies: {
          overlap: ScheduleOverlapPolicy.SKIP,
        },
      });
    }
  }

  async deleteSchedule(scheduleId: string) {
    const client = await this.getClient();
    try {
      const handle = client.schedule.getHandle(scheduleId);
      await handle.delete();
    } catch (e) {
      // Ignore if doesn't exist
    }
  }
}

export const temporalService = new TemporalService();
