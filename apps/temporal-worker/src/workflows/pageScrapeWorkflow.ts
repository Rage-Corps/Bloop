import { proxyActivities } from '@temporalio/workflow';
import type * as scrapingActivities from '../activities/scraping';
import { PageScrapingWorkflowInput } from '../types';

const { fetchAndExtractLinks } = proxyActivities<typeof scrapingActivities>({
  startToCloseTimeout: '60s', // Allow more time for HTTP requests
  heartbeatTimeout: '10s',
});

export async function pageScrapeWorkflow(input: PageScrapingWorkflowInput) {
  try {
    const links = await fetchAndExtractLinks(input.pageUrl, input.baseUrl);

    console.log('pageLinks:', links);
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
