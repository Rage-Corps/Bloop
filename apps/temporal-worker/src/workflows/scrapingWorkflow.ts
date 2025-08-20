import { proxyActivities } from '@temporalio/workflow';
import { ScrapingWorkflowInput } from '../types';

// Import activities with proper typing
import type * as scrapingActivities from '../activities/scraping';

// Configure activity options
const { fetchPageHTML, getMaxPageIndex } = proxyActivities<
  typeof scrapingActivities
>({
  startToCloseTimeout: '60s', // Allow more time for HTTP requests
  heartbeatTimeout: '10s',
});

export async function scrapingWorkflow(input: ScrapingWorkflowInput) {
  try {
    console.log('🚀 Starting scraping workflow with input:', input);

    console.log('🌐 Base URL:', input.baseUrl);
    console.log('📄 Max Pages:', input.maxPages);
    console.log('🔄 Force Mode:', input.force);

    // Fetch HTML using activity
    const html = await fetchPageHTML(input.baseUrl);

    // Analyze max pages using activity
    const maxPages = await getMaxPageIndex(html, input.baseUrl);
    console.log('📊 MAX PAGES FOUND:', maxPages);

    if (input.force) {
    } else {
    }

    return {
      success: true,
      message: 'Scraping workflow completed successfully',
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Scraping workflow failed:', error);

    return {
      success: false,
      message: `Workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      timestamp: new Date().toISOString(),
    };
  }
}
