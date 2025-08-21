import { proxyActivities, startChild, ParentClosePolicy } from '@temporalio/workflow';
import { ScrapingWorkflowInput } from '../types';

// Import activities with proper typing
import type * as scrapingActivities from '../activities/scraping';
import { pageScrapeWorkflow } from './pageScrapeWorkflow';

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

    let results: PromiseSettledResult<any>[] = [];

    const batchSize = input.batchSize ?? 5;

    if (input.force) {
      const pages = Array.from(
        { length: input.maxPages ?? maxPages - 1 },
        (_, i) => `${input.baseUrl}page/${i + 1}`
      );

      console.log(
        `🔄 Processing ${pages.length} pages in batches of `,
        batchSize
      );

      // Process pages in batches of 10

      for (let i = 0; i < pages.length; i += batchSize) {
        const batch = pages.slice(i, i + batchSize);
        console.log(
          `📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(pages.length / batchSize)} (${batch.length} pages)`
        );

        // Start all workflows in current batch
        const batchWorkflows = batch.map((page, index) =>
          startChild(pageScrapeWorkflow, {
            workflowId: `scrape-page-${Date.now()}-${index + 1}`,
            parentClosePolicy: ParentClosePolicy.ABANDON, // Let children complete independently
            workflowExecutionTimeout: '10m', // 10 minutes max per page
            workflowRunTimeout: '8m', // 8 minutes max per run
            args: [
              {
                pageUrl: page,
                force: input.force,
                baseUrl: input.baseUrl,
              },
            ],
          })
        );

        // Wait for current batch to complete before starting next batch
        const batchResults = await Promise.allSettled(batchWorkflows);
        results.push(...batchResults);

        // Log batch-specific results
        const batchSuccessful = batchResults.filter(r => r.status === 'fulfilled').length;
        const batchFailed = batchResults.filter(r => r.status === 'rejected').length;
        
        console.log(`✅ Batch ${Math.floor(i / batchSize) + 1} completed: ${batchSuccessful} successful, ${batchFailed} failed`);
        
        // Log failed workflow details for debugging
        batchResults.forEach((result, idx) => {
          if (result.status === 'rejected') {
            console.error(`❌ Page workflow failed for ${batch[idx]}: ${result.reason}`);
          }
        });
      }

      // Log batch results summary
      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;
      console.log(
        `📊 All batched processing completed: ${successful} successful, ${failed} failed`
      );
      console.log(`✅ Main scraping workflow waited for all ${results.length} child workflows to complete`);
    } else {
      for (let index = 1; index < (input.maxPages ?? maxPages); index++) {}
    }

    return {
      success: true,
      message: 'Scraping workflow completed successfully',
      baseUrl: input.baseUrl,
      requestedMaxPages: input.maxPages,
      discoveredMaxPages: maxPages,
      force: input.force,
      batchProcessing: input.force
        ? {
            totalPages: (input.maxPages ?? maxPages) - 1,
            batchSize: batchSize,
            successful: results.filter((r) => r.status === 'fulfilled').length,
            failed: results.filter((r) => r.status === 'rejected').length,
          }
        : undefined,
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
