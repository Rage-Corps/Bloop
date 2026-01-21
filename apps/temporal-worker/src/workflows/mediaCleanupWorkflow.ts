import { proxyActivities, sleep, continueAsNew } from '@temporalio/workflow';
import type * as activities from '../activities/mediaCleanup';

const { getMediaSourcesPaginated, validateMediaSource, deleteMediaSource } = proxyActivities<typeof activities>({
  startToCloseTimeout: '10 minutes',
  retry: {
    initialInterval: '1s',
    backoffCoefficient: 2,
    maximumInterval: '1 minute',
    maximumAttempts: 3,
  },
});

const PAGE_SIZE = 100;
const BATCH_SIZE = 10;

export interface MediaCleanupInput {
  offset?: number;
  brokenSourcesCount?: number;
  mediaDeletedCount?: number;
  totalSources?: number;
}

export interface MediaCleanupResult {
  totalProcessed: number;
  brokenSources: number;
  mediaDeleted: number;
}

export async function mediaCleanupWorkflow(input: MediaCleanupInput = {}): Promise<MediaCleanupResult> {
  let offset = input.offset ?? 0;
  let brokenSourcesCount = input.brokenSourcesCount ?? 0;
  let mediaDeletedCount = input.mediaDeletedCount ?? 0;
  let totalSources = input.totalSources;

  // First run: fetch initial page to get total count
  if (totalSources === undefined) {
    console.log('Starting Media Cleanup Workflow');
    const firstPage = await getMediaSourcesPaginated({ limit: PAGE_SIZE, offset: 0 });
    totalSources = firstPage.total;

    const totalPages = Math.ceil(totalSources! / PAGE_SIZE);
    console.log(`Found ${totalSources} sources to validate (${totalPages} pages)`);

    // Process first page
    const processResult = await processPage(firstPage.data, brokenSourcesCount, mediaDeletedCount, 1, totalPages);
    brokenSourcesCount = processResult.brokenSourcesCount;
    mediaDeletedCount = processResult.mediaDeletedCount;

    offset = PAGE_SIZE;

    // Continue with fresh history if more pages remain
    if (offset < totalSources!) {
      await continueAsNew<typeof mediaCleanupWorkflow>({
        offset,
        brokenSourcesCount,
        mediaDeletedCount,
        totalSources,
      });
    }
  } else {
    // Continuation run: process the current page
    const totalPages = Math.ceil(totalSources / PAGE_SIZE);
    const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

    console.log(`Continuing Media Cleanup Workflow at page ${currentPage}/${totalPages}`);

    const page = await getMediaSourcesPaginated({ limit: PAGE_SIZE, offset });

    const processResult = await processPage(page.data, brokenSourcesCount, mediaDeletedCount, currentPage, totalPages);
    brokenSourcesCount = processResult.brokenSourcesCount;
    mediaDeletedCount = processResult.mediaDeletedCount;

    offset += PAGE_SIZE;

    // Continue with fresh history if more pages remain
    if (offset < totalSources) {
      await continueAsNew<typeof mediaCleanupWorkflow>({
        offset,
        brokenSourcesCount,
        mediaDeletedCount,
        totalSources,
      });
    }
  }

  // Workflow complete - return final results
  console.log('Media Cleanup Workflow completed');
  console.log(`Results: ${brokenSourcesCount} broken sources removed, ${mediaDeletedCount} orphaned media deleted`);

  return {
    totalProcessed: totalSources ?? 0,
    brokenSources: brokenSourcesCount,
    mediaDeleted: mediaDeletedCount,
  };
}

async function processPage(
  data: Array<{ id: string; url: string; mediaId: string }>,
  brokenSourcesCount: number,
  mediaDeletedCount: number,
  currentPage: number,
  totalPages: number
): Promise<{ brokenSourcesCount: number; mediaDeletedCount: number }> {
  console.log(`Processing page ${currentPage}/${totalPages} (${data.length} sources)`);

  // Process this page in batches for parallel validation
  for (let i = 0; i < data.length; i += BATCH_SIZE) {
    const batch = data.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(data.length / BATCH_SIZE)} (${batch.length} sources)`);

    // Validate batch in parallel
    const results = await Promise.allSettled(batch.map(source => validateMediaSource(source.url)));

    // Process results
    for (let j = 0; j < results.length; j++) {
      const result = results[j];
      const source = batch[j];

      if (result.status === 'fulfilled') {
        const isValid = result.value;

        if (!isValid) {
          console.log(`Source broken: ${source.url}`);
          const deleteResult = await deleteMediaSource(source.id, source.mediaId);
          brokenSourcesCount++;
          if (deleteResult.mediaDeleted) {
            mediaDeletedCount++;
          }
        }
      } else {
        console.error(`Failed to validate source ${source.url} after retries:`, result.reason);
        // We skip if it permanently fails validation after retries
      }
    }

    // Rate limiting between batches
    if (i + BATCH_SIZE < data.length) {
      await sleep('500ms');
    }
  }

  return { brokenSourcesCount, mediaDeletedCount };
}
