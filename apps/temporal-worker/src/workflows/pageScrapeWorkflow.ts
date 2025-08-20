import { proxyActivities } from '@temporalio/workflow';
import type * as scrapingActivities from '../activities/scraping';
import { PageScrapingWorkflowInput } from '../types';

const { fetchAndExtractLinks } = proxyActivities<typeof scrapingActivities>({
  startToCloseTimeout: '120s', // Allow more time for HTTP requests
  heartbeatTimeout: '10s',
});

export async function pageScrapeWorkflow(input: PageScrapingWorkflowInput) {
  try {
    const links = await fetchAndExtractLinks(input.pageUrl, input.baseUrl);

    if (input.force) {
    } else {
    }

    return {
      success: true,
      message: 'Scraping workflow completed successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Page Scraping workflow failed:', error);

    return {
      success: false,
      message: `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}
