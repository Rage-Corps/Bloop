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

    // Process media scraping workflows sequentially
    console.log(
      `🚀 Starting ${mediaLinks.length} media scraping workflows sequentially`
    );

    let successful = 0;
    let failed = 0;
    const errors: string[] = [];

    for (let index = 0; index < mediaLinks.length; index++) {
      const link = mediaLinks[index];
      console.log(
        `🔄 Processing media ${index + 1}/${mediaLinks.length}: ${link}`
      );

      try {
        const child = await startChild(mediaScrapeWorkflow, {
          workflowId: `media-scrape-${Date.now()}-${index}`,
          parentClosePolicy: ParentClosePolicy.TERMINATE, // Let children complete independently
          workflowExecutionTimeout: '5m', // 5 minutes max per media item
          workflowRunTimeout: '4m', // 4 minutes max per run
          args: [
            {
              mediaUrl: link,
              force,
              baseUrl,
            },
          ],
        });

        await child.result();

        successful++;
        console.log(`✅ Media workflow completed for: ${link}`);
      } catch (error) {
        failed++;
        const errorMsg =
          error instanceof Error ? error.message : 'Unknown error';
        errors.push(`${link}: ${errorMsg}`);
        console.error(`❌ Media workflow failed for ${link}: ${errorMsg}`);
      }
    }

    console.log(
      `📊 Media scraping completed sequentially: ${successful} successful, ${failed} failed`
    );

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
