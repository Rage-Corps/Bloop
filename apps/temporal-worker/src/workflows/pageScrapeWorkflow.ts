import {
  proxyActivities,
  startChild,
  ParentClosePolicy,
} from '@temporalio/workflow';
import type * as scrapingActivities from '../activities/scraping';
import { PageScrapingWorkflowInput } from '../types';
import { mediaScrapeWorkflow } from './mediaScrapeWorkflow';

const { fetchAndExtractLinks } = proxyActivities<typeof scrapingActivities>({
  startToCloseTimeout: '120s', // Allow more time for HTTP requests
  heartbeatTimeout: '10s',
});

export async function pageScrapeWorkflow(input: PageScrapingWorkflowInput) {
  try {
    const { pageUrl, baseUrl, force } = input;
    console.log(`🕷️ Starting page scrape for: ${pageUrl}`);

    const mediaLinks = await fetchAndExtractLinks(input.pageUrl, input.baseUrl);
    console.log(`🔗 Found ${mediaLinks.length} media links on page`);

    if (mediaLinks.length === 0) {
      return {
        success: true,
        message: 'Page scraping completed - no media links found',
        pageUrl,
        mediaLinks: [],
        mediaProcessing: {
          totalMedia: 0,
          successful: 0,
          failed: 0,
        },
        timestamp: new Date().toISOString(),
      };
    }

    // Start all media scraping workflows
    const mediaWorkflows = mediaLinks.map((link, index) =>
      startChild(mediaScrapeWorkflow, {
        workflowId: `media-scrape-${Date.now()}-${index}`,
        parentClosePolicy: ParentClosePolicy.TERMINATE, // Terminate children when parent completes
        workflowExecutionTimeout: '5m', // 5 minutes max per media item
        workflowRunTimeout: '4m', // 4 minutes max per run
        args: [
          {
            mediaUrl: link,
            force,
            baseUrl,
          },
        ],
      })
    );

    console.log(`🚀 Started ${mediaWorkflows.length} media scraping workflows`);

    // Wait for all media workflows to complete
    const results = await Promise.allSettled(mediaWorkflows);

    // Analyze results
    const successful = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;

    console.log(
      `📊 Media scraping completed: ${successful} successful, ${failed} failed`
    );

    // Log failed media workflow details for debugging
    results.forEach((result, idx) => {
      if (result.status === 'rejected') {
        console.error(
          `❌ Media workflow failed for ${mediaLinks[idx]}: ${result.reason}`
        );
      }
    });

    return {
      success: true,
      message: 'Page scraping workflow completed successfully',
      pageUrl,
      mediaLinks,
      mediaProcessing: {
        totalMedia: mediaLinks.length,
        successful,
        failed,
      },
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    console.error('❌ Page Scraping workflow failed:', error);

    return {
      success: false,
      message: `Page scraping workflow failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      pageUrl: input.pageUrl,
      mediaLinks: [],
      mediaProcessing: {
        totalMedia: 0,
        successful: 0,
        failed: 0,
      },
      timestamp: new Date().toISOString(),
    };
  }
}
