import { proxyActivities } from '@temporalio/workflow';
import { scrapingWorkflow } from './scrapingWorkflow';
import { ScrapingWorkflowInput } from '../types';
import type * as scrapingActivities from '../activities/scraping';

const { listRunningScrapingWorkflows } = proxyActivities<
  typeof scrapingActivities
>({
  startToCloseTimeout: '10s',
});

export async function scheduledScrapingWorkflow(input: ScrapingWorkflowInput) {
  try {
    console.log('🔍 Scheduled scraping workflow: Checking for running workflows...');

    const runningWorkflows = await listRunningScrapingWorkflows();

    if (runningWorkflows && runningWorkflows > 0) {
      console.log(
        `⏸️ Skipping scheduled scrape: ${runningWorkflows} scraping workflow(s) already running`
      );
      return {
        success: true,
        skipped: true,
        message: `Skipped scheduled scrape: ${runningWorkflows} workflow(s) already running`,
        runningWorkflows,
        timestamp: new Date().toISOString(),
      };
    }

    console.log('✅ No running workflows found, proceeding with scheduled scrape...');
    return await scrapingWorkflow(input);
  } catch (error) {
    console.error('❌ Scheduled scraping workflow failed:', error);
    return {
      success: false,
      message: `Scheduled workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}
