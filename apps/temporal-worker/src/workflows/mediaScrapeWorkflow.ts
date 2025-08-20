import { proxyActivities } from '@temporalio/workflow';
import type * as scrapingActivities from '../activities/scraping';
import { MediaScrapingWorkflowInput } from '../types';

const { processLink } = proxyActivities<typeof scrapingActivities>({
  startToCloseTimeout: '120s', // Allow more time for HTTP requests
  heartbeatTimeout: '10s',
});

export async function mediaScrapeWorkflow(input: MediaScrapingWorkflowInput) {
  try {
    const { mediaUrl } = input;
    const media = await processLink(mediaUrl);

    console.log('Finished:', media.name);
    return {
      success: true,
    };
  } catch (error) {
    console.error('❌ Media Scraping workflow failed:', error);

    return {
      success: false,
      message: `Media scraping workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      pageUrl: input.mediaUrl,
      mediaProcessing: {
        totalMedia: 0,
        successful: 0,
        failed: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
